"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, THead, TH, TR, TD } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function DirectoryPanel({ kind }: { kind: "alumni" | "students" }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const endpoint =
          kind === "alumni" ? "/directory/alumni/" : "/directory/students/";
        const res = await apiClient.get<any>(endpoint, {
          search,
          page_size: 5, // Reduced to show just a preview
        });
        const list =
          (res.data as any)?.profiles || (res as any)?.data?.results || [];
        if (mounted) setItems(list);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [kind, search]);

  const cols = useMemo(() => {
    if (kind === "alumni") return ["Name", "Company", "Position", "Year"];
    return ["Name", "Program", "Year", "GPA"];
  }, [kind]);

  const directoryPath = kind === "alumni" ? "/dashboard/admin/directory/alumni" : "/dashboard/admin/directory/students";

  return (
    <Card id={kind === "alumni" ? "alumni-directory" : "student-directory"}>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>
          {kind === "alumni" ? "Alumni Directory" : "Student Directory"}
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className="w-48">
            <Input
              placeholder="Search"
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearch(e.target.value)
              }
            />
          </div>
          <Link href={directoryPath}>
            <Button size="sm" variant="outline">
              <ArrowRight size={14} className="mr-1" />
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-zinc-400">Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-zinc-400">No records found</div>
        ) : (
          <>
            <Table>
              <THead>
                <TR>
                  {cols.map((c) => (
                    <TH key={c}>{c}</TH>
                  ))}
                </TR>
              </THead>
              <TBody>
                {items.slice(0, 5).map((p, i) => (
                  <TR key={p.id ?? i}>
                    {kind === "alumni" ? (
                      <>
                        <TD>
                          {`${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() ||
                            p.user?.name ||
                            "—"}
                        </TD>
                        <TD>{p.current_company || "—"}</TD>
                        <TD>{p.current_position || p.job_title || "—"}</TD>
                        <TD>{p.graduation_year || "—"}</TD>
                      </>
                    ) : (
                      <>
                        <TD>
                          {`${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() ||
                            p.user?.name ||
                            "—"}
                        </TD>
                        <TD>{p.program || "—"}</TD>
                        <TD>{p.current_year || "—"}</TD>
                        <TD>{p.gpa ?? "—"}</TD>
                      </>
                    )}
                  </TR>
                ))}
              </TBody>
            </Table>
            {items.length > 5 && (
              <div className="mt-4 text-center">
                <Link href={directoryPath}>
                  <Button variant="outline" size="sm">
                    View All {items.length} {kind === "alumni" ? "Alumni" : "Students"}
                    <ArrowRight size={14} className="ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default DirectoryPanel;
