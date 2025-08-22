"use client";
import React, { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import apiClient from "@/lib/api";
import useRoleRequestEligibility from "@/hooks/useRoleRequestEligibility";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCw,
  FileText,
  AlertTriangle,
  ArrowLeft,
  ShieldX,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PendingResponse {
  success?: boolean;
  id?: number;
  status?: string;
  requested_role?: string;
  current_role?: string;
  admin_notes?: string | null;
  profile_data?: Record<string, any>;
  requested_at?: string;
  updated_at?: string;
}

export default function PendingRoleRequestPage() {
  return (
    <ProtectedRoute allowedRoles={["student", "alumni"]}>
      <RoleRequestStatusView />
    </ProtectedRoute>
  );
}

function RoleRequestStatusView() {
  const { pending, loading, error, refresh } = useRoleRequestEligibility({
    role: "alumni",
    fetchPendingDetails: true,
  });
  const [cancelling, setCancelling] = useState(false);
  const data = pending as PendingResponse | null;

  const handleCancel = async () => {
    if (!data?.id) return;
    setCancelling(true);
    try {
      await apiClient.patch(`/role-requests/${data.id}/`, { action: "cancel" });
      toast.success("Request cancelled");
      await refresh();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Cancel failed");
    } finally {
      setCancelling(false);
    }
  };

  const status = data?.status as string | undefined; // derived flags inline where needed

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      <header className="space-y-3">
        <Link
          href="/dashboard/role-requests/apply"
          className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Apply
        </Link>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
          Role Request Status
        </h1>
        <p className="text-sm text-zinc-400 max-w-2xl">
          Track the progress of your alumni role request. You can cancel a
          pending request while it is under review.
        </p>
      </header>

      <AnimatePresence mode="wait" initial={false}>
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="flex flex-col items-center justify-center py-24"
          >
            <Loader2 className="h-10 w-10 animate-spin text-amber-400" />
            <p className="mt-4 text-sm text-zinc-400">
              Loading current request…
            </p>
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-6"
          >
            <Card className="border-red-500/40 bg-red-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-300 text-base">
                  <AlertTriangle className="h-5 w-5" /> Error Loading Request
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-red-400">{error}</p>
                <Button onClick={refresh} variant="outline" className="gap-2">
                  <RotateCw className="h-4 w-4" /> Retry
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : !data ? (
          <motion.div
            key="none"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-8"
          >
            <EmptyState />
          </motion.div>
        ) : (
          <motion.div
            key={status}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-8"
          >
            <StatusCard
              data={data}
              onCancel={handleCancel}
              cancelling={cancelling}
            />
            <ProfileDataPreview data={data.profile_data || {}} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="relative border border-zinc-800 bg-zinc-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-5 w-5 text-amber-400" /> No Pending Request
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-zinc-400">
          You currently have no pending alumni role request. Start a new
          application to request alumni privileges.
        </p>
        <Button asChild className="gap-2">
          <Link href="/dashboard/role-requests/apply">
            Begin Application
            <Sparkles className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function StatusCard({
  data,
  onCancel,
  cancelling,
}: {
  data: PendingResponse;
  onCancel: () => void;
  cancelling: boolean;
}) {
  const status = data.status;
  const meta = getStatusMeta(status || "pending");
  return (
    <Card className={cn("relative border bg-zinc-900", meta.cardBorder)}>
      <CardHeader>
        <CardTitle
          className={cn("flex items-center gap-3 text-base", meta.titleColor)}
        >
          {meta.icon}
          <span className="font-semibold capitalize">{status}</span>
          <span
            className={cn(
              "ml-auto text-xs px-2 py-1 rounded-md border",
              meta.badgeBg,
              meta.badgeBorder,
              meta.badgeText
            )}
          >
            {data.requested_role || "alumni"}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 text-sm">
          <Meta label="Request ID" value={data.id} />
          <Meta
            label="Submitted"
            value={
              data.requested_at && new Date(data.requested_at).toLocaleString()
            }
          />
          <Meta
            label="Updated"
            value={
              data.updated_at && new Date(data.updated_at).toLocaleString()
            }
          />
          <Meta label="Current Role" value={data.current_role} />
        </div>
        {status === "rejected" && data.admin_notes && (
          <div className="p-4 rounded-lg border border-red-400/30 bg-red-500/10 text-xs text-red-200 space-y-2">
            <p className="font-medium flex items-center gap-2">
              <ShieldX className="h-4 w-4" /> Rejection Notes
            </p>
            <p className="leading-relaxed whitespace-pre-wrap text-red-300/90">
              {data.admin_notes}
            </p>
          </div>
        )}
        {status === "approved" && (
          <div className="p-4 rounded-lg border border-emerald-400/30 bg-emerald-500/10 text-xs text-emerald-200">
            Your alumni role has been approved. Enjoy the new features! 🎉
          </div>
        )}
        {status === "cancelled" && (
          <div className="p-4 rounded-lg border border-zinc-600/40 bg-zinc-800/40 text-xs text-zinc-300">
            This request was cancelled. You can submit a new one if you still
            need an alumni role.
          </div>
        )}
        {status === "pending" && (
          <div className="p-4 rounded-lg border border-amber-400/30 bg-amber-500/10 text-xs text-amber-200">
            Your request is under review. This usually takes 1–3 business days.
            You can cancel while it&apos;s pending.
          </div>
        )}
        <div className="flex flex-wrap gap-3 pt-2">
          <Button variant="outline" className="gap-2" onClick={fetchHard}>
            <RotateCw className="h-4 w-4" /> Refresh
          </Button>
          {status === "pending" && (
            <Button
              variant="danger"
              onClick={onCancel}
              disabled={cancelling}
              className="gap-2"
            >
              {cancelling && <Loader2 className="h-4 w-4 animate-spin" />}
              Cancel Request
              <XCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  function fetchHard() {
    window.location.reload();
  }
}

function ProfileDataPreview({ data }: { data: Record<string, any> }) {
  const entries = Object.entries(data).filter(
    ([k]) => !["request_id", "status", "created_at"].includes(k)
  );
  if (!entries.length) return null;
  return (
    <Card className="border border-zinc-800 bg-zinc-900 relative">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-5 w-5 text-amber-400" /> Submitted Profile Data
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {entries.map(([k, v]) => (
          <div
            key={k}
            className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 text-xs flex flex-col gap-1"
          >
            <span className="uppercase tracking-wide text-[10px] text-zinc-500 font-medium">
              {k.replace(/_/g, " ")}
            </span>
            <span className="text-zinc-300 break-words text-sm">
              {typeof v === "object" ? JSON.stringify(v) : String(v) || "—"}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function Meta({ label, value }: { label: string; value: any }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] uppercase tracking-wide text-zinc-500 font-medium">
        {label}
      </p>
      <p className="text-xs font-medium text-zinc-300">
        {value || <span className="text-zinc-600">—</span>}
      </p>
    </div>
  );
}

function getStatusMeta(status: string) {
  switch (status) {
    case "approved":
      return {
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
        cardBorder: "border-emerald-500/40",
        cardBg: "",
        titleColor: "text-emerald-300",
        badgeBg: "bg-emerald-500/15",
        badgeBorder: "border border-emerald-400/40",
        badgeText: "text-emerald-300",
        auraColor: "rgba(16,185,129,0.25)",
      };
    case "rejected":
      return {
        icon: <XCircle className="h-5 w-5 text-red-400" />,
        cardBorder: "border-red-500/40",
        cardBg: "",
        titleColor: "text-red-300",
        badgeBg: "bg-red-500/15",
        badgeBorder: "border border-red-400/40",
        badgeText: "text-red-300",
        auraColor: "rgba(248,113,113,0.25)",
      };
    case "cancelled":
      return {
        icon: <AlertTriangle className="h-5 w-5 text-zinc-300" />,
        cardBorder: "border-zinc-600/40",
        cardBg: "",
        titleColor: "text-zinc-200",
        badgeBg: "bg-zinc-500/15",
        badgeBorder: "border border-zinc-400/30",
        badgeText: "text-zinc-300",
        auraColor: "rgba(161,161,170,0.25)",
      };
    default:
      return {
        icon: <Clock className="h-5 w-5 text-amber-400" />,
        cardBorder: "border-amber-500/40",
        cardBg: "",
        titleColor: "text-amber-300",
        badgeBg: "bg-amber-500/15",
        badgeBorder: "border border-amber-400/40",
        badgeText: "text-amber-300",
        auraColor: "rgba(251,191,36,0.3)",
      };
  }
}
