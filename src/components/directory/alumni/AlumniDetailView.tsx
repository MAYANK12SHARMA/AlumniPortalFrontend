"use client";
import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Award,
  Building2,
  Briefcase,
  User,
  Mail,
  Phone,
  Linkedin,
  Globe,
  Twitter,
  Instagram,
  MessageCircle,
  Link as LinkIcon,
  GraduationCap,
  Sparkles,
  MapPin,
  Layers3,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, normalizeMediaUrl } from "@/lib/utils";

// Local date formatting helper
const formatDate = (value?: string) => {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const AlumniDetailView = ({ profile }: { profile: any }) => {
  const [imgErr, setImgErr] = useState(false);
  const fullName =
    `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Alumni";
  const summary = profile.profile_summary_ai || profile.bio;
  const avatar =
    !imgErr && profile.profile_picture
      ? normalizeMediaUrl?.(profile.profile_picture) || profile.profile_picture
      : "";
  const headerMeta = [
    profile.degree && String(profile.degree).toUpperCase(),
    profile.department,
    profile.graduation_year && `Class of ${profile.graduation_year}`,
  ]
    .filter(Boolean)
    .join(" • ");
  const companyLine = [profile.current_position, profile.current_company]
    .filter(Boolean)
    .join(" • ");
  const flags = [
    profile.willing_to_mentor && "Mentor",
    profile.can_provide_referrals && "Referrals",
    profile.available_for_networking && "Networking",
  ].filter(Boolean) as string[];

  // Basic inline contact (email / phone) kept minimal; richer social & external handled via dialog
  const inlineContactItems = [
    profile.email && {
      icon: <Mail className="h-3.5 w-3.5" />,
      label: profile.email,
      href: `mailto:${profile.email}`,
    },
    profile.phone_number && {
      icon: <Phone className="h-3.5 w-3.5" />,
      label: profile.phone_number,
      href: `tel:${profile.phone_number}`,
    },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; href: string }[];

  const [showContact, setShowContact] = useState(false);

  // Social platform union type (no runtime array) for filtering
  type SocialKey =
    | "linkedin"
    | "twitter"
    | "instagram"
    | "portfolio"
    | "blog"
    | "other";

  // Map possible field names on alumni profile (back‑end TBD). Using existing linkedin_url & generic fallbacks.
  const socialData: Array<{
    key: SocialKey | "whatsapp";
    label: string;
    url: string;
    icon: React.ReactNode;
    accent: string;
    hidden?: boolean;
  }> = useMemo(() => {
    const items: Array<{
      key: any;
      label: string;
      url: string;
      icon: React.ReactNode;
      accent: string;
      hidden?: boolean;
    }> = [];

    const add = (
      key: SocialKey | "whatsapp",
      label: string,
      url?: string | null,
      icon?: React.ReactNode,
      accent = "amber"
    ) => {
      if (!url) return;
      items.push({
        key,
        label,
        url,
        icon: icon || <LinkIcon className="h-4 w-4" />,
        accent,
      });
    };

    // Existing known fields (adjust if backend differs):
    add(
      "linkedin",
      "LinkedIn",
      profile.linkedin_url || profile.linkedin,
      <Linkedin className="h-4 w-4" />,
      "sky"
    );
    add(
      "twitter",
      "Twitter",
      profile.twitter_url || profile.twitter,
      <Twitter className="h-4 w-4" />,
      "blue"
    );
    add(
      "instagram",
      "Instagram",
      profile.instagram_url || profile.instagram,
      <Instagram className="h-4 w-4" />,
      "pink"
    );
    add(
      "portfolio",
      "Portfolio",
      profile.portfolio_url || profile.portfolio || profile.website,
      <Globe className="h-4 w-4" />,
      "emerald"
    );
    add(
      "blog",
      "Blog",
      profile.blog_url || profile.blog,
      <Globe className="h-4 w-4" />,
      "violet"
    );
    add(
      "other",
      "Other",
      profile.other_url || profile.other,
      <LinkIcon className="h-4 w-4" />,
      "amber"
    );

    // WhatsApp (only when public)
    if (profile.is_public && profile.phone_number) {
      const digits = String(profile.phone_number).replace(/[^\d+]/g, "");
      const wa = `https://wa.me/${digits.replace(/^\+/, "")}`;
      add(
        "whatsapp",
        "WhatsApp",
        wa,
        <MessageCircle className="h-4 w-4" />,
        "green"
      );
    }

    const allowed: Array<SocialKey | "whatsapp"> = [
      "linkedin",
      "twitter",
      "instagram",
      "portfolio",
      "blog",
      "other",
      "whatsapp",
    ];
    return items.filter((i) => allowed.includes(i.key));
  }, [profile]);

  return (
    <div className="relative">
      {/* Ambient gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[70rem] h-[70rem] bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.18),transparent_60%)] opacity-60" />
      </div>
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-6 pb-24 space-y-10">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/directory/alumni"
            className="text-xs text-zinc-400 hover:text-amber-300 inline-flex items-center gap-1 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition" />{" "}
            Back
          </Link>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-[linear-gradient(135deg,#111113,#0c0c0d)] px-6 sm:px-10 py-10 backdrop-blur-md shadow-[0_8px_40px_-10px_rgba(0,0,0,0.6)]"
        >
          {/* gradient accents */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/5 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-orange-500/5 blur-3xl" />
          </div>

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Avatar + quick meta */}
            <div className="w-full max-w-[240px] mx-auto lg:mx-0 flex flex-col items-center gap-4">
              <div className="relative group/avatar">
                <div
                  className={cn(
                    "w-44 h-44 rounded-2xl overflow-hidden ring-1 ring-zinc-700/60 bg-zinc-800 relative",
                    "shadow-[0_0_0_1px_rgba(39,39,42,0.6),0_8px_28px_-10px_rgba(0,0,0,0.7)]"
                  )}
                >
                  {avatar ? (
                    <Image
                      src={avatar}
                      alt={fullName}
                      fill
                      sizes="176px"
                      className="object-cover duration-700 ease-out scale-105 group-hover/avatar:scale-100 will-change-transform"
                      onError={() => setImgErr(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-500 bg-[linear-gradient(135deg,#27272a,#18181b)]">
                      <User className="h-14 w-14" />
                    </div>
                  )}
                </div>
                <div className="absolute -inset-1 rounded-3xl opacity-0 group-hover/avatar:opacity-100 transition duration-500 bg-[radial-gradient(circle_at_50%_35%,rgba(255,180,60,0.35),transparent_65%)]" />
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {flags.map((f) => (
                  <span
                    key={f}
                    className="px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wide bg-amber-500/10 text-amber-300 border border-amber-400/30"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Core content */}
            <div className="flex-1 space-y-8">
              <header className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight text-zinc-100 flex items-center gap-3">
                  <Sparkles className="h-6 w-6 text-amber-400" /> {fullName}
                </h1>
                {headerMeta && (
                  <p className="text-sm text-zinc-400 flex items-center gap-2">
                    <Layers3 className="h-4 w-4" /> {headerMeta}
                  </p>
                )}
                {companyLine && (
                  <p className="text-xs text-zinc-400 flex items-center gap-2">
                    <Briefcase className="h-3.5 w-3.5" /> {companyLine}
                  </p>
                )}
                {profile.location && (
                  <p className="text-xs text-zinc-500 flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" /> {profile.location}
                  </p>
                )}
              </header>

              {summary && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap font-normal bg-zinc-900/40 rounded-xl p-5 border border-zinc-800/70 shadow-inner"
                >
                  {summary}
                </motion.p>
              )}

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {profile.degree && (
                  <InfoCard
                    icon={<GraduationCap className="h-4 w-4" />}
                    label="Degree"
                    value={profile.degree}
                  />
                )}
                {profile.graduation_year && (
                  <InfoCard
                    icon={<Calendar className="h-4 w-4" />}
                    label="Graduation Year"
                    value={profile.graduation_year}
                  />
                )}
                {profile.industry && (
                  <InfoCard
                    icon={<Building2 className="h-4 w-4" />}
                    label="Industry"
                    value={profile.industry}
                  />
                )}
                {profile.experience_years && (
                  <InfoCard
                    icon={<User className="h-4 w-4" />}
                    label="Experience"
                    value={`${profile.experience_years} yrs`}
                  />
                )}
                {profile.specialization && (
                  <InfoCard
                    icon={<Award className="h-4 w-4" />}
                    label="Specialization"
                    value={profile.specialization}
                  />
                )}
                {profile.skills &&
                  Array.isArray(profile.skills) &&
                  profile.skills.length > 0 && (
                    <InfoCard
                      icon={<Award className="h-4 w-4" />}
                      label="Key Skills"
                      value={
                        profile.skills.slice(0, 6).join(", ") +
                        (profile.skills.length > 6 ? "…" : "")
                      }
                    />
                  )}
              </div>

              {(profile.skills?.length || profile.expertise_areas?.length) && (
                <section className="space-y-4">
                  <h2 className="text-xs uppercase tracking-wide text-zinc-500 font-medium">
                    Skills & Expertise
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {(profile.skills || []).map((s: string) => (
                      <span
                        key={"skill-" + s}
                        className="px-2 py-1 rounded-full text-[10px] font-medium bg-emerald-500/10 border border-emerald-400/30 text-emerald-300"
                      >
                        {s}
                      </span>
                    ))}
                    {(profile.expertise_areas || []).map((s: string) => (
                      <span
                        key={"expert-" + s}
                        className="px-2 py-1 rounded-full text-[10px] font-medium bg-sky-500/10 border border-sky-400/30 text-sky-300"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {profile.career_path?.length > 0 && (
                <section className="space-y-4">
                  <h2 className="text-xs uppercase tracking-wide text-zinc-500 font-medium">
                    Career Path
                  </h2>
                  <ol className="space-y-3">
                    {profile.career_path.map((step: any, idx: number) => {
                      const range =
                        [formatDate(step.start_date), formatDate(step.end_date)]
                          .filter(Boolean)
                          .join(" – ") || null;
                      return (
                        <li key={idx} className="relative pl-6">
                          <span className="absolute left-1 top-2 w-2 h-2 rounded-full bg-amber-400" />
                          <div className="text-sm text-zinc-200 font-medium">
                            {step.role || step.title || "Role"}{" "}
                            {step.company && (
                              <span className="text-zinc-400">
                                @ {step.company}
                              </span>
                            )}
                          </div>
                          {range && (
                            <div className="text-[10px] uppercase tracking-wide text-zinc-500 mt-1">
                              {range}
                            </div>
                          )}
                          {step.description && (
                            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                              {step.description}
                            </p>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </section>
              )}

              {(profile.achievements?.length || profile.awards?.length) && (
                <section className="space-y-4">
                  <h2 className="text-xs uppercase tracking-wide text-zinc-500 font-medium">
                    Achievements
                  </h2>
                  <ul className="flex flex-wrap gap-2">
                    {(profile.achievements || []).map((a: string) => (
                      <li
                        key={"ach-" + a}
                        className="px-2 py-1 rounded-full text-[10px] font-medium bg-amber-500/10 border border-amber-400/30 text-amber-300"
                      >
                        {a}
                      </li>
                    ))}
                    {(profile.awards || []).map((a: string) => (
                      <li
                        key={"award-" + a}
                        className="px-2 py-1 rounded-full text-[10px] font-medium bg-amber-500/10 border border-amber-400/30 text-amber-300"
                      >
                        {a}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {(profile.updated_at || profile.created_at) && (
                <p className="text-[10px] text-zinc-500 pt-2">
                  {formatDate(profile.updated_at) && (
                    <>Last updated {formatDate(profile.updated_at)}</>
                  )}
                  {formatDate(profile.updated_at) &&
                    formatDate(profile.created_at) &&
                    " • "}
                  {formatDate(profile.created_at) && (
                    <>Created {formatDate(profile.created_at)}</>
                  )}
                </p>
              )}

              {inlineContactItems.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
                    Contact
                  </h2>
                  <ul className="flex flex-wrap gap-2">
                    {inlineContactItems.map((c) => (
                      <li key={c.href}>
                        <a
                          href={c.href}
                          target={
                            c.href.startsWith("http") ? "_blank" : undefined
                          }
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-2 text-[11px] px-3 py-2 rounded-md border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/70 text-zinc-300 hover:text-amber-200 transition"
                        >
                          <span className="text-zinc-500 group-hover:text-amber-300 transition">
                            {c.icon}
                          </span>
                          {c.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                  {socialData.length > 0 && (
                    <div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowContact(true)}
                        className="mt-1"
                      >
                        More Ways to Connect
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bottom actions */}
          <div className="mt-14 pt-6 border-t border-zinc-800/70 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            <div className="flex flex-wrap gap-2 text-[11px] text-zinc-500">
              {profile.graduation_year && (
                <span className="px-2 py-1 rounded-full bg-zinc-800/60 border border-zinc-700/60">
                  Class of {profile.graduation_year}
                </span>
              )}
              {profile.department && (
                <span className="px-2 py-1 rounded-full bg-zinc-800/60 border border-zinc-700/60">
                  {profile.department}
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline" size="lg">
                <Link
                  href="/dashboard/directory/alumni"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </Link>
              </Button>
              {socialData.length > 0 || profile.email ? (
                <Button
                  size="lg"
                  variant="primary"
                  onClick={() => setShowContact(true)}
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" /> Contact / Connect
                </Button>
              ) : null}
            </div>
          </div>
        </motion.section>
      </div>
      <ContactDialog
        open={showContact}
        onClose={() => setShowContact(false)}
        profile={profile}
        socials={socialData}
      />
    </div>
  );
};

// Skeleton while loading alumni detail
export const AlumniDetailSkeleton = () => {
  const shimmer = "animate-pulse bg-zinc-800/60";
  return (
    <div className="relative">
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-6 pb-24">
        <div className="h-5 w-24 mb-6 rounded-full bg-zinc-800/60" />
        <div className="rounded-3xl border border-zinc-800/70 bg-[linear-gradient(135deg,#111113,#0c0c0d)] p-8 md:p-10">
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="w-full max-w-[240px] mx-auto lg:mx-0 flex flex-col items-center gap-4">
              <div className={`w-44 h-44 rounded-2xl ${shimmer}`} />
              <div className="flex gap-2">
                <div className={`h-5 w-16 rounded-full ${shimmer}`} />
                <div className={`h-5 w-24 rounded-full ${shimmer}`} />
              </div>
            </div>
            <div className="flex-1 space-y-8">
              <div className="space-y-3">
                <div className={`h-8 w-72 rounded-lg ${shimmer}`} />
                <div className={`h-4 w-48 rounded-lg ${shimmer}`} />
                <div className={`h-3 w-32 rounded-lg ${shimmer}`} />
              </div>
              <div className="space-y-2">
                <div className={`h-24 w-full rounded-xl ${shimmer}`} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={`h-24 rounded-xl ${shimmer}`} />
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className={`h-5 w-20 rounded-full ${shimmer}`} />
                ))}
              </div>
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className={`h-16 rounded-xl ${shimmer}`} />
                ))}
              </div>
              <div className="h-3 w-40 rounded-full mt-4 ${shimmer}" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    viewport={{ once: true, amount: 0.4 }}
    className="relative overflow-hidden rounded-xl border border-zinc-800/70 bg-zinc-900/40 p-4 shadow-card group"
  >
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-400/20 text-amber-300">
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-[11px] uppercase tracking-wide text-zinc-500 font-medium">
          {label}
        </p>
        <p className="text-sm text-zinc-200 leading-snug break-words">
          {value}
        </p>
      </div>
    </div>
    <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_85%_15%,rgba(251,191,36,0.12),transparent_65%)]" />
  </motion.div>
);

// Reusable dialog for alumni contact / social links
const ContactDialog = ({
  open,
  onClose,
  socials,
  profile,
}: {
  open: boolean;
  onClose: () => void;
  socials: Array<{
    key: string;
    label: string;
    url: string;
    icon: React.ReactNode;
    accent: string;
  }>;
  profile: any;
}) => {
  if (!open) return null;
  const email = profile.email;
  const phone = profile.phone_number;
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 170, damping: 22 }}
            className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950/85 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_8px_40px_-4px_rgba(0,0,0,0.6)] flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/70 bg-gradient-to-r from-zinc-900/70 to-zinc-900/30">
              <div>
                <h2 className="text-base font-semibold text-zinc-100">
                  Connect with{" "}
                  {profile.first_name || profile.last_name || "Alumni"}
                </h2>
                {profile.is_public ? (
                  <p className="text-[11px] text-emerald-400 mt-1">
                    Public profile – direct channels available
                  </p>
                ) : (
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Limited visibility – some channels hidden
                  </p>
                )}
              </div>
              <Button size="sm" variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scroll">
              <div className="grid gap-3 sm:grid-cols-2">
                {email && (
                  <ContactCard
                    href={`mailto:${email}`}
                    label={email}
                    icon={<Mail className="h-4 w-4" />}
                    accent="amber"
                  />
                )}
                {phone && (
                  <ContactCard
                    href={`tel:${phone}`}
                    label={phone}
                    icon={<Phone className="h-4 w-4" />}
                    accent="orange"
                  />
                )}
                {socials.map((s) => (
                  <ContactCard
                    key={s.key}
                    href={s.url}
                    label={s.label}
                    icon={s.icon}
                    accent={s.accent}
                    external
                  />
                ))}
                {socials.length === 0 && !email && !phone && (
                  <div className="col-span-full text-center text-xs text-zinc-500 py-8">
                    No contact channels available yet.
                  </div>
                )}
              </div>
              {/* Future placeholder for internal messaging / email template trigger */}
              <div className="rounded-lg border border-dashed border-zinc-700/70 p-4 text-[11px] text-zinc-500">
                Upcoming: send a direct message or email template (API pending)
              </div>
            </div>
            <div className="px-6 py-3 border-t border-zinc-800/70 flex items-center justify-end gap-3">
              <Button size="sm" variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ContactCard = ({
  href,
  label,
  icon,
  accent,
  external,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  accent: string;
  external?: boolean;
}) => {
  const colorMap: Record<string, string> = {
    amber:
      "from-amber-500/20 to-amber-500/5 border-amber-400/30 text-amber-200 hover:from-amber-500/25",
    orange:
      "from-orange-500/20 to-orange-500/5 border-orange-400/30 text-orange-200",
    blue: "from-sky-500/20 to-sky-500/5 border-sky-400/30 text-sky-200",
    pink: "from-pink-500/20 to-pink-500/5 border-pink-400/30 text-pink-200",
    emerald:
      "from-emerald-500/20 to-emerald-500/5 border-emerald-400/30 text-emerald-200",
    violet:
      "from-violet-500/20 to-violet-500/5 border-violet-400/30 text-violet-200",
    green:
      "from-green-500/20 to-green-500/5 border-green-400/30 text-green-200",
  };
  return (
    <a
      href={href}
      target={external || href.startsWith("http") ? "_blank" : undefined}
      rel={external || href.startsWith("http") ? "noreferrer" : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-xl border p-3 text-sm bg-gradient-to-br transition hover:shadow-md",
        colorMap[accent] || colorMap["amber"],
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
      )}
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black/20">
        {icon}
      </span>
      <span className="flex-1 text-xs font-medium tracking-wide">{label}</span>
    </a>
  );
};
