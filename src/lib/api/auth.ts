// Authentication API endpoints

import { AxiosResponse } from "axios";
import {
  AuthTokens,
  User,
  ApiResponse,
  AuthLoginRequest,
  AuthRegisterRequest,
  AuthActivationRequest,
  AuthRefreshRequest,
  AuthResendActivationRequest,
  LoginResponse,
  RegisterResponse,
  ActivationResponse,
  RefreshTokenResponse,
} from "../../types";

export interface AuthApiClient {
  login(request: AuthLoginRequest): Promise<AxiosResponse<LoginResponse>>;
  register(
    request: AuthRegisterRequest
  ): Promise<AxiosResponse<RegisterResponse>>;
  activateAccount(
    request: AuthActivationRequest
  ): Promise<AxiosResponse<ActivationResponse>>;
  resendActivationEmail(
    request: AuthResendActivationRequest
  ): Promise<AxiosResponse<any>>;
  refreshAccessToken(
    request: AuthRefreshRequest
  ): Promise<AxiosResponse<RefreshTokenResponse>>;
  getCurrentUser(): Promise<AxiosResponse<User>>;
  logout(): Promise<void>;
}
