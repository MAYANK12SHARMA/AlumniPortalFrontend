import React, { ReactNode } from "react";
import {
  Home,
  Shield,
  Users,
  Briefcase,
  School,
  ClipboardList,
  FolderKanban,
  Trophy,
  Handshake,
  User as UserIcon,
  BookOpen,
  CalendarDays,
  FilePlus,
  ListChecks,
  Hourglass,
  CheckCircle2,
  XCircle,
  UploadCloud,
  Activity,
  Layers3,
  Award,
  Search,
  Share2,
} from "lucide-react";

export type Role = "admin" | "alumni" | "student";

export type NavLeaf = {
  label: string;
  path: string;
  roles: Role[];
  requiresApi?: boolean;
  icon?: ReactNode;
};

export type NavNode = {
  label: string;
  icon?: ReactNode;
  roles: Role[];
  pathByRole?: Partial<Record<Role, string>>;
  children?: NavLeaf[];
  placeholder?: boolean;
};

export const NAV_ITEMS: NavNode[] = [
  // ------------------ Dashboard ------------------
  {
    label: "Dashboard",
    icon: <Home size={16} />,
    roles: ["admin", "alumni", "student"],
    pathByRole: {
      admin: "/dashboard/admin",
      alumni: "/dashboard/alumni",
      student: "/dashboard/student",
    },
  },

  // ------------------ Requests ------------------
  {
    label: "Role Requests",
    icon: <Shield size={16} />,
    roles: ["admin"],
    children: [
      {
        label: "Pending Role Requests",
        path: "/dashboard/role-requests/admin/pending",
        roles: ["admin"],
        icon: <Hourglass size={14} />,
      },
      {
        label: "Approved Role Requests",
        path: "/dashboard/role-requests/admin/approved",
        roles: ["admin"],
        icon: <CheckCircle2 size={14} />,
      },
    ],
  },
  {
    label: "Ask Role Requests",
    icon: <ClipboardList size={16} />,
    roles: ["student"],
    children: [
      {
        label: "Apply Role Request",
        path: "/dashboard/role-requests/apply",
        roles: ["student"],
        icon: <UploadCloud size={14} />,
      },
      {
        label: "Pending Requests",
        path: "/dashboard/role-requests/pending",
        roles: ["student"],
        icon: <Hourglass size={14} />,
      },
    ],
  },
  {
    label: "Job Requests",
    icon: <FolderKanban size={16} />,
    roles: ["admin"],
    children: [
      {
        label: "Pending Jobs",
        path: "/dashboard/jobs/pending",
        roles: ["admin"],
        icon: <Hourglass size={14} />,
      },
      {
        label: "Approved Jobs",
        path: "/dashboard/jobs/approved",
        roles: ["admin"],
        icon: <CheckCircle2 size={14} />,
      },
    ],
  },

  // ------------------ Directory ------------------
  {
    label: "Directory",
    icon: <Users size={16} />,
    roles: ["admin", "alumni", "student"],
    children: [
      {
        label: "Alumni Directory",
        path: "/dashboard/directory/alumni",
        roles: ["admin", "alumni", "student"],
        icon: <Users size={14} />,
      },
      {
        label: "Student Directory",
        path: "/dashboard/directory/student",
        roles: ["admin", "alumni", "student"],
        icon: <Search size={14} />,
      },
    ],
  },

  // ------------------ Jobs ------------------
  {
    label: "Jobs",
    icon: <Briefcase size={16} />,
    roles: ["admin", "alumni", "student"],
    children: [
      {
        label: "Post Job",
        path: "/dashboard/jobs/upload",
        roles: ["admin", "alumni"],
        icon: <FilePlus size={14} />,
      },
      {
        label: "All Jobs",
        path: "/dashboard/jobs/uploaded",
        roles: ["admin", "alumni", "student"],
        icon: <ListChecks size={14} />,
      },
      {
        label: "Expired Jobs",
        path: "/dashboard/jobs/expired",
        roles: ["admin", "alumni", "student"],
        icon: <XCircle size={14} />,
      },
      {
        label: "My Submissions",
        path: "/dashboard/jobs/uploaded?mine=1",
        roles: ["admin", "alumni"],
        icon: <ClipboardList size={14} />,
      },
    ],
  },

  // ------------------ Projects ------------------
  {
    label: "Projects",
    icon: <School size={16} />,
    roles: ["student", "alumni"],
    children: [
      {
        label: "Upload Project",
        path: "/dashboard/projects/upload",
        roles: ["student", "alumni"],
        icon: <FilePlus size={14} />,
      },
      {
        label: "My Projects",
        path: "/dashboard/projects/mine",
        roles: ["student", "alumni"],
        icon: <Layers3 size={14} />,
      },
    ],
  },

  // ------------------ Achievements ------------------
  {
    label: "Achievements",
    icon: <Trophy size={16} />,
    roles: ["alumni"],
    children: [
      {
        label: "Share Achievement",
        path: "/dashboard/achievements/share",
        roles: ["alumni"],
        icon: <Share2 size={14} />,
      },
      {
        label: "My Achievements",
        path: "/dashboard/achievements/mine",
        roles: ["alumni"],
        icon: <Award size={14} />,
      },
    ],
  },

  // ------------------ Mentorship ------------------
  {
    label: "Mentorship",
    icon: <Handshake size={16} />,
    roles: ["alumni", "student"],
    children: [
      {
        label: "Find a Mentor",
        path: "/dashboard/mentorship/find",
        roles: ["student"],
        icon: <Search size={14} />,
      },
      {
        label: "Offer Mentorship",
        path: "/dashboard/mentorship/offer",
        roles: ["alumni"],
        icon: <Handshake size={14} />,
      },
    ],
  },

  // ------------------ Events ------------------
  {
    label: "Events",
    icon: <CalendarDays size={16} />,
    roles: ["admin", "alumni", "student"],
    children: [
      {
        label: "Upcoming Events",
        path: "/dashboard/events/upcoming",
        roles: ["admin", "alumni", "student"],
        icon: <CalendarDays size={14} />,
      },
      {
        label: "Ongoing Events",
        path: "/dashboard/events/ongoing",
        roles: ["admin", "alumni", "student"],
        icon: <Activity size={14} />,
      },
      {
        label: "Expired Events",
        path: "/dashboard/events/expired",
        roles: ["admin", "alumni", "student"],
        icon: <XCircle size={14} />,
      },
    ],
  },
  {
    label: "Event Requests",
    icon: <FolderKanban size={16} />,
    roles: ["admin", "alumni", "student"],
    children: [
      {
        label: "Create Event",
        path: "/dashboard/events/create",
        roles: ["admin", "alumni", "student"],
        icon: <FilePlus size={14} />,
      },
      {
        label: "My Events",
        path: "/dashboard/events/mine",
        roles: ["admin", "alumni", "student"],
        icon: <ListChecks size={14} />,
      },
      {
        label: "Pending Events",
        path: "/dashboard/events/review",
        roles: ["admin"],
        icon: <Hourglass size={14} />,
      },
    ],
  },

  // ------------------ Profile ------------------
  {
    label: "Profile",
    icon: <UserIcon size={16} />,
    roles: ["admin", "alumni", "student"],
    children: [
      {
        label: "View Profile",
        path: "/dashboard/profile/view",
        roles: ["admin", "alumni", "student"],
        icon: <UserIcon size={14} />,
      },
    ],
  },

  // ------------------ Resources (placeholder) ------------------
  {
    label: "Resources (coming soon)",
    icon: <BookOpen size={16} />,
    roles: ["admin", "alumni", "student"],
    children: [
      {
        label: "Guides",
        path: "#",
        roles: ["admin", "alumni", "student"],
        requiresApi: true,
        icon: <BookOpen size={14} />,
      },
    ],
    placeholder: true,
  },
];

// ------------------ Utility ------------------
export function navForRole(role: Role): NavNode[] {
  return NAV_ITEMS.filter((n) => n.roles.includes(role));
}
