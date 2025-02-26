// src/lib/bcrypt.ts
import bcrypt from "bcrypt";

export async function hash(password: string) {
  return await bcrypt.hash(password, 10);
}

export async function compare(password: string, hashedPassword: string) {
  return await bcrypt.compare(password, hashedPassword);
}
