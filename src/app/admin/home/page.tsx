"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFrames: 0,
    totalStickers: 0,
    totalTransactions: 100, // Statis untuk sementara
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get("/api/admin/stats");
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    }
    fetchData();
  }, []);

  return (
    <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Total Users</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-bold">{stats.totalUsers}</CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Total Frame Catalog</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-bold">{stats.totalFrames}</CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Total Sticker Catalog</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-bold">{stats.totalStickers}</CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Total Transactions</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-bold">{stats.totalTransactions}</CardContent>
      </Card>
    </main>
  );
}
