"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, CheckCircle2 } from "lucide-react";
import { PageIntro } from "@/components/arcade/PageIntro";

const nameSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
    newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

type NameForm = z.infer<typeof nameSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const { toast } = useToast();
  const [savingName, setSavingName] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const nameForm = useForm<NameForm>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: session?.user?.name ?? "" },
  });

  // Session loads after first render; fill the name once it arrives.
  const sessionName = session?.user?.name;
  useEffect(() => {
    if (sessionName && !nameForm.formState.isDirty) nameForm.reset({ name: sessionName });
  }, [sessionName, nameForm]);

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const handleNameSubmit = async (data: NameForm) => {
    setSavingName(true);
    try {
      const res = await fetch("/api/user/update-name", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Gagal memperbarui nama");
      }
      await update({ name: data.name });
      toast({ title: "Nama berhasil diperbarui" });
    } catch (err) {
      toast({ title: "Gagal", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    } finally {
      setSavingName(false);
    }
  };

  const handlePasswordSubmit = async (data: PasswordForm) => {
    setSavingPassword(true);
    try {
      const res = await fetch("/api/user/update-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: data.currentPassword, newPassword: data.newPassword }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Gagal memperbarui password");
      }
      passwordForm.reset();
      toast({ title: "Password berhasil diperbarui" });
    } catch (err) {
      toast({ title: "Gagal", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <main className="mx-auto max-w-xl px-4 py-10 sm:px-6 sm:py-14">
      <PageIntro label="Options" title="Pengaturan" description="Ubah nama tampilan dan password akun." className="mb-10" />

      <div className="space-y-6">
        <div className="arcade-panel p-6 sm:p-8">
          <h2 className="mb-5 font-display text-2xl font-bold">Ubah nama</h2>
          <form onSubmit={nameForm.handleSubmit(handleNameSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nama</Label>
              <Input
                id="name"
                {...nameForm.register("name")}
                aria-invalid={!!nameForm.formState.errors.name}
                aria-describedby="name-error"
                placeholder="Nama lengkapmu"
              />
              {nameForm.formState.errors.name && (
                <p id="name-error" role="alert" className="text-sm text-destructive">{nameForm.formState.errors.name.message}</p>
              )}
            </div>
            <Button type="submit" disabled={savingName}>
              {savingName ? <Loader2 className="animate-spin" /> : <CheckCircle2  />}
              Simpan nama
            </Button>
          </form>
        </div>

        <div className="arcade-panel p-6 sm:p-8">
          <h2 className="mb-5 font-display text-2xl font-bold">Ubah password</h2>
          <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">Password saat ini</Label>
              <Input
                id="currentPassword"
                type="password"
                {...passwordForm.register("currentPassword")}
                aria-invalid={!!passwordForm.formState.errors.currentPassword}
                aria-describedby="currentPassword-error"
                placeholder="••••••••"
              />
              {passwordForm.formState.errors.currentPassword && (
                <p id="currentPassword-error" role="alert" className="text-sm text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">Password baru</Label>
              <Input
                id="newPassword"
                type="password"
                {...passwordForm.register("newPassword")}
                aria-invalid={!!passwordForm.formState.errors.newPassword}
                aria-describedby="newPassword-error"
                placeholder="Min. 6 karakter"
              />
              {passwordForm.formState.errors.newPassword && (
                <p id="newPassword-error" role="alert" className="text-sm text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Konfirmasi Password baru</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...passwordForm.register("confirmPassword")}
                aria-invalid={!!passwordForm.formState.errors.confirmPassword}
                aria-describedby="confirmPassword-error"
                placeholder="Ulangi password baru"
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p id="confirmPassword-error" role="alert" className="text-sm text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>
            <Button type="submit" disabled={savingPassword}>
              {savingPassword ? <Loader2 className="animate-spin" /> : <CheckCircle2  />}
              Simpan password
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
