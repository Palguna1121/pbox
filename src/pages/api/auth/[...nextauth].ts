// src/pages/api/auth/[...nextauth].ts
import { authOptions } from "@/lib/auth";
import NextAuth from "next-auth";

export default NextAuth(authOptions);
