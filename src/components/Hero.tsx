import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { HiOutlineTicket, HiOutlineArrowRight, HiOutlineLocationMarker, HiOutlineCalendar, HiOutlineClock } from "react-icons/hi";
import { featuredEvent } from "../data/events";

const Hero = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative flex min-h-[100svh] items-end overflow-hidden pb-24 pt-32 sm:items-center sm:pb-0">
      {/* Background image with zoom + parallax */}
      <motion.div style={{ y, scale }} className="absolute inset-0 -z-20">
        <img
          src={featuredEvent.flyer ?? undefined}
          alt={featuredEvent.title}
          className="h-full w-full object-cover object-top"
        />
      </motion.div>

      {/* Gradient overlays for legibility */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/90 via-ink/30 to-ink/80" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_70%_20%,rgba(139,92,246,0.25),transparent_55%)]" />

      {/* Floating decorative orbs */}
      <div className="pointer-events-none absolute -left-16 top-24 -z-10 h-64 w-64 rounded-full bg-violet/20 blur-[90px] animate-float-slow" />
      <div className="pointer-events-none absolute right-10 top-1/3 -z-10 h-52 w-52 rounded-full bg-gold/20 blur-[90px] animate-float" />

      <motion.div style={{ opacity }} className="container-x relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="eyebrow mb-6"
        >
          Chills &amp; Vibes presents
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="max-w-3xl text-6xl font-extrabold uppercase leading-[0.95] tracking-tight text-bone sm:text-7xl lg:text-8xl"
        >
          Jersey
          <br />
          <span className="text-gradient-gold">Party</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium text-bone/90 sm:text-base"
        >
          <span className="inline-flex items-center gap-2">
            <HiOutlineLocationMarker className="text-gold" /> {featuredEvent.location}
          </span>
          <span className="inline-flex items-center gap-2">
            <HiOutlineCalendar className="text-gold" /> {featuredEvent.date}
          </span>
          <span className="inline-flex items-center gap-2">
            <HiOutlineClock className="text-gold" /> {featuredEvent.time}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="mt-10 flex flex-wrap gap-4"
        >
          <Link to="/tickets" className="btn-gold">
            Get Your Ticket <HiOutlineTicket className="text-base" />
          </Link>
          <Link to={`/events/${featuredEvent.slug}`} className="btn-ghost">
            Explore Event <HiOutlineArrowRight className="text-base" />
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs uppercase tracking-widest text-mute sm:flex"
      >
        <span>Scroll</span>
        <span className="h-8 w-px animate-pulse-glow bg-gradient-to-b from-gold to-transparent" />
      </motion.div>
    </section>
  );
};

export default Hero;
