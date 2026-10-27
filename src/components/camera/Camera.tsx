"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera as CameraIcon, FlipHorizontal2, ImageUp, Loader2, RefreshCw, Settings2, Volume2, VolumeX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/motion/segmented-control";
import { Kbd } from "@/components/motion/kbd";
import { cn } from "@/lib/utils";

type Source = "webcam" | "booth" | "upload";

interface CameraProps {
  /** Number of photos to take in one session (frame slots). */
  shots?: number;
  onComplete: (images: string[]) => void;
  /** Smaller chrome for use inside dialogs. */
  compact?: boolean;
  className?: string;
}

interface Prefs {
  deviceId?: string;
  resolution: "720" | "1080" | "2160";
  mirror: boolean;
  countdown: number;
  sound: boolean;
}

const DEFAULT_PREFS: Prefs = { resolution: "1080", mirror: true, countdown: 3, sound: true };
const PREFS_KEY = "pbox.camera.prefs";
const RES: Record<Prefs["resolution"], { width: number; height: number }> = {
  "720": { width: 1280, height: 720 },
  "1080": { width: 1920, height: 1080 },
  "2160": { width: 3840, height: 2160 },
};

function readPrefs(): Prefs {
  try {
    return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem(PREFS_KEY) ?? "{}") };
  } catch {
    return DEFAULT_PREFS;
  }
}

function savePrefs(p: Prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(p));
  } catch {
    // Private mode or blocked storage: preferences just won't persist.
  }
}

