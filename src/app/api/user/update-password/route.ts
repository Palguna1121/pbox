import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { compare, hash } from "@/lib/bcrypt";

export async function PATCH(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }

    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json({ error: "Password baru minimal 6 karakter" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user?.password) {
      return NextResponse.json({ error: "Akun ini menggunakan login Google, tidak memiliki password" }, { status: 400 });
    }

    const isMatch = await compare(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Password saat ini salah" }, { status: 400 });
    }

    const hashed = await hash(newPassword);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashed },
    });

    return NextResponse.json({ message: "Password berhasil diperbarui" });
  } catch (error) {
    console.error("Error updating password:", error);
    return NextResponse.json({ error: "Gagal memperbarui password" }, { status: 500 });
  }
}
