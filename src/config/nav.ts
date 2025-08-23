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
  requiresApi?: boolean; // if true, show a small note to add an API
  icon?: ReactNode; // optional icon per leaf
};

export type NavNode = {
  label: string;
  icon?: ReactNode;
  roles: Role[];
  pathByRole?: Partial<Record<Role, string>>; // for single-click parent links like Dashboard
  children?: NavLeaf[];
  placeholder?: boolean; // future sections
};

// Central navigation definition with paths aligned to the existing app structure under /dashboard
export const NAV_ITEMS: NavNode[] = [
  {
    label: "Dashboard",
    icon: React.createElement(Home, { size: 16 }),
    roles: ["admin", "alumni", "student"],
    pathByRole: {
      admin: "/dashboard/admin",
      alumni: "/dashboard/alumni",
      student: "/dashboard/student",
    },
  },
  {
    label: "Role Requests",
    icon: React.createElement(Shield, { size: 16 }),
    roles: ["admin"],
    children: [
      {
        label: "Pending Role Requests",
        path: "/dashboard/role-requests/admin/pending",
        roles: ["admin"],
        icon: React.createElement(Hourglass, { size: 14 }),
      },
      {
        label: "Approved Role Requests",
        path: "/dashboard/role-requests/admin/approved",
        roles: ["admin"],
        icon: React.createElement(CheckCircle2, { size: 14 }),
      },
    ],
  },
  {
    label: "Ask Role Requests",
    icon: React.createElement(ClipboardList, { size: 16 }),
    roles: ["student"],
    children: [
      {
        label: "Apply Role Request",
        path: "/dashboard/role-requests/apply",
        roles: ["student"],
        icon: React.createElement(UploadCloud, { size: 14 }),
      },
      {
        label: "Pending Requests",
        path: "/dashboard/role-requests/pending",
        roles: ["student"],
        icon: React.createElement(Hourglass, { size: 14 }),
      },
    ],
  },
  {
    label: "Directory",
    icon: React.createElement(Users, { size: 16 }),
    roles: ["admin", "alumni", "student"],
    children: [
      {
        label: "Alumni Directory",
        path: "/dashboard/directory/alumni",
        roles: ["admin", "alumni", "student"],
        icon: React.createElement(Users, { size: 14 }),
      },
      {
        label: "Student Directory",
        path: "/dashboard/directory/student",
        roles: ["admin", "alumni", "student"],
        icon: React.createElement(Search, { size: 14 }),
      },
    ],
  },
  {
    label: "Opportunities",
    icon: React.createElement(Briefcase, { size: 16 }),
    roles: ["admin", "alumni", "student"],
    children: [
      {
        label: "Upload Opportunity",
        path: "/dashboard/jobs/upload",
        roles: ["admin", "alumni"],
        icon: React.createElement(FilePlus, { size: 14 }),
      },
      {
        label: "Uploaded Opportunities",
        path: "/dashboard/jobs/uploaded",
        roles: ["admin", "alumni", "student"],
        icon: React.createElement(ListChecks, { size: 14 }),
      },
      {
        label: "Expired Opportunities",
        path: "/dashboard/jobs/expired",
        roles: ["admin", "alumni", "student"],
        icon: React.createElement(XCircle, { size: 14 }),
      },
    ],
  },
  {
    label: "Opportunity Requests",
    icon: React.createElement(FolderKanban, { size: 16 }),
    roles: ["admin"],
    children: [
      {
        label: "Pending Opportunities",
        path: "/dashboard/opportunities/pending",
        roles: ["admin"],
        icon: React.createElement(Hourglass, { size: 14 }),
      },
      {
        label: "Approved Opportunities",
        path: "/dashboard/opportunities/approved",
        roles: ["admin"],
        icon: React.createElement(CheckCircle2, { size: 14 }),
      },
      {
        label: "Expired Opportunities",
        path: "/dashboard/opportunities/expired",
        roles: ["admin"],
        icon: React.createElement(XCircle, { size: 14 }),
      },
    ],
  },
  {
    label: "Profile",
    icon: React.createElement(UserIcon, { size: 16 }),
    roles: ["admin", "alumni", "student"],
    children: [
      // {
      //   label: "Update Profile",
      //   path: "/dashboard/profile/update",
      //   roles: ["admin", "alumni", "student"],
      // },
      {
        label: "View Profile",
        path: "/dashboard/profile/view",
        roles: ["admin", "alumni", "student"],
        icon: React.createElement(UserIcon, { size: 14 }),
      },
    ],
  },
  {
    label: "Projects",
    icon: React.createElement(School, { size: 16 }),
    roles: ["student", "alumni"],
    children: [
      {
        label: "Upload Project",
        path: "/dashboard/projects/upload",
        roles: ["student", "alumni"],
        icon: React.createElement(FilePlus, { size: 14 }),
      },
      {
        label: "My Projects",
        path: "/dashboard/projects/mine",
        roles: ["student", "alumni"],
        icon: React.createElement(Layers3, { size: 14 }),
      },
    ],
  },
  {
    label: "Achievements",
    icon: React.createElement(Trophy, { size: 16 }),
    roles: ["alumni"],
    children: [
      {
        label: "Share Achievement",
        path: "/dashboard/achievements/share",
        roles: ["alumni"],
        icon: React.createElement(Share2, { size: 14 }),
      },
      {
        label: "My Achievements",
        path: "/dashboard/achievements/mine",
        roles: ["alumni"],
        icon: React.createElement(Award, { size: 14 }),
      },
    ],
  },
  {
    label: "Mentorship",
    icon: React.createElement(Handshake, { size: 16 }),
    roles: ["alumni", "student"],
    children: [
      {
        label: "Find a Mentor",
        path: "/dashboard/mentorship/find",
        roles: ["student"],
        icon: React.createElement(Search, { size: 14 }),
      },
      {
        label: "Offer Mentorship",
        path: "/dashboard/mentorship/offer",
        roles: ["alumni"],
        icon: React.createElement(Handshake, { size: 14 }),
      },
    ],
  },
  // Future placeholders (space reserved)
  {
    label: "Events",
    icon: React.createElement(CalendarDays, { size: 16 }),
    roles: ["admin", "alumni", "student"],
    children: [
      {
        label: "Upcoming Events",
        path: "/dashboard/events/upcoming",
        roles: ["admin", "alumni", "student"],
        icon: React.createElement(CalendarDays, { size: 14 }),
      },
      {
        label: "Ongoing Events",
        path: "/dashboard/events/ongoing",
        roles: ["admin", "alumni", "student"],
        icon: React.createElement(Activity, { size: 14 }),
      },
      {
        label: "Expired Events",
        path: "/dashboard/events/expired",
        roles: ["admin", "alumni", "student"],
        icon: React.createElement(XCircle, { size: 14 }),
      },
    ],
  },
  {
    label: "Event Requests",
    icon: React.createElement(FolderKanban, { size: 16 }),
    roles: ["admin", "alumni", "student"],
    children: [
      {
        label: "Create Event",
        path: "/dashboard/events/create",
        roles: ["admin", "alumni", "student"],
        icon: React.createElement(FilePlus, { size: 14 }),
      },
      {
        label: "My Events",
        path: "/dashboard/events/mine",
        roles: ["admin", "alumni", "student"],
        icon: React.createElement(ListChecks, { size: 14 }),
      },
      {
        label: "Pending Events",
        path: "/dashboard/events/review",
        roles: ["admin"],
        icon: React.createElement(Hourglass, { size: 14 }),
      },
    ],
  },
  {
    label: "Resources (coming soon)",
    icon: React.createElement(BookOpen, { size: 16 }),
    roles: ["admin", "alumni", "student"],
    children: [
      {
        label: "Guides",
        path: "#",
        roles: ["admin", "alumni", "student"],
        requiresApi: true,
        icon: React.createElement(BookOpen, { size: 14 }),
      },
    ],
    placeholder: true,
  },
];

export function navForRole(role: Role): NavNode[] {
  return NAV_ITEMS.filter((n) => n.roles.includes(role));
}
