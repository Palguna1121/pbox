import Image from "next/image";
import { Hero } from "./components/Hero";
import { Testi } from "./components/Testi";

export default function Home() {
  return (
    <div className="flex flex-col items-center p-6">
      <Hero />
      <Testi />
    </div>
  );
}
