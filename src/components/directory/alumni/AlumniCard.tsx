"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn, normalizeMediaUrl } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { UserSquare2 } from "lucide-react";

interface Props {
  profile: any;
  index: number;
}

export const AlumniCard: React.FC<Props> = ({ profile, index }) => {
  const [imgErr, setImgErr] = useState(false);
  const fullName =
    `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Alumni";
  const companyLine = [profile.current_position, profile.current_company]
    .filter(Boolean)
    .join(" • ");
  const year = profile.graduation_year ? String(profile.graduation_year) : null;
  const summary =
    profile.profile_summary_ai || profile.bio || "No summary provided.";
  const avatar =
    !imgErr && profile.profile_picture
      ? normalizeMediaUrl(profile.profile_picture)
      : "";
  const flags = [
    profile.willing_to_mentor && "Mentor",
    profile.can_provide_referrals && "Referrals",
    profile.available_for_networking && "Networking",
  ].filter(Boolean) as string[];

  return (
    <Link
      href={`/dashboard/directory/alumni/${profile.id}`}
      className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 rounded-2xl"
    >
      <motion.article
        variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}
        initial="hidden"
        animate="show"
        whileHover={{ y: -6, rotateX: 4 }}
        whileTap={{ scale: 0.97 }}
        className={cn(
          "relative flex flex-col items-center text-center rounded-2xl px-5 pt-8 pb-5 overflow-hidden",
          "bg-zinc-900/60 backdrop-blur-md border border-zinc-800",
          "shadow-[0_4px_18px_-6px_rgba(0,0,0,0.5)] hover:shadow-[0_10px_28px_-8px_rgba(0,0,0,0.65)]",
          "transition-all duration-400"
        )}
      >
        {/* Ambient gradients */}
        <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute -top-20 -right-24 w-72 h-72 bg-amber-500/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-28 w-72 h-72 bg-orange-500/10 blur-3xl" />
        </div>

        {/* Avatar */}
        <div className="relative">
          <div className="mx-auto w-20 h-20 rounded-xl ring-1 ring-zinc-700/60 bg-zinc-800 overflow-hidden relative shadow-inner shadow-zinc-950">
            {avatar && !imgErr && (
              <Image
                key={avatar}
                src={avatar}
                alt={fullName}
                fill
                priority={index < 6}
                sizes="80px"
                className="object-cover will-change-transform duration-700 ease-out scale-105 group-hover:scale-100 transition-transform"
                onError={() => setImgErr(true)}
                unoptimized={false}
              />
            )}
            {(!avatar || imgErr) && (
              <div className="w-full h-full flex items-center justify-center text-zinc-500 bg-[linear-gradient(135deg,#27272a,#18181b)]">
                <UserSquare2 className="h-9 w-9" />
              </div>
            )}
            {/* Subtle ring pulse on hover */}
            <div className="absolute inset-0 rounded-xl ring-1 ring-zinc-700/50 group-hover:ring-amber-400/40 transition-colors" />
          </div>
          {/* Glow accent */}
          <motion.div
            aria-hidden
            className="absolute -inset-2 rounded-2xl opacity-0 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(circle at 50% 30%, rgba(251,191,36,0.15), transparent 70%)",
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.05 + index * 0.02, duration: 0.5 }}
          />
        </div>

        {/* Core info */}
        <div className="mt-5 space-y-2 w-full">
          <h3 className="text-sm font-semibold tracking-tight text-zinc-100 line-clamp-1">
            {fullName}
          </h3>
          {companyLine && (
            <p className="text-[11px] text-zinc-400 line-clamp-1">
              {companyLine}
            </p>
          )}
          <p className="text-[11px] text-zinc-500 line-clamp-3 leading-snug min-h-[2.6em]">
            {summary.slice(0, 180)}
            {summary.length > 180 ? "…" : ""}
          </p>
        </div>

        {/* Meta chips */}
        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {year && (
            <span className="rounded-full bg-zinc-800/80 border border-zinc-700/60 px-2 py-0.5 text-[10px] text-zinc-300 tracking-wide">
              {year}
            </span>
          )}
          {flags.slice(0, 2).map((f) => (
            <span
              key={f}
              className="rounded-full bg-amber-500/10 border border-amber-400/30 px-2 py-0.5 text-[10px] text-amber-300 tracking-wide font-medium"
            >
              {f}
            </span>
          ))}
          {flags.length > 2 && (
            <span className="rounded-full bg-amber-500/10 border border-amber-400/30 px-2 py-0.5 text-[10px] text-amber-300 tracking-wide font-medium">
              +{flags.length - 2}
            </span>
          )}
        </div>

        {/* Hover sheen */}
        <div className="pointer-events-none absolute inset-px rounded-[1.05rem] bg-gradient-to-br from-amber-400/5 via-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -inset-px rounded-[1.05rem] border border-transparent group-hover:border-amber-400/30"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        />
      </motion.article>
    </Link>
  );
};
