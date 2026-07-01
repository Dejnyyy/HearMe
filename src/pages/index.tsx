import React, { useEffect, useRef } from "react";
import Head from "next/head";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  type MotionValue,
} from "framer-motion";
import {
  ThumbsUp,
  Music2,
  Music4,
  AudioLines,
  ArrowRight,
} from "lucide-react";

/* ==================================================================== */
/*  Motion primitives                                                    */
/* ==================================================================== */
const reveal = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0 },
};

const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/* ==================================================================== */
/*  Primary CTA — clean warm-black with a gold arrow accent.             */
/* ==================================================================== */
const CTA: React.FC<{
  status: string;
  label: string;
  size?: "sm" | "lg";
  variant?: "dark" | "light";
}> = ({ status, label, size = "lg", variant = "dark" }) => (
  <motion.button
    onClick={() => signIn("spotify")}
    disabled={status === "loading"}
    whileHover={{ scale: 1.07 }}
    whileTap={{ scale: 0.95 }}
    transition={{ type: "spring", stiffness: 500, damping: 16, mass: 0.6 }}
    className={`group inline-flex items-center justify-center gap-2.5 rounded-full font-bold transition-colors duration-300 disabled:opacity-60 ${
      variant === "light"
        ? "bg-white text-gray-900 ring-1 ring-black/5 hover:bg-gold-50 [box-shadow:0_16px_40px_-14px_rgba(0,0,0,0.45)]"
        : "bg-[#1a150d] text-white ring-1 ring-white/10 hover:bg-[#26200f] [box-shadow:0_16px_38px_-14px_rgba(26,21,13,0.6)] hover:[box-shadow:0_24px_50px_-16px_rgba(166,124,61,0.55)]"
    } ${
      size === "lg"
        ? "px-9 py-4 text-base"
        : "px-6 py-2.5 text-sm sm:px-7 sm:py-3 sm:text-[15px]"
    }`}
  >
    {status === "loading" ? "Loading…" : label}
    <ArrowRight
      className={`transition-transform duration-300 group-hover:translate-x-1 ${
        variant === "light" ? "text-gold-600" : "text-white"
      } ${size === "lg" ? "h-[18px] w-[18px]" : "h-4 w-4"}`}
    />
  </motion.button>
);

/* ==================================================================== */
/*  Interactive soundwave — the hero centerpiece.                        */
/*  Mirrors the logo's frequency motif and reacts to the cursor.         */
/* ==================================================================== */
const BAR_COUNT = 110;

const Soundwave: React.FC = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const bars = useRef<Array<HTMLSpanElement | null>>([]);
  const pointer = useRef({ x: 0.5, active: false });

  useEffect(() => {
    const reduced = prefersReduced();
    let raf = 0;
    const t0 = performance.now();
    let last = t0;
    let phase = 0; // accumulated "warped" time so speed can vary

    const tick = (now: number) => {
      const real = (now - t0) / 1000;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // speed drifts irregularly but stays brisk (always faster than before)
      const speed = reduced
        ? 0
        : 1.7 + 1.2 * (0.5 + 0.5 * Math.sin(real * 0.33 + Math.sin(real * 0.12) * 1.6));
      phase += dt * speed;

      // global "energy" from incommensurate sines → occasional big swells,
      // occasional near-silence. Power bias keeps it calm most of the time.
      const e1 = 0.5 + 0.5 * Math.sin(real * 0.55);
      const e2 = 0.5 + 0.5 * Math.sin(real * 0.34 + 1.3);
      const e3 = 0.5 + 0.5 * Math.sin(real * 0.91 + 2.7);
      const energy = reduced ? 0 : Math.pow(e1 * 0.5 + e2 * 0.3 + e3 * 0.2, 1.9);

      const n = bars.current.length;
      for (let i = 0; i < n; i++) {
        const el = bars.current[i];
        if (!el) continue;
        const p = n === 1 ? 0 : i / (n - 1);

        let idle;
        if (reduced) {
          idle = 0.42;
        } else {
          const wave =
            0.62 * (0.5 + 0.5 * Math.sin(phase * 2.0 + i * 0.55)) +
            0.38 *
              (0.5 + 0.5 * Math.sin(phase * 3.2 + i * 0.27 + Math.sin(real * 0.4) * 2.5));
          idle = 0.12 + (0.1 + 0.72 * energy) * wave;
        }

        // cursor lifts the bars nearest to it (gaussian falloff)
        const d = p - pointer.current.x;
        const lift = pointer.current.active
          ? Math.exp(-(d * d) / (2 * 0.0004)) * 0.9
          : 0;

        const s = Math.min(1, idle + lift);
        el.style.height = `${(s * 100).toFixed(2)}%`;
        el.style.opacity = (0.5 + 0.5 * s).toFixed(3);
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const onMove = (e: React.PointerEvent) => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r) return;
    pointer.current = { x: (e.clientX - r.left) / r.width, active: true };
  };
  const onLeave = () => {
    pointer.current.active = false;
  };

  return (
    <div
      ref={wrapRef}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="flex h-40 w-full items-center justify-between gap-[4px] overflow-hidden px-4 sm:h-48 sm:gap-[8px] sm:px-8"
      aria-hidden
    >
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
        <span
          key={i}
          ref={(el) => {
            bars.current[i] = el;
          }}
          className="min-w-0 flex-1 rounded-full bg-gradient-to-b from-gold-200 via-gold-400 to-gold-600 [will-change:height]"
          style={{ height: "26%" }}
        />
      ))}
    </div>
  );
};

