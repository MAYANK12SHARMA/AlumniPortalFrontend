// Admin API endpoints

import { AxiosResponse } from "axios";
import {
  StatSummary,
  RoleRequest,
  RoleRequestReviewRequest,
} from "../../types";

export interface AdminApiClient {
  getAdminDashboardStats(): Promise<AxiosResponse<StatSummary>>;
  // getRoleRequests(
  //   status?: string
  // ): Promise<AxiosResponse<RoleRequestListResponse>>;
  reviewRoleRequest(
    requestId: number,
    review: RoleRequestReviewRequest
  ): Promise<AxiosResponse<RoleRequest>>;
}
