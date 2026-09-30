"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, CheckCircle2 } from "lucide-react";

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
    } catch (err: any) {
      toast({ title: "Gagal", description: err.message, variant: "destructive" });
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
    } catch (err: any) {
      toast({ title: "Gagal", description: err.message, variant: "destructive" });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <main className="max-w-lg mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-1">Akun</p>
        <h1 className="text-4xl font-black tracking-tighter">
          Peng<span className="text-primary">aturan</span>
        </h1>
      </div>

      <div className="space-y-4">
        <div className="bg-card rounded-3xl border border-border p-6 sm:p-8">
          <h2 className="font-black text-lg tracking-tight mb-5">Ubah Nama</h2>
          <form onSubmit={nameForm.handleSubmit(handleNameSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-semibold">Nama</Label>
              <Input
                id="name"
                {...nameForm.register("name")}
                className="rounded-xl h-11"
                placeholder="Nama lengkapmu"
              />
              {nameForm.formState.errors.name && (
                <p className="text-xs text-destructive">{nameForm.formState.errors.name.message}</p>
              )}
            </div>
            <Button type="submit" disabled={savingName} className="rounded-full px-6">
              {savingName ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              Simpan Nama
            </Button>
          </form>
        </div>

        <div className="bg-card rounded-3xl border border-border p-6 sm:p-8">
          <h2 className="font-black text-lg tracking-tight mb-5">Ubah Password</h2>
          <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword" className="text-sm font-semibold">Password Saat Ini</Label>
              <Input
                id="currentPassword"
                type="password"
                {...passwordForm.register("currentPassword")}
                className="rounded-xl h-11"
                placeholder="••••••••"
              />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-xs text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newPassword" className="text-sm font-semibold">Password Baru</Label>
              <Input
                id="newPassword"
                type="password"
                {...passwordForm.register("newPassword")}
                className="rounded-xl h-11"
                placeholder="Min. 6 karakter"
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-xs text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold">Konfirmasi Password Baru</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...passwordForm.register("confirmPassword")}
                className="rounded-xl h-11"
                placeholder="Ulangi password baru"
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-xs text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>
            <Button type="submit" disabled={savingPassword} className="rounded-full px-6">
              {savingPassword ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              Simpan Password
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
