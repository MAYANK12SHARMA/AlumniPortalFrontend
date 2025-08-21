"use client";
import React, { useRef, useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Phone,
  BookOpen,
  Sparkles,
  Users,
  Briefcase,
  CheckCircle,
  ChevronDown,
} from "lucide-react";

function Collapse({
  children,
  open,
}: {
  children: React.ReactNode;
  open: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [maxH, setMaxH] = useState<string>(open ? "none" : "0px");
  const [render, setRender] = useState<boolean>(open);
  const [phase, setPhase] = useState<"idle" | "opening" | "closing">(
    open ? "idle" : "idle"
  );

  useEffect(() => {
    if (!ref.current) return;
    if (open) {
      setRender(true);
      setPhase("opening");
      const h = ref.current.scrollHeight;
      setMaxH(h + "px");
      const t = setTimeout(() => {
        setMaxH("none");
        setPhase("idle");
      }, 500);
      return () => clearTimeout(t);
    } else {
      const h = ref.current.scrollHeight;
      setPhase("closing");
      setMaxH(h + "px");
      requestAnimationFrame(() => setMaxH("0px"));
      const t = setTimeout(() => {
        setRender(false);
        setPhase("idle");
      }, 520);
      return () => clearTimeout(t);
    }
  }, [open]);

  return (
    <div
      ref={ref}
      data-open={open}
      style={{ maxHeight: maxH }}
      className="overflow-hidden transition-[max-height] duration-500 ease-[cubic-bezier(.22,1,.36,1)] will-change-[max-height]"
      aria-hidden={!open && phase === "idle"}
    >
      <div
        className={
          "origin-top transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)] " +
          (open
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 -translate-y-2 scale-[0.98]")
        }
      >
        {render && children}
      </div>
    </div>
  );
}

export default function AlumniDetails({
  profile,
  onEditSection,
}: {
  profile: any;
  onEditSection: (fieldKeys: string[]) => void;
  onEditSocial?: (platform: string, current?: any) => void;
}) {
  const _sectionKeys = [
    "contact",
    "expertise",
    "mentoring",
    "about",
    "career",
    "account",
  ] as const;
  type SectionKey = (typeof _sectionKeys)[number];
  // Track which section(s) are "locked" (pinned open by click)
  const [locked, setLocked] = useState<Set<SectionKey>>(new Set(["contact"]));
  // Track hover state separately so hover & lock don't fight each other
  const [hover, setHover] = useState<Record<SectionKey, boolean>>({
    contact: false,
    expertise: false,
    mentoring: false,
    about: false,
    career: false,
    account: false,
  });

  const isOpen = (k: SectionKey) => locked.has(k) || hover[k];

  const toggleLock = (k: SectionKey) => {
    setLocked((prev) => {
      const next = new Set(prev);
      if (next.has(k)) {
        next.delete(k); // unlock; will stay open until mouse leaves (if currently hovered)
      } else {
        next.add(k); // lock open
      }
      return next;
    });
  };

  const handleEnter = (k: SectionKey) => {
    setHover((h) => ({ ...h, [k]: true }));
  };
  // const handleLeave = (k: SectionKey) => {
  //   if (locked.has(k)) return; // do not close if pinned
  //   setHover((h) => ({ ...h, [k]: false }));
  // };
  const handleClick = (k: SectionKey) => {
    toggleLock(k);
  };

  const Header = ({
    icon: Icon,
    title,
    subtitle,
    section,
    expanded,
  }: {
    icon: any;
    title: string;
    subtitle?: string;
    section: SectionKey;
    expanded: boolean;
  }) => (
    <button
      type="button"
      onClick={() => handleClick(section)}
      aria-expanded={expanded}
      className="group relative flex w-full items-center justify-between text-left"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700/60 bg-zinc-800/40 text-yellow-300 shadow-inner group-hover:border-yellow-500/50 group-hover:bg-zinc-800/70 transition">
          <Icon size={18} />
        </div>
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
            {title}
            {locked.has(section) && (
              <span className="rounded bg-yellow-500/10 px-1.5 py-0.5 text-[10px] font-medium text-yellow-300">
                pinned
              </span>
            )}
          </div>
          {subtitle && (
            <div className="text-xs text-zinc-400 group-hover:text-zinc-300 transition">
              {subtitle}
            </div>
          )}
        </div>
      </div>
      <ChevronDown
        className={`ml-2 h-5 w-5 shrink-0 text-zinc-500 transition-transform group-hover:text-zinc-300 ${
          expanded ? "rotate-180" : "rotate-0"
        }`}
      />
      <span className="pointer-events-none absolute inset-0 rounded-xl opacity-0 ring-1 ring-yellow-500/0 group-hover:opacity-100 group-hover:ring-yellow-500/30 transition" />
    </button>
  );

  const Card = ({
    id,
    children,
    className = "",
    onMouseEnter,
    onMouseLeave,
  }: {
    id: SectionKey;
    children: React.ReactNode;
    className?: string;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
  }) => (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={
        "relative rounded-2xl border border-zinc-800/70 bg-zinc-900/40 p-5 backdrop-blur-sm transition-all duration-300 will-change-transform " +
        (isOpen(id)
          ? "scale-[1.01] ring-1 ring-yellow-500/40 shadow-[0_0_0_1px_rgba(234,179,8,0.15),0_6px_28px_-4px_rgba(0,0,0,0.65)]"
          : "hover:scale-[1.01] hover:border-zinc-700 hover:bg-zinc-900/60") +
        " " +
        className
      }
    >
      {children}
    </div>
  );

  // Delayed close timers to avoid abrupt flicker on quick mouse leave/enter.
  const closeTimers = useRef<Record<string, number>>({});

  const scheduleClose = (k: SectionKey) => {
    if (locked.has(k)) return;
    window.clearTimeout(closeTimers.current[k]);
    closeTimers.current[k] = window.setTimeout(() => {
      setHover((h) => ({ ...h, [k]: false }));
    }, 500);
  };
  const cancelClose = (k: SectionKey) => {
    window.clearTimeout(closeTimers.current[k]);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1 space-y-6">
        <Card
          id="contact"
          onMouseEnter={() => {
            cancelClose("contact");
            handleEnter("contact");
          }}
          onMouseLeave={() => scheduleClose("contact")}
        >
          <Header
            icon={Phone}
            title="Contact & Background"
            subtitle={profile?.degree ? String(profile.degree) : undefined}
            section="contact"
            expanded={isOpen("contact")}
          />
          <Collapse open={isOpen("contact")}>
            <div className="mt-4 grid gap-3 text-sm">
              <div className="flex items-start gap-3 rounded-lg bg-zinc-800/40 p-3">
                <span className="text-[11px] uppercase tracking-wide text-zinc-400 w-24">
                  Phone
                </span>
                <span className="text-zinc-100">
                  {profile?.phone_number || "-"}
                </span>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-zinc-800/40 p-3">
                <span className="text-[11px] uppercase tracking-wide text-zinc-400 w-24">
                  Graduation
                </span>
                <span className="text-zinc-100">
                  {profile?.graduation_year || "-"}
                </span>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-zinc-800/40 p-3">
                <span className="text-[11px] uppercase tracking-wide text-zinc-400 w-24">
                  Location
                </span>
                <span className="text-zinc-100">
                  {profile?.location || "-"}
                </span>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  onEditSection([
                    "phone_number",
                    "degree",
                    "graduation_year",
                    "location",
                  ])
                }
              >
                Edit
              </Button>
            </div>
          </Collapse>
        </Card>

        <Card
          id="expertise"
          onMouseEnter={() => {
            cancelClose("expertise");
            handleEnter("expertise");
          }}
          onMouseLeave={() => scheduleClose("expertise")}
        >
          <Header
            icon={Sparkles}
            title="Expertise"
            subtitle={
              Array.isArray(profile?.expertise_areas)
                ? `${profile.expertise_areas.length} items`
                : undefined
            }
            section="expertise"
            expanded={isOpen("expertise")}
          />
          <Collapse open={isOpen("expertise")}>
            <div className="mt-4">
              {Array.isArray(profile?.expertise_areas) &&
              profile.expertise_areas.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.expertise_areas.map((e: any, i: number) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="rounded-full border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-[11px] font-medium capitalize text-yellow-200 hover:border-yellow-400/50"
                    >
                      {String(e)}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-zinc-500">No expertise added</div>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEditSection(["expertise_areas"])}
              >
                Edit
              </Button>
            </div>
          </Collapse>
        </Card>

        <Card
          id="mentoring"
          onMouseEnter={() => {
            cancelClose("mentoring");
            handleEnter("mentoring");
          }}
          onMouseLeave={() => scheduleClose("mentoring")}
        >
          <Header
            icon={Users}
            title="Mentoring & Referrals"
            subtitle={profile?.willing_to_mentor ? "Mentor" : ""}
            section="mentoring"
            expanded={isOpen("mentoring")}
          />
          <Collapse open={isOpen("mentoring")}>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex flex-wrap gap-2">
                <span
                  className={
                    "rounded-full px-3 py-1 text-[11px] font-medium tracking-wide " +
                    (profile?.willing_to_mentor
                      ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30"
                      : "bg-zinc-700/30 text-zinc-300")
                  }
                >
                  {profile?.willing_to_mentor
                    ? "Willing to Mentor"
                    : "Not Mentoring"}
                </span>
                <span
                  className={
                    "rounded-full px-3 py-1 text-[11px] font-medium tracking-wide " +
                    (profile?.can_provide_referrals
                      ? "bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/30"
                      : "bg-zinc-700/30 text-zinc-300")
                  }
                >
                  {profile?.can_provide_referrals
                    ? "Referrals"
                    : "No Referrals"}
                </span>
                <span
                  className={
                    "rounded-full px-3 py-1 text-[11px] font-medium tracking-wide " +
                    (profile?.available_for_networking
                      ? "bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/30"
                      : "bg-zinc-700/30 text-zinc-300")
                  }
                >
                  {profile?.available_for_networking
                    ? "Networking"
                    : "Not Networking"}
                </span>
              </div>
              {Array.isArray(profile?.preferred_mentoring_topics) &&
                profile.preferred_mentoring_topics.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {profile.preferred_mentoring_topics.map(
                      (t: any, i: number) => (
                        <span
                          key={i}
                          className="rounded-md bg-zinc-800/60 px-2 py-1 text-[11px] text-zinc-300"
                        >
                          {String(t)}
                        </span>
                      )
                    )}
                  </div>
                )}
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  onEditSection([
                    "willing_to_mentor",
                    "can_provide_referrals",
                    "preferred_mentoring_topics",
                  ])
                }
              >
                Edit
              </Button>
            </div>
          </Collapse>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <Card
          id="about"
          onMouseEnter={() => {
            cancelClose("about");
            handleEnter("about");
          }}
          onMouseLeave={() => scheduleClose("about")}
        >
          <Header
            icon={BookOpen}
            title="About & Achievements"
            subtitle={
              profile?.notable_achievements
                ? "Achievements included"
                : undefined
            }
            section="about"
            expanded={isOpen("about")}
          />
          <Collapse open={isOpen("about")}>
            <div className="mt-4 space-y-5 text-sm">
              <div>
                <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                  Bio
                </div>
                <p className="whitespace-pre-wrap leading-relaxed text-zinc-200">
                  {profile?.bio?.trim() || "-"}
                </p>
              </div>
              <div>
                <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-zinc-400 inline-flex items-center gap-2">
                  Achievements
                  {profile?.notable_achievements?.trim() && (
                    <span className="rounded-full bg-zinc-800/60 px-2 py-0.5 text-[10px] text-zinc-400">
                      {
                        profile.notable_achievements
                          .split(/\n|\./)
                          .filter((s: string) => s.trim()).length
                      }{" "}
                      items
                    </span>
                  )}
                </div>
                <ul className="space-y-1 text-zinc-200">
                  {profile?.notable_achievements?.trim() ? (
                    profile.notable_achievements
                      .split(/\n|\./)
                      .map((s: string) => s.trim())
                      .filter(Boolean)
                      .map((s: string, i: number) => (
                        <li key={i} className="flex gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-yellow-400/80" />
                          <span className="flex-1 leading-snug">{s}</span>
                        </li>
                      ))
                  ) : (
                    <li className="text-zinc-500">-</li>
                  )}
                </ul>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEditSection(["bio", "notable_achievements"])}
              >
                Edit
              </Button>
            </div>
          </Collapse>
        </Card>

        <Card
          id="career"
          onMouseEnter={() => {
            cancelClose("career");
            handleEnter("career");
          }}
          onMouseLeave={() => scheduleClose("career")}
        >
          <Header
            icon={Briefcase}
            title="Career & Availability"
            subtitle={
              profile?.current_company
                ? String(profile.current_company)
                : undefined
            }
            section="career"
            expanded={isOpen("career")}
          />
          <Collapse open={isOpen("career")}>
            <div className="mt-4 space-y-5 text-sm">
              <div>
                <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                  Career Path
                </div>
                {Array.isArray(profile?.career_path) &&
                profile.career_path.length > 0 ? (
                  <ol className="relative ml-1 border-l border-zinc-700/60 pl-4">
                    {profile.career_path.map((c: any, i: number) => (
                      <li key={i} className="mb-3 last:mb-0">
                        <span className="absolute -left-[7px] mt-1 h-3 w-3 rounded-full border border-yellow-400/50 bg-zinc-900" />
                        <div className="text-zinc-200">{String(c)}</div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <div className="text-xs text-zinc-500">
                    No career path provided
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <span
                  className={
                    "rounded-full px-3 py-1 text-[11px] font-medium tracking-wide " +
                    (profile?.available_for_networking
                      ? "bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/30"
                      : "bg-zinc-700/30 text-zinc-300")
                  }
                >
                  {profile?.available_for_networking
                    ? "Networking"
                    : "Not Networking"}
                </span>
                {Array.isArray(profile?.preferred_communication) &&
                  profile.preferred_communication.length > 0 && (
                    <span className="rounded-full bg-zinc-800/60 px-3 py-1 text-[11px] text-zinc-300">
                      {profile.preferred_communication.join(", ")}
                    </span>
                  )}
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  onEditSection([
                    "career_path",
                    "available_for_networking",
                    "preferred_communication",
                  ])
                }
              >
                Edit
              </Button>
            </div>
          </Collapse>
        </Card>

        <Card
          id="account"
          onMouseEnter={() => {
            cancelClose("account");
            handleEnter("account");
          }}
          onMouseLeave={() => scheduleClose("account")}
        >
          <Header
            icon={CheckCircle}
            title="Account & Verification"
            subtitle={
              profile?.is_verified
                ? `Status: ${profile.is_verified}`
                : undefined
            }
            section="account"
            expanded={isOpen("account")}
          />
          <Collapse open={isOpen("account")}>
            <div className="mt-4 grid gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-zinc-500" />
                <span className="text-zinc-400">Social Account:</span>
                <span className="text-zinc-200">
                  {typeof profile?.has_social_account === "boolean"
                    ? profile.has_social_account
                      ? "Yes"
                      : "No"
                    : "-"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-zinc-500" />
                <span className="text-zinc-400">Public Profile:</span>
                <span className="text-zinc-200">
                  {typeof profile?.is_public === "boolean"
                    ? profile.is_public
                      ? "Yes"
                      : "No"
                    : "-"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-zinc-500" />
                <span className="text-zinc-400">Verification:</span>
                <span className="text-zinc-200">
                  {profile?.is_verified ?? "-"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-zinc-500" />
                <span className="text-zinc-400">Verified At:</span>
                <span className="text-zinc-200">
                  {profile?.verified_at
                    ? String(new Date(profile.verified_at).toLocaleString())
                    : "-"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-zinc-500" />
                <span className="text-zinc-400">Docs:</span>
                <span className="text-zinc-200">
                  {profile?.verification_docs ? "Uploaded" : "None"}
                </span>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  onEditSection([
                    "is_public",
                    "is_verified",
                    "verification_notes",
                  ])
                }
              >
                Edit
              </Button>
            </div>
          </Collapse>
        </Card>
      </div>
    </div>
  );
}
