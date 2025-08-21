import { apiClient } from "../api";
import { CreateExternalEventInput, ExternalEvent } from "@/types";

export interface EventListParams {
  mine?: boolean;
  status?: string;
  tag?: string;
  q?: string;
  after?: string;
  before?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface PaginatedEvents {
  count: number;
  page: number;
  page_size: number;
  results: ExternalEvent[];
}

export async function listExternalEvents(
  params: EventListParams = {}
): Promise<PaginatedEvents> {
  const query: any = {};
  if (params.mine) query.mine = "1";
  if (params.status) query.status = params.status;
  if (params.tag) query.tag = params.tag;
  if (params.q) query.q = params.q;
  if (params.after) query.after = params.after;
  if (params.before) query.before = params.before;
  if (params.ordering) query.ordering = params.ordering;
  if (params.page) query.page = params.page;
  if (params.page_size) query.page_size = params.page_size;
  const res = await apiClient.get<PaginatedEvents>("/external-events/", query);
  return res.data as any;
}

export async function createExternalEvent(
  data: CreateExternalEventInput
): Promise<ExternalEvent> {
  const res = await apiClient.post<ExternalEvent>("/external-events/", data);
  return res.data as any;
}

export async function getExternalEvent(id: number): Promise<ExternalEvent> {
  const res = await apiClient.get<ExternalEvent>(`/external-events/${id}/`);
  return res.data as any;
}

export async function approveExternalEvent(id: number, notes?: string) {
  const res = await apiClient.post<ExternalEvent>(
    `/external-events/${id}/approve/`,
    { notes }
  );
  return res.data as any;
}

export async function rejectExternalEvent(id: number, notes?: string) {
  const res = await apiClient.post<ExternalEvent>(
    `/external-events/${id}/reject/`,
    { notes }
  );
  return res.data as any;
}