/* ==================================================================== */
/*  Soft "3D" floating chip with cursor parallax.                        */
/* ==================================================================== */
const FloatChip: React.FC<{
  depth: number;
  px: MotionValue<number>;
  py: MotionValue<number>;
  className?: string;
  delay?: number;
  children: React.ReactNode;
}> = ({ depth, px, py, className = "", delay = 0, children }) => {
  const x = useTransform(px, (v) => v * depth);
  const y = useTransform(py, (v) => v * depth);
  return (
    <motion.div
      style={{ x, y }}
      className={`pointer-events-none absolute z-0 ${className}`}
    >
      <motion.div
        animate={{ y: [0, -16, 0], rotate: [-4, 4, -4] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay }}
        className="flex items-center justify-center rounded-[26px] border border-white/70 bg-gradient-to-br from-white via-gold-50 to-gold-200 shadow-soft"
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

/* ==================================================================== */
/*  Page                                                                 */
/* ==================================================================== */
const Home: React.FC = () => {
  const { data: sessionData, status } = useSession();
  const router = useRouter();

  // Auto-redirect logged in users to the app
  useEffect(() => {
    if (status === "authenticated" && sessionData) {
      router.push("/profile");
    }
  }, [status, sessionData, router]);

  // Scroll parallax for the ambient orb
  const { scrollYProgress } = useScroll();
  const orbY = useTransform(scrollYProgress, [0, 1], [0, -140]);

  // Cursor parallax for the floating chips
  const heroRef = useRef<HTMLElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const px = useSpring(rawX, { stiffness: 60, damping: 18, mass: 0.4 });
  const py = useSpring(rawY, { stiffness: 60, damping: 18, mass: 0.4 });
  const onHeroMove = (e: React.PointerEvent) => {
    const r = heroRef.current?.getBoundingClientRect();
    if (!r) return;
    rawX.set((e.clientX - r.left) / r.width - 0.5);
    rawY.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <>
      <Head>
        <title>HearMe — Music Voting &amp; Discovery</title>
        <meta
          name="description"
          content="HearMe is a social music app where you vote for your favourite tracks every day, discover what your friends are listening to, and explore trending songs together."
        />
        <link rel="icon" href="/favicon.ico" />
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hearme.dejny.eu/" />
        <meta property="og:title" content="HearMe — Music Voting &amp; Discovery" />
        <meta
          property="og:description"
          content="Vote for your favourite songs every day, see what your friends are listening to, and discover new music on HearMe."
        />
        <meta property="og:image" content="https://hearme.dejny.eu/hearmethumbnail.png" />
        {/* Twitter / X */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="HearMe — Music Voting &amp; Discovery" />
        <meta
          name="twitter:description"
          content="Vote for your favourite songs every day, see what your friends are listening to, and discover new music on HearMe."
        />
        <meta name="twitter:image" content="https://hearme.dejny.eu/hearmethumbnail.png" />
      </Head>

      <main className="relative z-10 mb-80 min-h-screen overflow-x-hidden bg-white text-gray-900">
        {/* ===================== Nav — logo only ===================== */}
        <header className="sticky top-0 z-30 border-b border-gray-100/80 bg-white/70 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3.5">
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Image
                src="/favicon.png"
                alt="HearMe"
                width={210}
                height={70}
                className="h-12 w-auto sm:h-14"
                priority
              />
            </motion.div>
            <CTA status={status} label="Sign in" size="sm" />
          </div>
        </header>

        {/* ===================== HERO ===================== */}
        <section
          ref={heroRef}
          onPointerMove={onHeroMove}
          className="relative flex min-h-[calc(100vh-73px)] flex-col overflow-hidden"
        >
          {/* ambient gold orb — soft 3D, parallax on scroll */}
          <motion.div
            style={{ y: orbY }}
            className="pointer-events-none absolute left-1/2 top-[38%] -z-10 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2"
          >
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,#FBF7E9,#E0C47E_40%,#B68C46_70%,transparent_85%)] opacity-[0.14] blur-2xl" />
          </motion.div>

          {/* floating soft-3D music chips with cursor parallax */}
          <FloatChip
            depth={-42}
            px={px}
            py={py}
            delay={0}
            className="hidden sm:left-[24%] sm:top-40 sm:block"
          >
            <div className="p-4 sm:p-5">
              <Music4 className="h-6 w-6 text-gold-600 sm:h-8 sm:w-8" strokeWidth={1.75} />
            </div>
          </FloatChip>
          <FloatChip
            depth={34}
            px={px}
            py={py}
            delay={1.2}
            className="hidden sm:right-[24%] sm:top-52 sm:block"
          >
            <div className="p-4 sm:p-5">
              <AudioLines className="h-6 w-6 text-gold-500 sm:h-8 sm:w-8" strokeWidth={1.75} />
            </div>
          </FloatChip>
          <FloatChip
            depth={-24}
            px={px}
            py={py}
            delay={0.6}
            className="bottom-52 left-6 hidden sm:left-[30%] sm:block"
          >
            <div className="p-4">
              <ThumbsUp className="h-6 w-6 text-gold-600" strokeWidth={1.75} />
            </div>
          </FloatChip>
          <FloatChip
            depth={30}
            px={px}
            py={py}
            delay={1.8}
            className="bottom-52 right-6 hidden sm:right-[30%] sm:block"
          >
            <div className="p-4">
              <Music2 className="h-6 w-6 text-gold-500" strokeWidth={1.75} />
            </div>
          </FloatChip>

          {/* copy — grouped and centered */}
          <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-6 pt-14 text-center sm:pt-20">
            <motion.div
              initial="hidden"
              animate="show"
              transition={{ staggerChildren: 0.1, delayChildren: 0.05 }}
              className="relative z-10 flex flex-col items-center"
            >
              <motion.h1
                variants={reveal}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="max-w-3xl text-[2.75rem] font-extrabold leading-[1.02] tracking-tight sm:text-7xl sm:leading-[0.98] lg:text-8xl"
              >
                <span className="bg-[linear-gradient(to_right,#111827_0%,#1f2937_55%,#9ca3af_80%,#ffffff_105%)] bg-clip-text text-transparent">
                  Hear the music
                </span>
                <br />
                <span className="bg-gradient-to-r from-gold-600 via-gold-500 to-gold-300 bg-clip-text text-transparent">
                 Share the music
                </span>
              </motion.h1>

              <motion.p
                variants={reveal}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="mt-7 max-w-lg text-lg leading-relaxed text-gray-500"
              >
                HearMe is where you share the music you love listening to with
                the people around you — post your track of the day and let your
                circle discover what&apos;s on repeat.
              </motion.p>

              <motion.div
                variants={reveal}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="mt-10 flex flex-col items-center gap-4"
              >
                <CTA status={status} label="Sign in with Spotify" />
                <p className="text-sm text-gray-400">
                  Free · No new account · Just your Spotify
                </p>
              </motion.div>
            </motion.div>
          </div>

          {/* the interactive soundwave — grounded baseline of the hero */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5 }}
            className="relative z-10 mt-6 w-full pb-8 sm:pb-0"
          >
            {/* soft glow anchoring the wave to the ground */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-48 bg-[radial-gradient(70%_120%_at_50%_100%,rgba(210,182,112,0.28),transparent_70%)]" />
            <div className="[mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
              <Soundwave />
            </div>
          </motion.div>
        </section>

      </main>

      {/* ===================== STICKY REVEAL FOOTER ===================== */}
      <footer className="fixed inset-x-0 bottom-0 z-0 h-80 overflow-hidden bg-[#0f0c07] text-white">
        {/* oversized brand wordmark watermark (logo text, no symbol) */}
        <Image
          src="/hearme-wordmark.png"
          alt=""
          aria-hidden
          width={1268}
          height={206}
          className="pointer-events-none absolute left-1/2 top-1/2 w-[92%] max-w-5xl -translate-x-1/2 -translate-y-1/2 select-none opacity-[0.08]"
        />

        {/* credit line — bottom center */}
        <div className="absolute inset-x-0 bottom-6 flex items-center justify-center gap-3 text-base text-white/40 sm:text-2xl">
          <span>© {new Date().getFullYear()} HearMe</span>
          <span className="text-white/20">·</span>
          <a
            href="https://dejny.eu"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-gold-600 via-gold-400 to-gold-200 bg-clip-text pb-[0.1em] font-extrabold text-transparent transition-opacity hover:opacity-80"
          >
            Dejny
          </a>
        </div>
      </footer>
    </>
  );
};

export default Home;
