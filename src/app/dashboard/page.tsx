// src/app/dashboard/page.tsx
"use client";

import { signOut } from "next-auth/react";
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <form action="/api/auth/signout" method="post">
          <button onClick={() => signOut()} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">
            Logout
          </button>
          {/* <Button variant="outline">Logout</Button> */}
        </form>
      </div>

      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Selamat datang, {session.user.name}!</h2>
        <p className="text-gray-600">Ini adalah halaman dashboard Anda.</p>
        <h2 className="text-xl font-semibold mb-4">Selamat datang, {session.user.name}!</h2>
        <pre className="text-sm bg-gray-100 p-4 rounded">{JSON.stringify(session, null, 2)}</pre>
      </div>
    </div>
  );
}
