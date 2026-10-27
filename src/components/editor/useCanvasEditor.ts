"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActiveSelection,
  Canvas,
  FabricImage,
  IText,
  PencilBrush,
  Rect,
  type FabricObject,
} from "fabric";
import {
  HISTORY_PROPS,
  applyAdjust,
  containInRect,
  coverInRect,
  ensureFont,
  loadFabricImage,
  lockAsBase,
  roleOf,
  slotClip,
  toObjectUrl,
  type PboxObject,
} from "./fabric-utils";
import { DEFAULT_ADJUST, type EditorMode, type FormalData, type FormalSize, type FrameData, type PhotoAdjust } from "./types";

const STICKER_LONG_SIDE = 1600;
const HISTORY_LIMIT = 60;
const REMOVABLE_ROLES = ["sticker", "text", "drawing", "shape"];

interface Options {
  mode: EditorMode;
  photos: string[];
  frame?: FrameData | null;
  formal?: FormalData | null;
}

export interface TextOptions {
  text?: string;
  fontFamily?: string;
  fill?: string;
  stroke?: string;
}

export function useCanvasEditor({ mode, photos, frame, formal }: Options) {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<Canvas | null>(null);
  const sizeRef = useRef({ w: 1000, h: 1000 });
  const zoomRef = useRef(1);
  const history = useRef<{ stack: string[]; index: number; restoring: boolean; timer: number | null }>({
    stack: [],
    index: -1,
    restoring: false,
    timer: null,
  });

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [size, setSize] = useState({ w: 1000, h: 1000 });
  const [zoom, setZoomState] = useState(1);
  const [active, setActive] = useState<PboxObject | null>(null);
  const [version, setVersion] = useState(0);
  // Snapshot of canvas objects for rendering; refs must not be read during render.
  const [objects, setObjects] = useState<PboxObject[]>([]);
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false });
  const [formalSize, setFormalSizeState] = useState<FormalSize | null>(formal?.sizes[0] ?? null);

  const bump = useCallback(() => {
    setVersion((v) => v + 1);
    setObjects([...((canvasRef.current?.getObjects() ?? []) as PboxObject[])]);
  }, []);

  const syncHistoryFlags = useCallback(() => {
    const h = history.current;
    setHistoryState({ canUndo: h.index > 0, canRedo: h.index < h.stack.length - 1 });
  }, []);

  const snapshot = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return "";
    return JSON.stringify({ size: sizeRef.current, canvas: c.toObject(HISTORY_PROPS) });
  }, []);

  /** Push the current canvas state onto the undo stack (debounced so drags make one entry). */
  const commit = useCallback(
    (immediate = false) => {
      const h = history.current;
      if (h.restoring) return;
      const run = () => {
        h.timer = null;
        const snap = snapshot();
        if (!snap || h.stack[h.index] === snap) return;
        h.stack = h.stack.slice(0, h.index + 1);
        h.stack.push(snap);
        if (h.stack.length > HISTORY_LIMIT) h.stack.shift();
        h.index = h.stack.length - 1;
        syncHistoryFlags();
        bump();
      };
      if (h.timer) window.clearTimeout(h.timer);
      if (immediate) run();
      else h.timer = window.setTimeout(run, 160);
    },
    [snapshot, syncHistoryFlags, bump],
  );

  const fitToStage = useCallback(() => {
    const c = canvasRef.current;
    const stage = stageRef.current;
    if (!c || !stage) return;
    const { w, h } = sizeRef.current;
    const pad = 24;
    const z = Math.max(0.05, Math.min((stage.clientWidth - pad) / w, (stage.clientHeight - pad) / h, 2));
    zoomRef.current = z;
    c.setDimensions({ width: Math.round(w * z), height: Math.round(h * z) });
    c.setZoom(z);
    c.requestRenderAll();
    setZoomState(z);
  }, []);

  const setLogicalSize = useCallback(
    (w: number, h: number) => {
      sizeRef.current = { w: Math.round(w), h: Math.round(h) };
      setSize(sizeRef.current);
      fitToStage();
    },
    [fitToStage],
  );

  const restore = useCallback(
    async (snap: string) => {
      const c = canvasRef.current;
      if (!c) return;
      const h = history.current;
      h.restoring = true;
      try {
        const data = JSON.parse(snap);
        await c.loadFromJSON(data.canvas);
        sizeRef.current = data.size;
        setSize(data.size);
        fitToStage();
        c.discardActiveObject();
        setActive(null);
        c.requestRenderAll();
      } finally {
        h.restoring = false;
        syncHistoryFlags();
        bump();
      }
    },
    [fitToStage, syncHistoryFlags, bump],
  );

  const undo = useCallback(async () => {
    const h = history.current;
    if (h.index <= 0) return;
    h.index -= 1;
    await restore(h.stack[h.index]);
  }, [restore]);

  const redo = useCallback(async () => {
    const h = history.current;
    if (h.index >= h.stack.length - 1) return;
    h.index += 1;
    await restore(h.stack[h.index]);
  }, [restore]);

  /* ─── Scene construction per mode ─────────────────────────── */

  const buildFrameScene = useCallback(
    async (c: Canvas, srcs: string[]) => {
      if (!frame) throw new Error("Frame belum dipilih");
      const overlay = await loadFabricImage(frame.imageUrl);
      setLogicalSize(overlay.width, overlay.height);
      c.backgroundColor = "#ffffff";

      const slots = [...frame.positions].sort((a, b) => a.y - b.y || a.x - b.x);
      const rects = slots.length ? slots : [{ id: "full", x: 0, y: 0, width: overlay.width, height: overlay.height }];

      for (let i = 0; i < rects.length; i++) {
        const img = await loadFabricImage(srcs[i % srcs.length]);
        coverInRect(img, rects[i]);
        img.clipPath = slotClip(rects[i]);
        img.set({ lockRotation: false, cornerStyle: "rect", transparentCorners: false });
        Object.assign(img, { pboxRole: "photo", pboxName: `Foto ${i + 1}`, pboxSlot: i, pboxAdjust: { ...DEFAULT_ADJUST } });
        c.add(img);
      }

      overlay.set({ left: 0, top: 0, originX: "left", originY: "top" });
      lockAsBase(overlay);
      Object.assign(overlay, { pboxRole: "frame", pboxName: frame.name });
      c.add(overlay);
    },
    [frame, setLogicalSize],
  );

  const buildStickerScene = useCallback(
    async (c: Canvas, srcs: string[]) => {
      const img = await loadFabricImage(srcs[0]);
      const k = STICKER_LONG_SIDE / Math.max(img.width, img.height);
      setLogicalSize(img.width * k, img.height * k);
      coverInRect(img, { x: 0, y: 0, width: sizeRef.current.w, height: sizeRef.current.h });
      lockAsBase(img);
      Object.assign(img, { pboxRole: "photo", pboxName: "Foto utama", pboxAdjust: { ...DEFAULT_ADJUST } });
      c.backgroundColor = "#0b0820";
      c.add(img);
    },
    [setLogicalSize],
  );

  const buildFormalScene = useCallback(
    async (c: Canvas, srcs: string[]) => {
      if (!formal) throw new Error("Latar formal belum dipilih");
      const s = formal.sizes[0];
      setLogicalSize(s?.width ?? 360, s?.height ?? 480);
      const full = { x: 0, y: 0, width: sizeRef.current.w, height: sizeRef.current.h };

      const bg = await loadFabricImage(formal.backgroundUrl);
      coverInRect(bg, full);
      lockAsBase(bg);
      Object.assign(bg, { pboxRole: "background", pboxName: `Latar ${formal.name}` });
      c.add(bg);

      const photo = await loadFabricImage(srcs[0]);
      coverInRect(photo, full);
      photo.set({ lockRotation: false, cornerStyle: "rect", transparentCorners: false });
      Object.assign(photo, { pboxRole: "photo", pboxName: "Foto", pboxAdjust: { ...DEFAULT_ADJUST } });
      c.add(photo);
    },
    [formal, setLogicalSize],
  );

  /* ─── Lifecycle ───────────────────────────────────────────── */

  useEffect(() => {
    const el = canvasElRef.current;
    if (!el || photos.length === 0) return;
    let disposed = false;
    const urls: string[] = [];

    const c = new Canvas(el, {
      preserveObjectStacking: true,
      selectionColor: "rgba(62,240,255,0.12)",
      selectionBorderColor: "#3ef0ff",
      selectionLineWidth: 2,
      controlsAboveOverlay: true,
      enableRetinaScaling: true,
    });
    canvasRef.current = c;

    const onSelect = () => setActive((c.getActiveObject() as PboxObject) ?? null);
    const onChange = () => commit();
    c.on("selection:created", onSelect);
    c.on("selection:updated", onSelect);
    c.on("selection:cleared", () => setActive(null));
    c.on("object:modified", onChange);
    c.on("object:added", onChange);
    c.on("object:removed", onChange);
    c.on("text:editing:exited", onChange);
    c.on("path:created", (e) => {
      Object.assign(e.path, { pboxRole: "drawing", pboxName: "Coretan" });
      commit();
    });

    (async () => {
      try {
        const srcs = await Promise.all(photos.map(toObjectUrl));
        urls.push(...srcs.filter((s) => s.startsWith("blob:")));
        if (disposed) return;
        history.current.restoring = true;
        if (mode === "frame") await buildFrameScene(c, srcs);
        else if (mode === "formal") await buildFormalScene(c, srcs);
        else await buildStickerScene(c, srcs);
        if (disposed) return;
        c.requestRenderAll();
        history.current.restoring = false;
        commit(true);
        setReady(true);
      } catch (err) {
        console.error(err);
        if (!disposed) setError(err instanceof Error ? err.message : "Editor gagal dimuat");
      } finally {
        history.current.restoring = false;
      }
    })();

    const ro = new ResizeObserver(() => fitToStage());
    if (stageRef.current) ro.observe(stageRef.current);

    return () => {
      disposed = true;
      ro.disconnect();
      canvasRef.current = null;
      c.dispose();
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
    // Scene is built once per mounted editor; parent remounts with a new key for new photos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─── Object actions ──────────────────────────────────────── */

  const center = () => ({ left: sizeRef.current.w / 2, top: sizeRef.current.h / 2 });

  const addSticker = useCallback(async (url: string, name: string) => {
    const c = canvasRef.current;
    if (!c) return;
    const img = await loadFabricImage(url);
    const { w, h } = sizeRef.current;
    const target = Math.min(w, h) * 0.28;
    const jitter = () => (Math.random() - 0.5) * Math.min(w, h) * 0.15;
    img.set({
      originX: "center",
      originY: "center",
      left: w / 2 + jitter(),
      top: h / 2 + jitter(),
      scaleX: target / img.width,
      scaleY: target / img.width,
      cornerStyle: "rect",
      transparentCorners: false,
    });
    Object.assign(img, { pboxRole: "sticker", pboxName: name });
    c.add(img);
    c.setActiveObject(img);
    c.requestRenderAll();
  }, []);

  const addText = useCallback(async (opts: TextOptions = {}) => {
    const c = canvasRef.current;
    if (!c) return;
    const fontFamily = opts.fontFamily ?? "Press Start 2P";
    await ensureFont(fontFamily);
    const { w, h } = sizeRef.current;
    const t = new IText(opts.text ?? "PLAYER 1", {
      ...center(),
      originX: "center",
      originY: "center",
      fontFamily,
      fontSize: Math.round(Math.min(w, h) * 0.07),
      fill: opts.fill ?? "#ffd23f",
      stroke: opts.stroke ?? "#0b0820",
      strokeWidth: Math.max(2, Math.round(Math.min(w, h) * 0.006)),
      paintFirst: "stroke",
      textAlign: "center",
      cornerStyle: "rect",
      transparentCorners: false,
    });
    Object.assign(t, { pboxRole: "text", pboxName: "Teks" });
    c.add(t);
    c.setActiveObject(t);
    c.requestRenderAll();
  }, []);

  const setDrawing = useCallback((on: boolean, color = "#ff3d7f", width = 12) => {
    const c = canvasRef.current;
    if (!c) return;
    c.isDrawingMode = on;
    if (on) {
      const brush = new PencilBrush(c);
      brush.color = color;
      brush.width = width;
      brush.decimate = 2;
      c.freeDrawingBrush = brush;
      c.discardActiveObject();
      c.requestRenderAll();
    }
  }, []);

  const updateActive = useCallback(
    (props: Record<string, unknown>) => {
      const c = canvasRef.current;
      const o = c?.getActiveObject();
      if (!c || !o) return;
      o.set(props);
      o.setCoords();
      c.requestRenderAll();
      commit();
      bump();
    },
    [commit, bump],
  );

  const deleteActive = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    // Photos, frame, and background are structural; removing them would leave holes.
    const deletable = c.getActiveObjects().filter((o) => REMOVABLE_ROLES.includes(roleOf(o) ?? ""));
    if (!deletable.length) return;
    c.discardActiveObject();
    deletable.forEach((o) => c.remove(o));
    c.requestRenderAll();
  }, []);

  const duplicateActive = useCallback(async () => {
    const c = canvasRef.current;
    const o = c?.getActiveObject() as PboxObject | undefined;
    if (!c || !o || o instanceof ActiveSelection) return;
    if (!REMOVABLE_ROLES.includes(o.pboxRole ?? "")) return;
    const copy = (await o.clone(["pboxRole", "pboxName"])) as PboxObject;
    copy.set({ left: (o.left ?? 0) + 24, top: (o.top ?? 0) + 24 });
    c.add(copy);
    c.setActiveObject(copy);
    c.requestRenderAll();
  }, []);

  const reorder = useCallback(
    (dir: "up" | "down" | "top" | "bottom", target?: FabricObject) => {
      const c = canvasRef.current;
      const o = target ?? c?.getActiveObject();
      if (!c || !o) return;
      if (dir === "up") c.bringObjectForward(o);
      if (dir === "down") c.sendObjectBackwards(o);
      if (dir === "top") c.bringObjectToFront(o);
      if (dir === "bottom") c.sendObjectToBack(o);
      c.requestRenderAll();
      commit();
      bump();
    },
    [commit, bump],
  );

  const flipActive = useCallback(
    (axis: "x" | "y") => {
      const c = canvasRef.current;
      const o = c?.getActiveObject();
      if (!c || !o) return;
      if (axis === "x") o.set("flipX", !o.flipX);
      else o.set("flipY", !o.flipY);
      c.requestRenderAll();
      commit();
      bump();
    },
    [commit, bump],
  );

  const rotateActive = useCallback(
    (deg: number) => {
      const c = canvasRef.current;
      const o = c?.getActiveObject();
      if (!c || !o) return;
      o.rotate(((o.angle ?? 0) + deg) % 360);
      o.setCoords();
      c.requestRenderAll();
      commit();
      bump();
    },
    [commit, bump],
  );

  const nudgeActive = useCallback(
    (dx: number, dy: number) => {
      const c = canvasRef.current;
      const o = c?.getActiveObject();
      if (!c || !o || o.lockMovementX) return;
      o.set({ left: (o.left ?? 0) + dx, top: (o.top ?? 0) + dy });
      o.setCoords();
      c.requestRenderAll();
      commit();
    },
    [commit],
  );

  const select = useCallback((o: FabricObject | null) => {
    const c = canvasRef.current;
    if (!c) return;
    if (!o) c.discardActiveObject();
    else if (o.selectable) c.setActiveObject(o);
    c.requestRenderAll();
    setActive((c.getActiveObject() as PboxObject) ?? null);
  }, []);

  const toggleVisible = useCallback(
    (o: FabricObject) => {
      const c = canvasRef.current;
      if (!c) return;
      o.set("visible", !o.visible);
      if (!o.visible && c.getActiveObject() === o) c.discardActiveObject();
      c.requestRenderAll();
      commit();
      bump();
    },
    [commit, bump],
  );

  const toggleLock = useCallback(
    (o: FabricObject) => {
      const c = canvasRef.current;
      if (!c || ["frame", "background"].includes(roleOf(o) ?? "")) return;
      const locked = !o.lockMovementX;
      o.set({
        lockMovementX: locked,
        lockMovementY: locked,
        lockScalingX: locked,
        lockScalingY: locked,
        lockRotation: locked,
        hasControls: !locked,
      });
      c.requestRenderAll();
      commit();
      bump();
    },
    [commit, bump],
  );

  /** Applies adjustments to the active photo, or to every photo when `all` is true. */
  const setAdjust = useCallback(
    (adjust: PhotoAdjust, all: boolean) => {
      const c = canvasRef.current;
      if (!c) return;
      const activePhoto = c.getActiveObject();
      const targets = c
        .getObjects()
        .filter((o) => roleOf(o) === "photo" && (all || o === activePhoto || !activePhoto || roleOf(activePhoto) !== "photo")) as FabricImage[];
      targets.forEach((img) => applyAdjust(img, adjust));
      c.requestRenderAll();
      commit();
      bump();
    },
    [commit, bump],
  );

  const getAdjustTarget = useCallback((): PhotoAdjust => {
    const photo = active?.pboxRole === "photo" ? active : objects.find((o) => o.pboxRole === "photo");
    return photo?.pboxAdjust ?? DEFAULT_ADJUST;
  }, [active, objects]);

  /** Sticker mode crop: change canvas aspect and re-cover the base photo. `null` restores the photo's own ratio. */
  const setAspect = useCallback(
    (ratio: number | null) => {
      const c = canvasRef.current;
      if (!c || mode !== "sticker") return;
      const base = c.getObjects().find((o) => roleOf(o) === "photo") as FabricImage | undefined;
      if (!base) return;
      const r = ratio ?? base.width / base.height;
      const w = r >= 1 ? STICKER_LONG_SIDE : STICKER_LONG_SIDE * r;
      const h = r >= 1 ? STICKER_LONG_SIDE / r : STICKER_LONG_SIDE;
      const old = sizeRef.current;
      setLogicalSize(w, h);
      coverInRect(base, { x: 0, y: 0, width: w, height: h });
      // Keep overlays roughly where they were relative to the canvas.
      c.getObjects()
        .filter((o) => o !== base)
        .forEach((o) => {
          o.set({ left: ((o.left ?? 0) / old.w) * w, top: ((o.top ?? 0) / old.h) * h });
          o.setCoords();
        });
      c.requestRenderAll();
      commit();
    },
    [mode, setLogicalSize, commit],
  );

  const setFormalSize = useCallback(
    (s: FormalSize) => {
      const c = canvasRef.current;
      if (!c || mode !== "formal") return;
      setFormalSizeState(s);
      setLogicalSize(s.width, s.height);
      const full = { x: 0, y: 0, width: s.width, height: s.height };
      c.getObjects().forEach((o) => {
        const role = roleOf(o);
        if (role === "background" && o instanceof FabricImage) coverInRect(o, full);
        else if (role === "background") o.set({ left: 0, top: 0, width: s.width, height: s.height });
        else if (role === "photo" && o instanceof FabricImage) coverInRect(o, full);
      });
      c.requestRenderAll();
      commit();
    },
    [mode, setLogicalSize, commit],
  );

  /** Replace the background layer with a solid color (formal) or set canvas color (others). */
  const setBackgroundColor = useCallback(
    (color: string) => {
      const c = canvasRef.current;
      if (!c) return;
      if (mode !== "formal") {
        c.backgroundColor = color;
        c.requestRenderAll();
        commit();
        return;
      }
      const old = c.getObjects().find((o) => roleOf(o) === "background");
      const rect = new Rect({ left: 0, top: 0, width: sizeRef.current.w, height: sizeRef.current.h, fill: color, originX: "left", originY: "top" });
      lockAsBase(rect);
      Object.assign(rect, { pboxRole: "background", pboxName: `Latar ${color}` });
      if (old) c.remove(old);
      c.add(rect);
      c.sendObjectToBack(rect);
      c.requestRenderAll();
      commit();
    },
    [mode, commit],
  );

  /** Swap the source of a photo layer while keeping its slot, clip, and filters. */
  const replacePhoto = useCallback(
    async (target: FabricImage, src: string, opts: { recover?: boolean } = {}) => {
      const c = canvasRef.current;
      if (!c) return;
      const url = await toObjectUrl(src);
      const adjust = (target as PboxObject).pboxAdjust;
      const keep = { left: target.left, top: target.top, angle: target.angle, flipX: target.flipX, flipY: target.flipY };
      const displayW = target.getScaledWidth();
      await target.setSrc(url, { crossOrigin: "anonymous" });
      if (opts.recover) {
        const slot = (target as PboxObject).pboxSlot;
        const rect =
          mode === "frame" && slot !== undefined && frame
            ? [...frame.positions].sort((a, b) => a.y - b.y || a.x - b.x)[slot] ?? { x: 0, y: 0, width: sizeRef.current.w, height: sizeRef.current.h }
            : { x: 0, y: 0, width: sizeRef.current.w, height: sizeRef.current.h };
        coverInRect(target, rect);
      } else {
        const k = displayW / target.width;
        target.set({ ...keep, scaleX: k, scaleY: k });
      }
      if (adjust) applyAdjust(target, adjust);
      target.setCoords();
      c.requestRenderAll();
      commit();
      bump();
    },
    [mode, frame, commit, bump],
  );

  const getPhotos = useCallback(
    () => objects.filter((o) => o.pboxRole === "photo") as unknown as FabricImage[],
    [objects],
  );

  const fitActive = useCallback(() => {
    const c = canvasRef.current;
    const o = c?.getActiveObject();
    if (!c || !(o instanceof FabricImage)) return;
    containInRect(o, { x: 0, y: 0, width: sizeRef.current.w, height: sizeRef.current.h }, 0.9);
    c.requestRenderAll();
    commit();
  }, [commit]);

  /** Render at print-friendly resolution regardless of on-screen zoom. */
  const exportImage = useCallback(async (format: "png" | "jpeg" = "png") => {
    const c = canvasRef.current;
    if (!c) throw new Error("Kanvas belum siap");
    c.discardActiveObject();
    c.isDrawingMode = false;
    c.requestRenderAll();
    const { w, h } = sizeRef.current;
    const target = mode === "formal" ? 3 : Math.min(4, Math.max(1, 2400 / Math.max(w, h)));
    const dataUrl = c.toDataURL({ format, quality: 0.92, multiplier: target / zoomRef.current });
    const blob = await (await fetch(dataUrl)).blob();
    return { blob, dataUrl, width: Math.round(w * target), height: Math.round(h * target) };
  }, [mode]);

  return {
    canvasElRef,
    stageRef,
    ready,
    error,
    size,
    zoom,
    version,
    active,
    objects,
    formalSize,
    ...historyState,
    undo,
    redo,
    commit,
    fitToStage,
    addSticker,
    addText,
    setDrawing,
    updateActive,
    deleteActive,
    duplicateActive,
    reorder,
    flipActive,
    rotateActive,
    nudgeActive,
    select,
    toggleVisible,
    toggleLock,
    setAdjust,
    getAdjustTarget,
    setAspect,
    setFormalSize,
    setBackgroundColor,
    replacePhoto,
    getPhotos,
    fitActive,
    exportImage,
  };
}

/** Editor API handed to panels; DOM refs stay with the component that renders the canvas. */
export type CanvasEditor = Omit<ReturnType<typeof useCanvasEditor>, "canvasElRef" | "stageRef">;
