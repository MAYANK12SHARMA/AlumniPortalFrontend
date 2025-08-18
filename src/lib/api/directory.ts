// Directory API endpoints

import { AxiosResponse } from "axios";
import {
  DirectoryFilters,
  DirectoryResponse,
  DirectoryStats,
} from "../../types";

export interface DirectoryApiClient {
  getAlumniDirectory(
    filters: DirectoryFilters
  ): Promise<AxiosResponse<DirectoryResponse>>;
  getStudentDirectory(
    filters: DirectoryFilters
  ): Promise<AxiosResponse<DirectoryResponse>>;
  getDirectoryStats(): Promise<AxiosResponse<DirectoryStats>>;
}
