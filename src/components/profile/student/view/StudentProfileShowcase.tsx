"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { StudentProfile } from "@/types";
import { studentProfileApi } from "@/lib/api/profile";
import { normalizeMediaUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";

interface StudentProfileShowcaseProps {
  allowRefresh?: boolean;
  /** Provide an already-fetched profile to avoid refetch */
  initialProfile?: StudentProfile | null;
  /** If true, skip automatic fetch and rely on provided initialProfile */
  disableAutoFetch?: boolean;
}

// Utility formatters
function formatDate(iso?: string | null) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return iso;
  }
}

export const StudentProfileShowcase: React.FC<StudentProfileShowcaseProps> = ({
  allowRefresh = true,
  initialProfile = null,
  disableAutoFetch = false,
}) => {
  const [profile, setProfile] = useState<StudentProfile | null>(initialProfile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  async function loadProfile(refetch = false) {
    if (disableAutoFetch) return; // skip if disabled
    if (loading || refreshing) return;
    if (refetch) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await studentProfileApi.get();
      setProfile(data);
    } catch (e: any) {
      setError(
        e?.response?.data?.error || e?.message || "Failed to load profile"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // load only if not disabled and no initial profile
  useEffect(() => {
    if (!disableAutoFetch && !initialProfile) {
      loadProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disableAutoFetch, initialProfile]);

  // Update internal state if parent passes a new profile
  useEffect(() => {
    if (initialProfile) setProfile(initialProfile);
  }, [initialProfile]);

  const fullName = useMemo(
    () =>
      profile && (profile.first_name || profile.last_name)
        ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
        : "Student",
    [profile]
  );

  const avatarUrl = normalizeMediaUrl(profile?.profile_picture);

  const cgpaPercent = useMemo(() => {
    const val = Number(profile?.cgpa || 0);
    return Math.min(100, Math.max(0, (val / 10) * 100));
  }, [profile?.cgpa]);

  const shimmer =
    "relative before:absolute before:inset-0 before:rounded-xl before:bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.08),transparent)] before:animate-[shimmer_2.5s_infinite]";

  return (
    <div className="relative">
      {/* Ambient animated background */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 1.2 }}
          className="absolute -inset-[40%] bg-[radial-gradient(circle_at_30%_30%,#fde68a22,transparent_60%),radial-gradient(circle_at_70%_70%,#facc1520,transparent_55%)]"
        />
      </div>

      <div className="mx-auto max-w-6xl space-y-10">
        {/* Hero / Identity */}
        <section className="relative rounded-3xl border border-zinc-800/60 bg-zinc-950/60 backdrop-blur-xl p-8 md:p-10 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col md:flex-row md:items-center gap-8"
          >
            {/* Avatar + ring */}
            <div className="relative shrink-0">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 120, delay: 0.1 }}
                className="relative h-40 w-40 rounded-2xl p-[3px] bg-gradient-to-br from-yellow-300/60 via-yellow-500/30 to-transparent"
              >
                <div className="relative h-full w-full rounded-[1rem] overflow-hidden bg-zinc-900 flex items-center justify-center text-4xl font-semibold text-yellow-200">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={fullName}
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                  ) : (
                    fullName.charAt(0).toUpperCase()
                  )}
                </div>
                {/* Animated glow */}
                <motion.div
                  aria-hidden
                  className="absolute inset-0 rounded-2xl"
                  style={{ filter: "blur(18px)" }}
                  animate={{
                    opacity: [0.15, 0.4, 0.15],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <div className="h-full w-full rounded-2xl bg-gradient-to-br from-yellow-300/20 via-yellow-500/10 to-yellow-300/0" />
                </motion.div>
              </motion.div>
            </div>

            {/* Identity + AI summary */}
            <div className="flex-1 space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-100">
                  {fullName}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                  {profile?.program && (
                    <Badge variant="secondary" className="capitalize">
                      {profile.program}
                    </Badge>
                  )}
                  {profile?.batch_year && (
                    <Badge variant="outline">Batch {profile.batch_year}</Badge>
                  )}
                  {profile?.current_semester && (
                    <Badge variant="outline">
                      Sem {profile.current_semester}
                    </Badge>
                  )}
                  {profile?.expected_graduation && (
                    <Badge variant="success">
                      Grad {formatDate(profile.expected_graduation)}
                    </Badge>
                  )}
                </div>
              </div>

              {/* AI Summary Highlight */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className={`group relative rounded-xl border border-yellow-400/30 bg-gradient-to-br from-yellow-500/10 via-yellow-500/5 to-yellow-300/0 p-[1px] ${shimmer}`}
              >
                <div className="relative rounded-[0.9rem] bg-zinc-950/90 p-4 md:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-[11px] uppercase tracking-widest text-yellow-300 font-medium flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-yellow-400 animate-pulse"></span>
                      AI Profile Summary
                    </h2>
                    {allowRefresh && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-yellow-300 hover:text-yellow-200 hover:bg-yellow-400/10"
                        disabled={refreshing || disableAutoFetch}
                        onClick={() => !disableAutoFetch && loadProfile(true)}
                        aria-label="Refresh summary"
                      >
                        {refreshing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-yellow-100/90 whitespace-pre-wrap">
                    {profile?.profile_summary_ai?.trim() || (
                      <span className="text-yellow-200/50">
                        No AI summary yet.
                      </span>
                    )}
                  </p>
                  {profile?.ai_summary_last_updated && (
                    <div className="mt-3 text-[10px] tracking-wide text-yellow-300/60">
                      Updated {formatDate(profile.ai_summary_last_updated)}
                    </div>
                  )}
                  {/* Glow underline */}
                  <motion.div
                    aria-hidden
                    className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent"
                    animate={{ opacity: [0.2, 0.9, 0.2] }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </div>
              </motion.div>
            </div>

            {/* CGPA radial gauge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 110 }}
              className="relative flex justify-center"
            >
              <div className="relative h-40 w-40">
                <svg viewBox="0 0 120 120" className="h-full w-full">
                  <defs>
                    <linearGradient
                      id="cgpa"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#fde68a" />
                      <stop offset="100%" stopColor="#fbbf24" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    className="stroke-zinc-800"
                    strokeWidth="8"
                    fill="none"
                  />
                  <motion.circle
                    cx="60"
                    cy="60"
                    r="52"
                    stroke="url(#cgpa)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: cgpaPercent / 100 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    style={{
                      rotate: "-90deg",
                      originX: "60px",
                      originY: "60px",
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-xs uppercase tracking-wide text-zinc-400">
                    CGPA
                  </div>
                  <div className="text-3xl font-bold text-yellow-300">
                    {Number(profile?.cgpa ?? 0).toFixed(2)}
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">
                    {cgpaPercent.toFixed(0)}% of 10
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Content Sections */}
        <AnimatePresence mode="popLayout">
          {profile && (
            <motion.div
              key="sections"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {},
              }}
              className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
            >
              <InfoPanel
                title="Bio"
                value={profile.bio}
                highlight
                editStep="personal"
              />
              <InfoPanel
                title="Career Goals"
                value={profile.career_goals}
                editStep="skills"
              />
              <InfoPanel
                title="Academic Achievements"
                value={profile.academic_achievements}
                editStep="academic"
              />
              <ListPanel
                title="Technical Skills"
                items={profile.technical_skills}
                editStep="skills"
              />
              <ListPanel
                title="Soft Skills"
                items={profile.soft_skills}
                editStep="skills"
              />
              <ListPanel
                title="Interests"
                items={profile.interests}
                editStep="skills"
              />
              <ListPanel
                title="Preferred Job Types"
                items={profile.preferred_job_types}
                editStep="skills"
              />
              <ListPanel
                title="Preferred Locations"
                items={profile.preferred_locations}
                editStep="skills"
              />
              <InfoPanel
                title="Internship Experience"
                value={
                  profile.has_internship_experience
                    ? profile.internship_details || "Has internship experience"
                    : "No internship experience yet"
                }
                editStep="experience"
              />
              <ListPanel
                title="Certifications"
                items={profile.certifications}
                editStep="skills"
              />
              <InfoPanel
                title="Extracurricular Activities"
                value={profile.extracurricular_activities}
                editStep="skills"
              />
              <ListPanel
                title="Major Coursework"
                items={profile.major_coursework}
                editStep="academic"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading / Error States */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-yellow-300" />
          </div>
        )}
        {error && !loading && (
          <div className="rounded-xl border border-red-900/40 bg-red-900/10 p-6 text-sm text-red-300">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

/* --------- Section Components --------- */

interface PanelBaseProps {
  title: string;
  className?: string;
  children?: React.ReactNode;
}

const PanelShell: React.FC<
  PanelBaseProps & { highlight?: boolean; editStep?: string }
> = ({ title, children, className = "", highlight = false, editStep }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.45, ease: "easeOut" }}
    className={`relative group rounded-2xl border border-zinc-800/70 bg-zinc-950/60 backdrop-blur-sm p-[1px] overflow-hidden ${className}`}
  >
    {/* gradient edge */}
    <div
      className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-yellow-400/10 via-yellow-500/5 to-yellow-200/0 pointer-events-none`}
    />
    <div
      className={`relative h-full rounded-[1rem] p-5 ${
        highlight
          ? "bg-gradient-to-br from-yellow-500/5 via-zinc-900/40 to-zinc-950/60"
          : "bg-zinc-950/70"
      }`}
    >
      <div className="flex items-start justify-between mb-2 gap-4">
        <div className="text-[10px] uppercase tracking-wider text-zinc-500 flex items-center gap-2 font-medium">
          {highlight && (
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse" />
          )}{" "}
          {title}
        </div>
        {editStep && (
          <a
            href={`/profile/student/edit?step=${encodeURIComponent(editStep)}`}
            className="text-[10px] px-2 py-1 rounded-md border border-zinc-700/60 text-zinc-400 hover:text-yellow-200 hover:border-yellow-500/50 transition-colors"
          >
            Edit
          </a>
        )}
      </div>
      {children}
    </div>
  </motion.div>
);

const InfoPanel: React.FC<{
  title: string;
  value?: string | null;
  highlight?: boolean;
  editStep?: string;
}> = ({ title, value, highlight, editStep }) => (
  <PanelShell title={title} highlight={highlight} editStep={editStep}>
    <div className="text-sm leading-relaxed whitespace-pre-wrap text-zinc-300">
      {value?.trim() || (
        <span className="text-zinc-500/60">— Not provided —</span>
      )}
    </div>
  </PanelShell>
);

const ListPanel: React.FC<{
  title: string;
  items: string[];
  editStep?: string;
}> = ({ title, items, editStep }) => (
  <PanelShell title={title} editStep={editStep}>
    {items && items.length > 0 ? (
      <ul className="flex flex-wrap gap-2">
        {items.map((item, idx) => (
          <motion.li
            key={`${item}-${idx}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            className="px-2.5 py-1 rounded-md bg-zinc-800/70 text-[11px] tracking-wide text-zinc-200 border border-zinc-700/50 hover:border-yellow-400/40 hover:text-yellow-200 transition-colors"
          >
            {item}
          </motion.li>
        ))}
      </ul>
    ) : (
      <div className="text-sm text-zinc-500/60">— None —</div>
    )}
  </PanelShell>
);

export default StudentProfileShowcase;