/** Square-wave chiptune beeps for the countdown. */
function useBeeper(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  return useCallback(
    (freq: number, ms = 90) => {
      if (!enabled || typeof window === "undefined") return;
      try {
        ctxRef.current ??= new AudioContext();
        const ctx = ctxRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + ms / 1000);
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + ms / 1000);
      } catch {
        // Audio is decoration only.
      }
    },
    [enabled],
  );
}

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function Camera({ shots = 1, onComplete, compact = false, className }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const runningRef = useRef(false);

  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [source, setSource] = useState<Source>("webcam");
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [status, setStatus] = useState<"idle" | "starting" | "live" | "denied" | "missing" | "insecure" | "error">("idle");
  const [booth, setBooth] = useState<{ enabled: boolean; connected: boolean }>({ enabled: false, connected: false });
  const [boothTick, setBoothTick] = useState(0);
  const [count, setCount] = useState<number | null>(null);
  const [flash, setFlash] = useState(0);
  const [taken, setTaken] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [announce, setAnnounce] = useState("");

  const beep = useBeeper(prefs.sound);
  const done = taken.length >= shots;

  // localStorage is unavailable during SSR, so saved preferences load after mount.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setPrefs(readPrefs()), []);

  const updatePrefs = (patch: Partial<Prefs>) => {
    setPrefs((p) => {
      const next = { ...p, ...patch };
      savePrefs(next);
      return next;
    });
  };

  /* ─── Webcam stream ─────────────────────────────────────── */

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startStream = useCallback(async () => {
    if (!window.isSecureContext) {
      setStatus("insecure");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("missing");
      return;
    }
    stopStream();
    setStatus("starting");
    const res = RES[prefs.resolution];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: prefs.deviceId
          ? { deviceId: { exact: prefs.deviceId }, width: { ideal: res.width }, height: { ideal: res.height } }
          : { facingMode: "user", width: { ideal: res.width }, height: { ideal: res.height } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      setStatus("live");
      // Labels are only exposed after permission is granted.
      const list = await navigator.mediaDevices.enumerateDevices();
      setDevices(list.filter((d) => d.kind === "videoinput"));
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError" || name === "SecurityError") setStatus("denied");
      else if (name === "NotFoundError" || name === "OverconstrainedError") {
        if (prefs.deviceId) {
          updatePrefs({ deviceId: undefined });
          return;
        }
        setStatus("missing");
      } else setStatus("error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefs.deviceId, prefs.resolution, stopStream]);

  useEffect(() => {
    if (source !== "webcam") {
      stopStream();
      return;
    }
    // Starting the camera is an external subscription; its status updates are intended.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void startStream();
    return stopStream;
  }, [source, startStream, stopStream]);

  /* ─── Booth agent (DSLR via local bridge) ───────────────── */

  useEffect(() => {
    let alive = true;
    fetch("/api/booth/status", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => {
        if (alive && s?.enabled) setBooth({ enabled: true, connected: !!s.camera?.connected });
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  /* ─── Capture ───────────────────────────────────────────── */

  const grabWebcam = useCallback((): string | null => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return null;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    if (prefs.mirror) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(v, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.92);
  }, [prefs.mirror]);

  const grabBooth = useCallback(async (): Promise<string | null> => {
    const res = await fetch("/api/booth/capture", { method: "POST" });
    if (!res.ok) return null;
    return blobToDataUrl(await res.blob());
  }, []);

  const runSession = useCallback(
    async (startIndex: number, only?: number) => {
      if (runningRef.current) return;
      runningRef.current = true;
      setBusy(true);
      const results = [...taken];
      const last = only !== undefined ? only + 1 : shots;
      try {
        for (let i = startIndex; i < last; i++) {
          setAnnounce(`Foto ${i + 1} dari ${shots}`);
          for (let n = prefs.countdown; n > 0; n--) {
            setCount(n);
            beep(n === 1 ? 880 : 660);
            await wait(1000);
          }
          setCount(0);
          beep(1320, 160);
          setFlash((f) => f + 1);
          const img = source === "booth" ? await grabBooth() : grabWebcam();
          setCount(null);
          if (!img) throw new Error("capture-failed");
          results[i] = img;
          setTaken([...results]);
          if (i < last - 1) await wait(900);
        }
        setAnnounce(`${results.length} foto siap`);
      } catch {
        setAnnounce("Gagal mengambil foto. Coba lagi.");
      } finally {
        setCount(null);
        setBusy(false);
        runningRef.current = false;
      }
    },
    [taken, shots, prefs.countdown, beep, source, grabBooth, grabWebcam],
  );

  const start = () => void runSession(taken.length);

  // Space/Enter as a shutter key, like a physical booth button.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A"].includes(el.tagName))) return;
      if ((e.key === " " || e.key === "Enter") && !busy && !done && (source === "booth" || status === "live")) {
        e.preventDefault();
        start();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files).slice(0, shots - taken.length);
    const urls = await Promise.all(list.map(blobToDataUrl));
    setTaken((t) => [...t, ...urls].slice(0, shots));
  };

  /* ─── Render ────────────────────────────────────────────── */

  const sourceOptions = [
    { value: "webcam", label: "Webcam" },
    ...(booth.enabled ? [{ value: "booth", label: "Kamera booth" }] : []),
    { value: "upload", label: "Unggah" },
  ];
  const canShoot = !busy && !done && (source === "booth" ? booth.connected : status === "live");

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl aria-label="Sumber foto" size="sm" value={source} options={sourceOptions} onValueChange={(v) => setSource(v as Source)} />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => updatePrefs({ sound: !prefs.sound })}
            className="grid size-11 place-items-center rounded-sm border-2 border-border bg-card hover:bg-muted"
            aria-label={prefs.sound ? "Matikan suara hitung mundur" : "Nyalakan suara hitung mundur"}
            aria-pressed={prefs.sound}
          >
            {prefs.sound ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </button>
          {source === "webcam" && (
            <button
              type="button"
              onClick={() => setShowSettings((s) => !s)}
              className={cn("grid size-11 place-items-center rounded-sm border-2 border-border bg-card hover:bg-muted", showSettings && "border-primary")}
              aria-label="Pengaturan kamera"
              aria-expanded={showSettings}
              aria-controls="camera-settings"
            >
              <Settings2 className="size-4" />
            </button>
          )}
        </div>
      </div>

      {showSettings && source === "webcam" && (
        <div id="camera-settings" className="arcade-panel grid gap-4 p-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm font-medium">
            Kamera
            <select
              className="min-h-11 w-full rounded-sm border-2 border-border bg-input px-3"
              value={prefs.deviceId ?? ""}
              onChange={(e) => updatePrefs({ deviceId: e.target.value || undefined })}
            >
              <option value="">Otomatis (kamera depan)</option>
              {devices.map((d, i) => (
                <option key={d.deviceId} value={d.deviceId}>{d.label || `Kamera ${i + 1}`}</option>
              ))}
            </select>
          </label>
          <div className="space-y-1.5 text-sm font-medium">
            <span>Resolusi</span>
            <SegmentedControl
              aria-label="Resolusi"
              size="sm"
              fullWidth
              value={prefs.resolution}
              options={[{ value: "720", label: "720p" }, { value: "1080", label: "1080p" }, { value: "2160", label: "4K" }]}
              onValueChange={(v) => updatePrefs({ resolution: v as Prefs["resolution"] })}
            />
          </div>
          <div className="space-y-1.5 text-sm font-medium">
            <span>Hitung mundur</span>
            <SegmentedControl
              aria-label="Hitung mundur"
              size="sm"
              fullWidth
              value={String(prefs.countdown)}
              options={[{ value: "3", label: "3 dtk" }, { value: "5", label: "5 dtk" }, { value: "10", label: "10 dtk" }]}
              onValueChange={(v) => updatePrefs({ countdown: Number(v) })}
            />
          </div>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 self-end text-sm font-medium">
            <input type="checkbox" className="size-5" checked={prefs.mirror} onChange={(e) => updatePrefs({ mirror: e.target.checked })} />
            <FlipHorizontal2 className="size-4" aria-hidden /> Mode cermin
          </label>
          <p className="text-sm text-muted-foreground sm:col-span-2">
            Kamera USB, capture card HDMI, dan kamera mirrorless dengan mode webcam (UVC) muncul di daftar ini.
          </p>
        </div>
      )}

      {/* Screen */}
      <div className={cn("relative overflow-hidden rounded-md border-2 border-ink bg-[#05030f] shadow-arcade-lg", compact ? "aspect-video" : "aspect-[4/3] sm:aspect-video")}>
        {source === "webcam" && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={cn("absolute inset-0 size-full object-cover", prefs.mirror && "-scale-x-100")}
            aria-label="Pratinjau kamera"
          />
        )}
        {source === "booth" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/booth/preview?t=${boothTick}`}
            alt="Pratinjau kamera booth"
            className="absolute inset-0 size-full object-cover"
            onLoad={() => setTimeout(() => setBoothTick((t) => t + 1), 250)}
            onError={() => setTimeout(() => setBoothTick((t) => t + 1), 1500)}
          />
        )}
        {source === "upload" && (
          <div className="absolute inset-0 grid place-items-center p-6 text-center">
            <div className="space-y-4">
              <ImageUp className="mx-auto size-10 text-primary" aria-hidden />
              <p className="max-w-sm text-sm text-[#f5efe0]">
                Pilih {shots > 1 ? `${shots - taken.length} foto` : "foto"} dari perangkat. JPG, PNG, atau WebP.
              </p>
              <Button variant="secondary" onClick={() => fileRef.current?.click()} disabled={done}>Pilih file</Button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple={shots > 1} className="sr-only" onChange={(e) => { void onFiles(e.target.files); e.target.value = ""; }} />
            </div>
          </div>
        )}

        <div className="crt-lines absolute inset-0" aria-hidden />

        {/* HUD */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-3 font-pixel text-[0.55rem] text-[#f5efe0]">
          <span className="flex items-center gap-2">
            {(status === "live" || source === "booth") && <span className="size-2 animate-blink bg-[#ff3d7f]" aria-hidden />}
            {source === "upload" ? "UPLOAD" : "LIVE"}
          </span>
          <span>SHOT {Math.min(taken.length + 1, shots)}/{shots}</span>
        </div>

        {source === "webcam" && status !== "live" && (
          <div className="absolute inset-0 grid place-items-center bg-[#05030f]/90 p-6 text-center text-[#f5efe0]">
            <div className="max-w-sm space-y-3">
              {status === "starting" && <Loader2 className="mx-auto size-8 animate-spin text-[#ffd23f]" aria-label="Menyalakan kamera" />}
              {status === "denied" && (
                <>
                  <p className="font-pixel text-xs text-[#ff3d7f]">AKSES DITOLAK</p>
                  <p className="text-sm">Izin kamera diblokir. Buka ikon gembok di bilah alamat, izinkan Kamera, lalu coba lagi. Atau pakai Unggah.</p>
                </>
              )}
              {status === "missing" && (
                <>
                  <p className="font-pixel text-xs text-[#ff3d7f]">KAMERA TIDAK DITEMUKAN</p>
                  <p className="text-sm">Sambungkan webcam atau pilih Unggah untuk memakai foto dari perangkat.</p>
                </>
              )}
              {status === "insecure" && (
                <>
                  <p className="font-pixel text-xs text-[#ff3d7f]">BUTUH HTTPS</p>
                  <p className="text-sm">Browser hanya mengizinkan kamera di HTTPS atau localhost.</p>
                </>
              )}
              {status === "error" && <p className="text-sm">Kamera gagal dinyalakan. Mungkin sedang dipakai aplikasi lain.</p>}
              {status !== "starting" && (
                <Button variant="outline" size="sm" onClick={() => void startStream()}>
                  <RefreshCw /> Coba lagi
                </Button>
              )}
            </div>
          </div>
        )}

        {count !== null && count > 0 && (
          <div className="absolute inset-0 grid place-items-center bg-[#05030f]/40" aria-hidden>
            <span key={count} className="font-pixel text-outline text-[clamp(4rem,18vw,9rem)] leading-none text-[#ffd23f] animate-in zoom-in-50 duration-300">
              {count}
            </span>
          </div>
        )}
        {count === 0 && (
          <div className="absolute inset-0 grid place-items-center" aria-hidden>
            <span className="font-pixel text-outline text-3xl text-[#ff3d7f]">SENYUM!</span>
          </div>
        )}
        {flash > 0 && <div key={flash} className="pointer-events-none absolute inset-0 animate-flash bg-white" aria-hidden />}
      </div>

      <p className="sr-only" aria-live="assertive">{announce}</p>

      {/* Shots strip */}
      {shots > 1 || taken.length > 0 ? (
        <ol className="flex gap-2 overflow-x-auto pb-1" aria-label="Foto yang sudah diambil">
          {Array.from({ length: shots }).map((_, i) => (
            <li key={i} className="relative shrink-0">
              <div className={cn("grid aspect-[4/3] w-24 place-items-center overflow-hidden rounded-sm border-2 bg-muted", taken[i] ? "border-ink" : "border-dashed border-border")}>
                {taken[i] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={taken[i]} alt={`Foto ${i + 1}`} className="size-full object-cover" />
                ) : (
                  <span className="font-mono text-xl text-muted-foreground">{i + 1}</span>
                )}
              </div>
              {taken[i] && !busy && (
                <button
                  type="button"
                  onClick={() => {
                    if (source === "upload") setTaken((t) => t.filter((_, j) => j !== i));
                    else void runSession(i, i);
                  }}
                  className="absolute -right-1.5 -top-1.5 grid size-7 place-items-center rounded-sm border-2 border-ink bg-coin text-[#0b0820]"
                  aria-label={source === "upload" ? `Hapus foto ${i + 1}` : `Ambil ulang foto ${i + 1}`}
                >
                  {source === "upload" ? <X className="size-3.5" /> : <RefreshCw className="size-3.5" />}
                </button>
              )}
            </li>
          ))}
        </ol>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        {!done && source !== "upload" && (
          <Button size="lg" onClick={start} disabled={!canShoot} className="min-w-48">
            {busy ? <Loader2 className="animate-spin" /> : <CameraIcon />}
            {busy ? "Bersiap…" : taken.length ? `Ambil foto ${taken.length + 1}` : shots > 1 ? `Mulai ${shots} jepretan` : "Ambil foto"}
          </Button>
        )}
        {done && (
          <Button size="lg" variant="secondary" onClick={() => onComplete(taken.slice(0, shots))} className="min-w-48">
            Lanjut ke editor
          </Button>
        )}
        {taken.length > 0 && !busy && (
          <Button variant="ghost" onClick={() => setTaken([])}>
            <RefreshCw /> Ulang semua
          </Button>
        )}
        {!compact && source !== "upload" && !done && (
          <span className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
            atau tekan <Kbd>space</Kbd>
          </span>
        )}
      </div>
      {source === "booth" && !booth.connected && (
        <p className="text-sm text-destructive">Agen booth aktif, tapi kamera belum terdeteksi. Cek kabel USB dan mode kamera (PC/Remote).</p>
      )}
    </div>
  );
}
