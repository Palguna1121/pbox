"use client";

import { Link } from "lucide-react";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";

export default function Dashboard() {
  const { data: session } = useSession();

  console.log(session);

  return (
    <div className="p-4 mt-20">
      <h1 className="text-xl font-bold">Dashboard</h1>
      <p>Halo {session?.user.name}!</p>
      {session?.user.role === "admin" ? <a href="/admin/home">Go to Admin Panel</a> : null}
      <br />
      <button onClick={() => confirm("Anda yakin ingin keluar?") && signOut()} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">
        Logout
      </button>
    </div>
  );
}
