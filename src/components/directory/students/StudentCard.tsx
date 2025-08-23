"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { UserSquare2 } from "lucide-react";
import { cn, normalizeMediaUrl } from "@/lib/utils";
import { StudentProfile } from "@/types";

interface Props {
  profile: StudentProfile;
  index: number;
}

export const StudentCard: React.FC<Props> = ({ profile, index }) => {
  const [err, setErr] = useState(false);
  const fullName =
    `${profile.first_name || ""} ${profile.last_name || ""}`.trim() ||
    "Student";
  const programLine = [
    profile.program,
    profile.current_semester && `Sem ${profile.current_semester}`,
  ]
    .filter(Boolean)
    .join(" • ");
  const summary = profile.profile_summary_ai || profile.bio || "No summary.";
  const avatar =
    !err && profile.profile_picture
      ? normalizeMediaUrl(profile.profile_picture)
      : "";
  const skills = (profile.technical_skills || []).slice(0, 3);

  return (
    <Link
      href={`/dashboard/directory/students/${profile.id}`}
      className="group rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70"
    >
      <motion.article
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -6 }}
        whileTap={{ scale: 0.97 }}
        className={cn(
          "relative flex flex-col items-center text-center rounded-2xl px-5 pt-8 pb-5 overflow-hidden",
          "bg-zinc-900/60 backdrop-blur-md border border-zinc-800 shadow-[0_4px_18px_-6px_rgba(0,0,0,0.5)] hover:shadow-[0_10px_28px_-8px_rgba(0,0,0,0.65)] transition-all"
        )}
      >
        <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute -top-20 -right-24 w-72 h-72 bg-emerald-500/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-28 w-72 h-72 bg-teal-500/10 blur-3xl" />
        </div>
        <div className="relative">
          <div className="mx-auto w-20 h-20 rounded-xl ring-1 ring-zinc-700/60 bg-zinc-800 overflow-hidden relative shadow-inner shadow-zinc-950">
            {avatar && !err && (
              <Image
                src={avatar}
                alt={fullName}
                fill
                sizes="80px"
                className="object-cover"
                onError={() => setErr(true)}
              />
            )}
            {(!avatar || err) && (
              <div className="w-full h-full flex items-center justify-center text-zinc-500 bg-[linear-gradient(135deg,#27272a,#18181b)]">
                <UserSquare2 className="h-9 w-9" />
              </div>
            )}
            <div className="absolute inset-0 rounded-xl ring-1 ring-zinc-700/50 group-hover:ring-emerald-400/40 transition-colors" />
          </div>
          <motion.div
            aria-hidden
            className="absolute -inset-2 rounded-2xl opacity-0 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(circle at 50% 30%, rgba(16,185,129,0.18), transparent 70%)",
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.05 + index * 0.02, duration: 0.5 }}
          />
        </div>
        <div className="mt-5 space-y-2 w-full">
          <h3 className="text-sm font-semibold tracking-tight text-zinc-100 line-clamp-1">
            {fullName}
          </h3>
          {programLine && (
            <p className="text-[11px] text-zinc-400 line-clamp-1">
              {programLine}
            </p>
          )}
          <p className="text-[11px] text-zinc-500 line-clamp-3 leading-snug min-h-[2.6em]">
            {summary.slice(0, 180)}
            {summary.length > 180 ? "…" : ""}
          </p>
        </div>
        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {skills.map((s) => (
            <span
              key={s}
              className="rounded-full bg-emerald-500/10 border border-emerald-400/30 px-2 py-0.5 text-[10px] text-emerald-300 tracking-wide font-medium"
            >
              {s}
            </span>
          ))}
          {profile.technical_skills &&
            profile.technical_skills.length > skills.length && (
              <span className="rounded-full bg-emerald-500/10 border border-emerald-400/30 px-2 py-0.5 text-[10px] text-emerald-300 tracking-wide font-medium">
                +{profile.technical_skills.length - skills.length}
              </span>
            )}
        </div>
        <div className="pointer-events-none absolute inset-px rounded-[1.05rem] bg-gradient-to-br from-emerald-400/5 via-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -inset-px rounded-[1.05rem] border border-transparent group-hover:border-emerald-400/30"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        />
      </motion.article>
    </Link>
  );
};
