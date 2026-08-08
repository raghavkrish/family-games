"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PartyShell } from "@/components/shell/PartyShell";
import { createRoomCode } from "@/lib/room/client";
import { slamIn, staggerPop, useGsapReady, gsap, ScrollTrigger, Draggable } from "@/lib/motion";

export default function HomePage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const heroRef = useRef<HTMLDivElement>(null);
  const ready = useGsapReady();

  useEffect(() => {
    if (!ready || !heroRef.current) return;
    slamIn(heroRef.current.querySelector(".hero-title"));
    staggerPop(heroRef.current.querySelectorAll(".hero-card"));
    const steps = heroRef.current.querySelectorAll(".how-step");
    if (steps.length) {
      gsap.from(steps, {
        scrollTrigger: { trigger: ".how-block", start: "top 80%" },
        y: 40,
        opacity: 0,
        stagger: 0.12,
        duration: 0.5,
        ease: "back.out(1.6)",
      });
    }

    const path = heroRef.current.querySelector(".logo-stroke") as SVGPathElement | null;
    if (path) {
      const len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(path, { strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut" });
    }

    const stickers = Array.from(
      heroRef.current.querySelectorAll(".drag-sticker"),
    ) as HTMLElement[];
    const dragInstances = stickers.flatMap((el) =>
      Draggable.create(el, {
        type: "x,y",
        bounds: heroRef.current!,
        edgeResistance: 0.65,
      }),
    );

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
      dragInstances.forEach((d) => d.kill());
    };
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
        <div ref={heroRef} className="relative mx-auto flex w-full max-w-4xl flex-col gap-8">
          <div className="pointer-events-none absolute inset-0 -z-0 overflow-visible">
            <span className="drag-sticker pointer-events-auto absolute left-2 top-8 rotate-[-12deg] cursor-grab rounded-full border-4 border-ink bg-acid px-3 py-1 font-display text-ink shadow-[3px_3px_0_#111] active:cursor-grabbing">
              BUZZ
            </span>
            <span className="drag-sticker pointer-events-auto absolute right-4 top-24 rotate-[8deg] cursor-grab rounded-full border-4 border-ink bg-coral px-3 py-1 font-display text-ink shadow-[3px_3px_0_#111] active:cursor-grabbing">
              CONNEXION
            </span>
            <span className="drag-sticker pointer-events-auto absolute bottom-32 left-6 rotate-[6deg] cursor-grab rounded-full border-4 border-ink bg-cyan px-3 py-1 font-display text-ink shadow-[3px_3px_0_#111] active:cursor-grabbing">
              KOLLYWOOD
            </span>
          </div>
          <div className="text-center">
            <svg
              className="mx-auto mb-3 h-16 w-16"
              viewBox="0 0 64 64"
              fill="none"
              aria-hidden
            >
              <path
                className="logo-stroke"
                d="M8 40 L32 8 L56 40 L48 40 L48 56 L16 56 L16 40 Z"
                stroke="#ffc700"
                strokeWidth="4"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mb-2 font-display text-sm uppercase tracking-[0.3em] text-acid">
              Indoor night · 2 team buzzers · phones + TV
            </p>
            <h2 className="hero-title font-display text-5xl leading-none text-cream md:text-7xl">
              TAMIL PARTY
              <span className="block text-coral">GAME NIGHT</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-cream/75">
              Tent Kottai, Sound Party, Cinema Charades — one funky hub, wild GSAP energy, your
              living room as the stage.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="hero-card rounded-3xl border-4 border-ink bg-coral p-5 shadow-[8px_8px_0_#111]">
              <h3 className="font-display text-2xl text-ink">Host on the TV</h3>
              <p className="mt-2 text-ink/80">Create a room, flaunt the QR, run the night.</p>
              <button type="button" className="btn-chunky mt-4 bg-acid" onClick={host}>
                Create room
              </button>
            </div>
            <div className="hero-card rounded-3xl border-4 border-ink bg-cyan p-5 shadow-[8px_8px_0_#111]">
              <h3 className="font-display text-2xl text-ink">Join on your phone</h3>
              <p className="mt-1 text-sm text-ink/70">Then pick Team A or Team B as your buzzer.</p>
              <div className="mt-3 flex flex-col gap-2">
                <input
                  className="input-chunky uppercase tracking-widest"
                  placeholder="ROOM CODE"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                />
                <button type="button" className="btn-chunky bg-acid" onClick={join}>
                  Join party
                </button>
              </div>
            </div>
          </div>

          <div className="how-block grid gap-3 md:grid-cols-3">
            {[
              ["01", "Open Tent Kottai", "Picture connexions + buzzers"],
              ["02", "Blast Sound Party", "Tamil clips, name that song"],
              ["03", "Cinema Charades", "Act out Kollywood classics"],
            ].map(([n, t, d]) => (
              <div
                key={n}
                className="how-step rounded-2xl border-2 border-cream/20 bg-stage/60 p-4"
              >
                <p className="font-display text-acid">{n}</p>
                <p className="font-display text-xl text-cream">{t}</p>
                <p className="text-sm text-cream/60">{d}</p>
              </div>
            ))}
          </div>
        </div>
      }
      dock={
        <p className="text-center text-xs text-cream/50">
          Drop your own Tamil clips into the content pack — sample audio is a placeholder beep.
        </p>
      }
    />
  );
}
