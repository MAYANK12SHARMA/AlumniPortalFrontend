import { ReactNode } from "react";
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
} from "lucide-react";

export type Role = "admin" | "alumni" | "student";

export type NavLeaf = {
  label: string;
  path: string;
  roles: Role[];
  requiresApi?: boolean; // if true, show a small note to add an API
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
    icon: <Home size={16} />,
    roles: ["admin", "alumni", "student"],
    pathByRole: {
      admin: "/dashboard/admin",
      alumni: "/dashboard/alumni",
      student: "/dashboard/student",
    },
  },
  {
    label: "Role Requests",
    icon: <Shield size={16} />,
    roles: ["admin"],
    children: [
      {
        label: "Pending Role Requests",
        path: "/dashboard/role-requests/admin/pending",
        roles: ["admin"],
      },
      {
        label: "Approved Role Requests",
        path: "/dashboard/role-requests/admin/approved",
        roles: ["admin"],
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
      },
      {
        label: "Pending Requests",
        path: "/dashboard/role-requests/pending",
        roles: ["student"],
      },
    ],
  },
  {
    label: "Directory",
    icon: <Users size={16} />,
    roles: ["admin", "alumni", "student"],
    children: [
      {
        label: "Alumni Directory",
        path: "/dashboard/directory/alumni",
        roles: ["admin", "alumni", "student"],
      },
      {
        label: "Student Directory",
        path: "/dashboard/directory/student",
        roles: ["admin", "alumni", "student"],
      },
    ],
  },
  {
    label: "Opportunities",
    icon: <Briefcase size={16} />,
    roles: ["admin", "alumni", "student"],
    children: [
      {
        label: "Upload Opportunity",
        path: "/dashboard/jobs/upload",
        roles: ["admin", "alumni"],
      },
      {
        label: "Uploaded Opportunities",
        path: "/dashboard/jobs/uploaded",
        roles: ["admin", "alumni", "student"],
      },
      {
        label: "Expired Opportunities",
        path: "/dashboard/jobs/expired",
        roles: ["admin", "alumni", "student"],
      },
    ],
  },
  {
    label: "Opportunity Requests",
    icon: <FolderKanban size={16} />,
    roles: ["admin"],
    children: [
      {
        label: "Pending Opportunities",
        path: "/dashboard/opportunities/pending",
        roles: ["admin"],
      },
      {
        label: "Approved Opportunities",
        path: "/dashboard/opportunities/approved",
        roles: ["admin"],
      },
      {
        label: "Expired Opportunities",
        path: "/dashboard/opportunities/expired",
        roles: ["admin"],
      },
    ],
  },
  {
    label: "Profile",
    icon: <UserIcon size={16} />,
    roles: ["admin", "alumni", "student"],
    children: [
      {
        label: "Update Profile",
        path: "/dashboard/profile/update",
        roles: ["admin", "alumni", "student"],
      },
      {
        label: "View Profile",
        path: "/dashboard/profile/view",
        roles: ["admin", "alumni", "student"],
      },
      {
        label: "Social Links",
        path: "/dashboard/profile/social-links",
        roles: ["admin", "alumni", "student"],
      },
    ],
  },
  {
    label: "Projects",
    icon: <School size={16} />,
    roles: ["student", "alumni"],
    children: [
      {
        label: "Upload Project",
        path: "/dashboard/projects/upload",
        roles: ["student", "alumni"],
      },
      {
        label: "My Projects",
        path: "/dashboard/projects/mine",
        roles: ["student", "alumni"],
      },
    ],
  },
  {
    label: "Achievements",
    icon: <Trophy size={16} />,
    roles: ["alumni"],
    children: [
      {
        label: "Share Achievement",
        path: "/dashboard/achievements/share",
        roles: ["alumni"],
      },
      {
        label: "My Achievements",
        path: "/dashboard/achievements/mine",
        roles: ["alumni"],
      },
    ],
  },
  {
    label: "Mentorship",
    icon: <Handshake size={16} />,
    roles: ["alumni", "student"],
    children: [
      {
        label: "Find a Mentor",
        path: "/dashboard/mentorship/find",
        roles: ["student"],
      },
      {
        label: "Offer Mentorship",
        path: "/dashboard/mentorship/offer",
        roles: ["alumni"],
      },
    ],
  },
  // Future placeholders (space reserved)
  {
    label: "Events (coming soon)",
    icon: <CalendarDays size={16} />,
    roles: ["admin", "alumni", "student"],
    children: [
      {
        label: "Campus Events",
        path: "#",
        roles: ["admin", "alumni", "student"],
        requiresApi: true,
      },
    ],
    placeholder: true,
  },
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
      },
    ],
    placeholder: true,
  },
];

export function navForRole(role: Role): NavNode[] {
  return NAV_ITEMS.filter((n) => n.roles.includes(role));
}
