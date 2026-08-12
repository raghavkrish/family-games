"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PartyShell } from "@/components/shell/PartyShell";
import { createRoomCode } from "@/lib/room/client";
import { heroEnter, useGsapReady } from "@/lib/motion";

export default function HomePage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const heroRef = useRef<HTMLDivElement>(null);
  const ready = useGsapReady();

  useEffect(() => {
    if (!ready || !heroRef.current) return;
    return heroEnter(heroRef.current);
  }, [ready]);

  const host = () => {
    const code = createRoomCode();
    router.push(`/host/${code}`);
  };

  const join = () => {
    if (!joinCode.trim()) return;
    router.push(`/play/${joinCode.trim().toUpperCase()}`);
  };

  return (
    <PartyShell
      density="landing"
      stageKey="landing"
      stage={
        <div
          ref={heroRef}
          className="relative mx-auto flex min-h-[74dvh] w-full max-w-6xl flex-col justify-center overflow-x-clip"
          style={{ perspective: "900px" }}
        >
          <div
            className="lamp-glow pointer-events-none absolute left-1/2 top-[-10%] z-0 h-64 w-64 -translate-x-1/2 rounded-full bg-acid/40 blur-3xl md:h-[22rem] md:w-[22rem]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(255,42,31,0.28),transparent_55%)]"
            aria-hidden
          />

          <div
            className="sticker-rail pointer-events-none absolute inset-y-0 left-0 z-[1] hidden w-[5.5rem] md:block lg:w-28"
            data-sticker-rail
            aria-hidden
          >
            <span className="drag-sticker pointer-events-auto absolute left-1 top-3 rotate-[-14deg] cursor-grab rounded-full border-4 border-ink bg-acid px-3 py-1.5 font-display text-sm text-ink shadow-[4px_4px_0_#07040a] active:cursor-grabbing lg:left-2 lg:top-6 lg:text-base">
              BUZZ
            </span>
            <span className="drag-sticker pointer-events-auto absolute left-2 bottom-24 rotate-[10deg] cursor-grab rounded-full border-4 border-ink bg-coral px-3 py-1.5 font-display text-sm text-ink shadow-[4px_4px_0_#07040a] active:cursor-grabbing">
              TV
            </span>
          </div>
          <div
            className="sticker-rail pointer-events-none absolute inset-y-0 right-0 z-[1] hidden w-[6rem] md:block lg:w-32"
            data-sticker-rail
            aria-hidden
          >
            <span className="drag-sticker pointer-events-auto absolute right-1 top-10 rotate-[9deg] cursor-grab rounded-full border-4 border-ink bg-coral px-3 py-1.5 font-display text-sm text-ink shadow-[4px_4px_0_#07040a] active:cursor-grabbing lg:right-2 lg:top-14 lg:text-base">
              TERRACE
            </span>
            <span className="drag-sticker pointer-events-auto absolute bottom-16 right-1 rotate-[7deg] cursor-grab rounded-full border-4 border-ink bg-cyan px-3 py-1.5 font-display text-sm text-ink shadow-[4px_4px_0_#07040a] active:cursor-grabbing lg:bottom-20 lg:right-2 lg:text-base">
              KOLLYWOOD
            </span>
            <span className="drag-sticker pointer-events-auto absolute right-2 top-1/2 -translate-y-1/2 rotate-[-8deg] cursor-grab rounded-full border-4 border-ink bg-acid px-3 py-1.5 font-display text-sm text-ink shadow-[4px_4px_0_#07040a] active:cursor-grabbing">
              PARTY
            </span>
          </div>

          <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center gap-10 px-4 text-center md:px-6">
            <div className="hero-copy">
              <svg
                className="mx-auto mb-5 h-16 w-16 md:h-20 md:w-20"
                viewBox="0 0 64 64"
                fill="none"
                aria-hidden
              >
                <path
                  className="logo-stroke"
                  d="M8 40 L32 8 L56 40 L48 40 L48 56 L16 56 L16 40 Z"
                  stroke="#ffe566"
                  strokeWidth="4"
                  strokeLinejoin="round"
                />
              </svg>
              <h1
                className="hero-title font-display text-6xl leading-[0.88] text-cream drop-shadow-[4px_4px_0_#ff2a1f] md:text-8xl lg:text-9xl"
                style={{ transformStyle: "preserve-3d" }}
              >
                KOLLYWOOD
                <span className="block text-acid drop-shadow-[4px_4px_0_#07040a]">GAMES</span>
                <span className="block text-coral drop-shadow-[4px_4px_0_#07040a]">NIGHT</span>
              </h1>
              <p className="hero-sub mx-auto mt-5 max-w-lg text-lg text-cream/85 md:text-xl">
                Phones as buzzers. TV as the stage. Tent Kottai, Sound Party, Charades.
              </p>
            </div>

            <div className="hero-actions flex w-full flex-col gap-4 sm:flex-row sm:justify-center">
              <button
                type="button"
                className="hero-cta btn-chunky bg-coral px-10 py-5 text-2xl text-ink md:text-3xl"
                onClick={host}
              >
                Host on TV
              </button>
              <div className="hero-cta flex flex-1 gap-2 sm:max-w-md">
                <input
                  className="input-chunky min-w-0 flex-1 py-4 text-center text-xl uppercase tracking-widest"
                  placeholder="CODE"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") join();
                  }}
                />
                <button
                  type="button"
                  className="btn-chunky bg-cyan px-6 py-4 text-xl text-ink"
                  onClick={join}
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>
      }
      dock={
        <p className="text-center text-xs text-cream/50">
          Two teams · one room code · keep phones unlocked
        </p>
      }
    />
  );
}
