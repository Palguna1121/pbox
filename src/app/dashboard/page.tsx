"use client";

import { useSession } from "next-auth/react";

export default function Dashboard() {
  const { data: session } = useSession();

  return (
    <div className="p-4 mt-20">
      <h1 className="text-xl font-bold">Dashboard</h1>
      <p>Halo {session?.user.name}!</p>
      {session?.user.role === "admin" ? <a href="/admin/home">Go to Admin Panel</a> : null}
    </div>
  );
}
