import { Geist, Geist_Mono } from "next/font/google";
import TextAreaZpl from "../components/TextAreaZpl";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <div
      className={`${geistSans.className} ${geistMono.className} flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black`}
    >
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center gap-28 py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="mb-8 text-4xl font-bold text-zinc-900 dark:text-zinc-100">
          Generador de Etiquetas ZPL con Next.js
        </h1>
        <TextAreaZpl />
      </main>
    </div>
  );
}
