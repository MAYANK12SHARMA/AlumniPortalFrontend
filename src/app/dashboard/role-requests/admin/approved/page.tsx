"use client";
import { useEffect, useMemo, useState, Fragment } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, THead, TH, TR, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/api";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X as CloseIcon,
  Eye,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import toast from "react-hot-toast";

type RoleRequest = {
  id: number;
  user: number | { id: number; email?: string };
  user_email?: string;
  requested_role: string;
  current_role: string;
  status: string;
  profile_data: Record<string, any>;
  requested_at: string;
  updated_at: string;
};

type ApiResponseShape = {
  success?: boolean;
  data?: RoleRequest[];
  requests?: RoleRequest[];
  pagination?: {
    total?: number;
    count?: number;
    page: number;
    pages?: number;
    total_pages?: number;
    page_size: number;
    next?: string | null;
    previous?: string | null;
  };
};

function formatDate(dt?: string) {
  if (!dt) return "-";
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return dt as string;
  }
}

export default function AdminApprovedRoleRequestsPage() {
  const [items, setItems] = useState<RoleRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selected, setSelected] = useState<RoleRequest | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [avatarErrored, setAvatarErrored] = useState(false);

  // Preview popup state for images/PDFs/files
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [previewType, setPreviewType] = useState<
    "image" | "pdf" | "file" | "url"
  >("file");
  const [previewName, setPreviewName] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null);

  const approvedCount = useMemo(
    () =>
      items.filter((i) => (i.status || "").toLowerCase() === "approved").length,
    [items]
  );

  async function load(p = page) {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<ApiResponseShape>(
        "/admin/role-requests/",
        {
          status: "approved",
          page: p,
        } as any
      );
      const data = (res as any).data || (res as any) || {};
      const list: RoleRequest[] = (data.data || data.requests || []).filter(
        (i: RoleRequest) => (i.status || "").toLowerCase() === "approved"
      );
      const pag = data.pagination || {};
      setItems(list);
      setPage(pag.page || p || 1);
      setPageSize(pag.page_size || pageSize);
      setTotalPages(pag.total_pages || pag.pages || 1);
    } catch (e: any) {
      console.error("Failed to load role requests", e);
      setError(
        e?.response?.data?.detail ||
          e?.message ||
          "Failed to fetch approved requests"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleRow = (id: number) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  async function openDetail(id: number) {
    setDetailLoading(true);
    setAvatarErrored(false);
    try {
      const res = await apiClient.get(`/admin/role-requests/${id}/`);
      const payload = (res as any).data || (res as any) || {};
      const req = payload.data || {};
      setSelected({
        id: req.id ?? id,
        user: req.user ?? payload.user?.id ?? req.user_id,
        user_email: payload.user?.email || req.user_email,
        requested_role: req.requested_role,
        current_role: req.current_role,
        status: req.status,
        profile_data: payload.profile_data || req.profile_data || {},
        requested_at: req.requested_at,
        updated_at: req.updated_at,
      });
      setSelectedUser(payload.user || null);
      setModalOpen(true);
    } catch (e: any) {
      console.error("Failed to load request detail", e);
      toast.error(e?.response?.data?.message || "Failed to load details");
    } finally {
      setDetailLoading(false);
    }
  }

  // Helpers to normalize media fields from API which may be string URL or object { url, name, content_type }
  function normalizeMedia(input: any): {
    url: string | null;
    name?: string;
    contentType?: string;
    kind: "image" | "pdf" | "file" | "url";
  } {
    if (!input) return { url: null, kind: "file" } as any;
    let url: string | null = null;
    let name: string | undefined;
    let contentType: string | undefined;
    if (typeof input === "string") {
      url = input;
      if (/\.pdf($|\?)/i.test(url))
        return { url, name, contentType, kind: "pdf" } as any;
      if (/\.(png|jpe?g|gif|webp|bmp|svg)($|\?)/i.test(url))
        return { url, name, contentType, kind: "image" } as any;
      return { url, name, contentType, kind: "url" } as any;
    }
    if (typeof input === "object") {
      url = input.url || input.href || input.path || null;
      name = input.name;
      contentType =
        input.content_type || input.contentType || input.mime || undefined;
    }
    const ct = (contentType || "").toLowerCase();
    if (ct.startsWith("image/"))
      return { url, name, contentType, kind: "image" } as any;
    if (ct === "application/pdf" || /\.pdf($|\?)/i.test(url || ""))
      return { url, name, contentType, kind: "pdf" } as any;
    if (url) return { url, name, contentType, kind: "file" } as any;
    return { url: null, name, contentType, kind: "file" } as any;
  }

  function isCrossOrigin(url: string) {
    try {
      const u = new URL(url, window.location.href);
      return u.origin !== window.location.origin;
    } catch {
      return true;
    }
  }

  async function fetchAsBlobUrl(url: string): Promise<string> {
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const objUrl = URL.createObjectURL(blob);
    return objUrl;
  }

  async function openPreview(media: {
    url: string | null;
    name?: string;
    kind: "image" | "pdf" | "file" | "url";
  }) {
    if (!media.url) return;
    setPreviewError(null);
    setPreviewLoading(false);
    if (previewObjectUrl) {
      URL.revokeObjectURL(previewObjectUrl);
      setPreviewObjectUrl(null);
    }
    setPreviewName(media.name || "");
    setPreviewType(media.kind);
    setPreviewUrl(media.url);
    setPreviewOpen(true);

    if (
      media.kind === "pdf" ||
      media.kind === "file" ||
      isCrossOrigin(media.url)
    ) {
      try {
        setPreviewLoading(true);
        let objUrl: string;
        try {
          objUrl = await fetchAsBlobUrl(media.url);
        } catch {
          const proxyUrl = `/api/file-proxy?url=${encodeURIComponent(
            media.url
          )}`;
          objUrl = await fetchAsBlobUrl(proxyUrl);
        }
        setPreviewUrl(objUrl);
        setPreviewObjectUrl(objUrl);
      } catch (e: any) {
        setPreviewError(
          "Preview is blocked by the file server. Use Open to view in a new tab."
        );
      } finally {
        setPreviewLoading(false);
      }
    }
  }

  return (
    <ProtectedRoute requireAuth allowedRoles={["admin"]}>
      <div className="space-y-4">
        {/* Breadcrumb */}
        <div className="text-xs text-zinc-400">
          <span className="text-zinc-500">dashboard</span>
          <span className="mx-2">›</span>
          <span className="text-zinc-300">dashboard/role-request/approved</span>
        </div>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              Approved Role Requests
              <Badge variant="success">{approvedCount} approved</Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => load(page)}
                disabled={loading}
                title="Refresh"
              >
                <RefreshCw
                  size={14}
                  className={loading ? "animate-spin" : ""}
                />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-3 text-sm text-red-400 border border-red-900/40 bg-red-900/10 rounded-lg p-3">
                {error}
              </div>
            )}

            <div className="overflow-x-auto rounded-lg border border-zinc-800">
              <Table>
                <THead className="border-b border-zinc-800">
                  <TR>
                    <TH className="py-3 px-4 text-left">ID</TH>
                    <TH className="py-3 px-4 text-left">User</TH>
                    <TH className="py-3 px-4 text-left">Requested</TH>
                    <TH className="py-3 px-4 text-left">Current</TH>
                    <TH className="py-3 px-4 text-left">Requested At</TH>
                    <TH className="py-3 px-4 text-left">Status</TH>
                    <TH className="py-3 px-4 text-right">Actions</TH>
                  </TR>
                </THead>
                <TBody className="divide-y divide-zinc-800/80">
                  {loading ? (
                    <TR>
                      <TD
                        colSpan={7}
                        className="py-8 text-center text-zinc-400"
                      >
                        Loading approved requests...
                      </TD>
                    </TR>
                  ) : items.length === 0 ? (
                    <TR>
                      <TD
                        colSpan={7}
                        className="py-8 text-center text-zinc-400"
                      >
                        No approved requests found.
                      </TD>
                    </TR>
                  ) : (
                    items.map((r) => (
                      <Fragment key={r.id}>
                        <TR className="hover:bg-zinc-900/40">
                          <TD className="py-3 px-4">#{r.id}</TD>
                          <TD className="py-3 px-4">
                            {(() => {
                              const pd: any = r.profile_data || {};
                              const fullName = [pd.first_name, pd.last_name]
                                .filter(Boolean)
                                .join(" ");
                              const email =
                                r.user_email ||
                                (typeof r.user === "object"
                                  ? r.user.email
                                  : "-");
                              return (
                                <div>
                                  <div className="text-sm text-zinc-100">
                                    {fullName || "-"}
                                  </div>
                                  <div className="text-xs text-zinc-400">
                                    {email}
                                  </div>
                                </div>
                              );
                            })()}
                          </TD>
                          <TD className="py-3 px-4 capitalize">
                            {r.requested_role}
                          </TD>
                          <TD className="py-3 px-4 capitalize text-zinc-300">
                            {r.current_role}
                          </TD>
                          <TD className="py-3 px-4">
                            {formatDate(r.requested_at)}
                          </TD>
                          <TD className="py-3 px-4">
                            <Badge variant="success" className="capitalize">
                              {r.status}
                            </Badge>
                          </TD>
                          <TD className="py-3 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDetail(Number(r.id))}
                                title="View"
                              >
                                <Eye size={14} className="mr-1" /> View
                              </Button>
                            </div>
                          </TD>
                        </TR>
                        {expanded[r.id] && (
                          <TR>
                            <TD colSpan={7} className="bg-black/40">
                              <div className="p-4 grid gap-4 md:grid-cols-3">
                                {Object.entries(r.profile_data || {}).map(
                                  ([key, val]) => (
                                    <div key={key} className="space-y-1">
                                      <div className="text-[11px] uppercase tracking-wide text-zinc-400">
                                        {key.replace(/_/g, " ")}
                                      </div>
                                      <div className="text-sm text-zinc-100 break-words">
                                        {typeof val === "boolean"
                                          ? val
                                            ? "Yes"
                                            : "No"
                                          : String(val ?? "-")}
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </TD>
                          </TR>
                        )}
                      </Fragment>
                    ))
                  )}
                </TBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-zinc-400">
                Page {page} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={loading || page <= 1}
                  onClick={() => {
                    const p = Math.max(1, page - 1);
                    setPage(p);
                    load(p);
                  }}
                >
                  <ChevronLeft size={14} className="mr-1" /> Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={loading || page >= totalPages}
                  onClick={() => {
                    const p = Math.min(totalPages, page + 1);
                    setPage(p);
                    load(p);
                  }}
                >
                  Next <ChevronRight size={14} className="ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal: Request Detail (read-only) */}
        {modalOpen && (
          <div className="fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setModalOpen(false)}
            />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="w-full max-w-4xl rounded-xl border border-zinc-800 bg-black/80 shadow-xl">
                <div className="flex items-center justify-between border-b border-zinc-800 p-4">
                  <div className="text-sm font-semibold text-zinc-100">
                    Role Request
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setModalOpen(false)}
                  >
                    <CloseIcon size={16} />
                  </Button>
                </div>
                <div className="max-h-[80vh] overflow-auto p-4">
                  {detailLoading || !selected ? (
                    <div className="p-6 text-center text-zinc-400">
                      Loading…
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Header info */}
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div
                          className="h-14 w-14 shrink-0 rounded-full overflow-hidden border border-zinc-800 bg-zinc-900 flex items-center justify-center text-yellow-300 font-medium cursor-pointer"
                          title="Click to preview"
                          onClick={() => {
                            const pic =
                              (selected as any).profile_data?.profile_picture ||
                              (selected as any).profile_data?.profile_image;
                            const media = normalizeMedia(pic);
                            if (media.url) openPreview(media);
                          }}
                        >
                          {(() => {
                            const rawPic =
                              (selected as any).profile_data?.profile_image ||
                              (selected as any).profile_data?.profile_picture ||
                              (selectedUser as any)?.profile_image ||
                              (selectedUser as any)?.avatar ||
                              "";
                            const avatarSrc =
                              typeof rawPic === "object"
                                ? rawPic?.url || rawPic?.path || ""
                                : rawPic;
                            const pd: any =
                              (selected as any).profile_data || {};
                            const displayName =
                              [pd.first_name, pd.last_name]
                                .filter(Boolean)
                                .join(" ") ||
                              selectedUser?.name ||
                              "";
                            const initials = (
                              displayName ||
                              selected.user_email ||
                              "?"
                            )
                              .split(" ")
                              .map((p: string) => p[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase();
                            return avatarSrc && !avatarErrored ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={avatarSrc}
                                alt="avatar"
                                className="h-full w-full object-cover"
                                onError={() => setAvatarErrored(true)}
                              />
                            ) : (
                              <span>{initials}</span>
                            );
                          })()}
                        </div>
                        <div className="flex-1">
                          {(() => {
                            const pd: any =
                              (selected as any).profile_data || {};
                            const fullName = [pd.first_name, pd.last_name]
                              .filter(Boolean)
                              .join(" ");
                            return (
                              <>
                                <div className="text-zinc-100 text-sm font-semibold">
                                  {fullName ||
                                    selectedUser?.name ||
                                    selected.user_email ||
                                    "User"}
                                </div>
                                <div className="text-xs text-zinc-400">
                                  {selectedUser?.email || selected.user_email}
                                </div>
                              </>
                            );
                          })()}
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                            <Badge variant="secondary" className="capitalize">
                              Requested: {selected.requested_role}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              Current: {selected.current_role}
                            </Badge>
                            <Badge variant="success">
                              {formatDate(selected.requested_at)}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Profile data grid */}
                      <div className="rounded-lg border border-zinc-800">
                        <div className="grid gap-4 p-4 md:grid-cols-3">
                          {(() => {
                            const docCatalog = [
                              {
                                key: "linkedin_profile",
                                label: "LinkedIn Profile",
                                type: "url",
                              },
                              {
                                key: "resume",
                                label: "Resume/CV",
                                type: "file",
                              },
                              {
                                key: "degree_certificate",
                                label: "Degree Certificate",
                                type: "file",
                              },
                              {
                                key: "transcript",
                                label: "Transcript",
                                type: "file",
                              },
                              {
                                key: "id_card",
                                label: "Student/Alumni ID",
                                type: "file",
                              },
                              {
                                key: "employment_proof",
                                label: "Employment Proof",
                                type: "file",
                              },
                              {
                                key: "company_email",
                                label: "Company Email",
                                type: "string",
                              },
                            ];
                            const excludeKeys = new Set(
                              docCatalog.map((d) => d.key)
                            );
                            // Also exclude media/object fields that are shown in Verification & Proofs
                            excludeKeys.add("profile_picture");
                            excludeKeys.add("profile_image");
                            excludeKeys.add("verification_docs");
                            excludeKeys.add("verification_doc");
                            const entries = Object.entries(
                              selected.profile_data || {}
                            ).filter(([key]) => !excludeKeys.has(key));
                            return entries.map(([key, val]) => (
                              <div key={key} className="space-y-1">
                                <div className="text-[11px] uppercase tracking-wide text-zinc-400">
                                  {key.replace(/_/g, " ")}
                                </div>
                                <div className="text-sm text-zinc-100 break-words">
                                  {typeof val === "boolean"
                                    ? val
                                      ? "Yes"
                                      : "No"
                                    : val == null
                                    ? "-"
                                    : typeof val === "object"
                                    ? "-"
                                    : String(val)}
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>

                      {/* Verification & Proofs */}
                      <div className="rounded-lg border border-zinc-800 p-4">
                        <div className="text-sm font-medium text-zinc-200 mb-3">
                          Verification & Proofs
                        </div>
                        {(() => {
                          const pd = (selected as any).profile_data || {};
                          const profilePicture = normalizeMedia(
                            pd.profile_picture || pd.profile_image
                          );
                          const verificationDoc = normalizeMedia(
                            pd.verification_docs ||
                              pd.verification_doc ||
                              pd.degree_certificate ||
                              pd.transcript
                          );
                          return (
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="flex items-center justify-between rounded-md border border-zinc-800/70 bg-zinc-900/30 p-3">
                                <div className="flex items-center gap-2 text-sm">
                                  <ImageIcon
                                    size={16}
                                    className="text-yellow-300"
                                  />
                                  <div>
                                    <div className="text-zinc-200">
                                      Profile Picture
                                    </div>
                                    <div className="text-xs text-zinc-400 truncate max-w-[220px]">
                                      {profilePicture.name ||
                                        (profilePicture.url
                                          ? profilePicture.url
                                          : "Not provided")}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {profilePicture.url ? (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        openPreview(profilePicture)
                                      }
                                    >
                                      View
                                    </Button>
                                  ) : (
                                    <Badge variant="outline">Missing</Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center justify-between rounded-md border border-zinc-800/70 bg-zinc-900/30 p-3">
                                <div className="flex items-center gap-2 text-sm">
                                  {verificationDoc.kind === "image" ? (
                                    <ImageIcon
                                      size={16}
                                      className="text-yellow-300"
                                    />
                                  ) : (
                                    <FileText
                                      size={16}
                                      className="text-yellow-300"
                                    />
                                  )}
                                  <div>
                                    <div className="text-zinc-200">
                                      Verification Document
                                    </div>
                                    <div className="text-xs text-zinc-400 truncate max-w-[220px]">
                                      {verificationDoc.name ||
                                        (verificationDoc.url
                                          ? verificationDoc.url
                                          : "Not provided")}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {verificationDoc.url ? (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        openPreview(verificationDoc)
                                      }
                                    >
                                      View
                                    </Button>
                                  ) : (
                                    <Badge variant="outline">Missing</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview popup */}
        {previewOpen && (
          <div className="fixed inset-0 z-[60]">
            <div
              className="absolute inset-0 bg-black/80"
              onClick={() => {
                setPreviewOpen(false);
                if (previewObjectUrl) {
                  URL.revokeObjectURL(previewObjectUrl);
                  setPreviewObjectUrl(null);
                }
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="w-full max-w-5xl rounded-xl border border-zinc-800 bg-zinc-950 shadow-xl overflow-hidden">
                <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
                  <div className="text-sm font-medium text-zinc-200 truncate pr-2">
                    {previewName || "Preview"}
                  </div>
                  <div className="flex items-center gap-2">
                    {previewUrl && (
                      <a
                        href={previewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-yellow-300 hover:underline"
                        title="Open in new tab"
                      >
                        Open
                      </a>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setPreviewOpen(false);
                        if (previewObjectUrl) {
                          URL.revokeObjectURL(previewObjectUrl);
                          setPreviewObjectUrl(null);
                        }
                      }}
                    >
                      <CloseIcon size={16} />
                    </Button>
                  </div>
                </div>
                <div className="max-h-[80vh] overflow-auto bg-black">
                  {previewLoading ? (
                    <div className="p-6 text-center text-sm text-zinc-300">
                      Loading preview…
                    </div>
                  ) : previewType === "image" && previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewUrl}
                      alt={previewName || "preview"}
                      className="block max-h-[80vh] mx-auto object-contain"
                    />
                  ) : previewType === "pdf" && previewUrl ? (
                    <iframe
                      src={previewUrl}
                      title={previewName || "document"}
                      className="w-full h-[80vh]"
                    />
                  ) : previewUrl ? (
                    <div className="p-6 text-center text-sm text-zinc-300">
                      {previewError ? (
                        <span className="block mb-2 text-red-300">
                          {previewError}
                        </span>
                      ) : (
                        <span>Preview not available.</span>
                      )}
                      <a
                        href={previewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-yellow-300 underline ml-1"
                      >
                        Open file
                      </a>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-sm text-zinc-300">
                      No preview available.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
