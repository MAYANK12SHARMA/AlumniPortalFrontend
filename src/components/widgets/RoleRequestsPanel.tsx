"use client";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, THead, TH, TR, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type RoleRequest = {
  id?: number | string;
  user_email?: string;
  user?: { email?: string };
  requested_role?: string;
  role?: string;
  status?: string;
  requested_at?: string;
  updated_at?: string;
};

export function RoleRequestsPanel({
  title = "Role Requests",
  requests = [] as RoleRequest[],
}) {
  const groups = useMemo(() => {
    const pending = requests.filter(
      (r) => (r.status || "pending").toLowerCase() === "pending"
    );
    const approved = requests.filter(
      (r) => (r.status || "pending").toLowerCase() === "approved"
    );
    const rejected = requests.filter(
      (r) => (r.status || "").toLowerCase() === "rejected"
    );
    return { pending, approved, rejected };
  }, [requests]);

  const Section = ({
    label,
    items,
  }: {
    label: string;
    items: RoleRequest[];
  }) => (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-sm text-zinc-400">No records</div>
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>User</TH>
                <TH>Role</TH>
                <TH>Status</TH>
                <TH>Requested</TH>
              </TR>
            </THead>
            <TBody>
              {items.map((r, i) => (
                <TR key={r.id ?? i}>
                  <TD>{r.user_email || r.user?.email || "—"}</TD>
                  <TD>{r.requested_role || r.role || "alumni"}</TD>
                  <TD>
                    <Badge
                      variant={
                        (r.status || "pending").toLowerCase() === "approved"
                          ? "success"
                          : (r.status || "pending").toLowerCase() === "pending"
                          ? "warning"
                          : "secondary"
                      }
                    >
                      {r.status || "pending"}
                    </Badge>
                  </TD>
                  <TD>
                    {r.requested_at?.slice(0, 10) ||
                      r.updated_at?.slice(0, 10) ||
                      "—"}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Section
        label={`${title} • Pending (${groups.pending.length})`}
        items={groups.pending}
      />
      <Section
        label={`${title} • Approved (${groups.approved.length})`}
        items={groups.approved}
      />
      <Section
        label={`${title} • Rejected (${groups.rejected.length})`}
        items={groups.rejected}
      />
    </div>
  );
}

export default RoleRequestsPanel;
