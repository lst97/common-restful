/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NavigateFunction } from "react-router-dom";
import { AxiosInstance, AxiosResponse } from "axios";
import { BackendStandardResponse } from "@lst97/common-response-structure";
import { InvalidApiResponseStructure } from "../errors/ApiErrors";
import { ReactTokenServiceInstance } from "@lst97/common-services";
import { injectable } from "inversify";
import { inversifyContainer } from "../inversify.config";

export interface IApiErrorHandler {
  handleError(error: any): void;
}
export class SnackbarApiErrorHandler implements IApiErrorHandler {
  private showSnackbar?: (message: string, severity: "error") => void;

  public handleError(error: any): void {
    if (error.response) {
      this.handleServerError(error.response);
    }
  }
  public useSnackbar(
    showSnackbar: (message: string, severity: "error") => void,
  ) {
    this.showSnackbar = showSnackbar;
  }

  private handleServerError(response: AxiosResponse) {
    const structuredResponse = response.data as BackendStandardResponse<any>;
    if (response.status >= 400) {
      this.showSnackbar!(structuredResponse.message.message, "error");
    }
  }
}
export class ApiAuthenticationErrorHandler implements IApiErrorHandler {
  private navigate?: NavigateFunction;
  private showSnackbar?: (message: string, severity: "error") => void;
  private redirectPath?: string;

  public handleError(error: any): void {
    if (error.response) {
      this.handleServerError(error.response);
    }
  }

  public useNavigate(navigate: NavigateFunction, redirectTo: string) {
    this.navigate = navigate;
    this.redirectPath = redirectTo;
  }

  public useSnackbar(
    showSnackbar: (message: string, severity: "error") => void,
  ) {
    this.showSnackbar = showSnackbar;
  }

  private handleServerError(response: AxiosResponse) {
    switch (response.status) {
      case 401:
      case 403:
        ReactTokenServiceInstance().removeToken("accessToken");
        if (this.navigate && this.redirectPath) {
          this.navigate(this.redirectPath, { replace: true });
        }

        if (this.showSnackbar) {
          this.showSnackbar("Session expired. Please sign in again", "error");
        }

        break;
    }
  }
}

export class ConsoleLogApiErrorHandler implements IApiErrorHandler {
  public handleError(error: any): void {
    if (error instanceof InvalidApiResponseStructure) {
      console.log(error.message);
      // Display a generic error message to the user
    }
    // Centralized logic for handling all API errors
    if (error.response) {
      // The request was made and the server responded with a status code outside of the 2xx range
      this.handleServerError(error.response);
    } else if (error.request) {
      // The request was made but no response was received. Network issue, timeout, etc.
      console.error("Network Error:", error.request);
      // You might want to display a generic network error message to the user
    } else {
      // Something happened in setting up the request
      console.error("Unexpected API Error:", error.message);
    }
  }

  private handleServerError(response: AxiosResponse) {
    switch (response.status) {
      case 400:
        console.error("Bad Request:", response.data);
        // Handle specific 400 errors with user-friendly messages
        break;
      // ... other cases
      default:
        console.error("Generic Server Error:", response.data);
    }
  }
}

export interface IApiService {
  get(url: string, config?: any): Promise<BackendStandardResponse<any>>;
  post(
    url: string,
    data: any,
    config?: any,
  ): Promise<BackendStandardResponse<any>>;
  put(
    url: string,
    data: any,
    config?: any,
  ): Promise<BackendStandardResponse<any>>;
  delete(url: string, config?: any): Promise<BackendStandardResponse<any>>;
  axiosInstance: AxiosInstance;
}
@injectable() // TODO
export class ApiService implements IApiService {
  get axiosInstance() {
    return inversifyContainer().get<AxiosInstance>("axios");
  }

  async get(url: string, config = {}) {
    try {
      const response = (
        await inversifyContainer().get<AxiosInstance>("axios").get(url, config)
      ).data;
      return response as BackendStandardResponse<any>;
    } catch (error) {
      throw error;
    }
  }

  async post(url: string, data: any, config = {}) {
    try {
      const response = (
        await inversifyContainer()
          .get<AxiosInstance>("axios")
          .post(url, data, config)
      ).data;

      return response as BackendStandardResponse<any>;
    } catch (error) {
      throw error;
    }
  }

  async put(url: string, data: any, config = {}) {
    try {
      const response = (
        await inversifyContainer()
          .get<AxiosInstance>("axios")
          .put(url, data, config)
      ).data;

      return response as BackendStandardResponse<any>;
    } catch (error) {
      throw error;
    }
  }

  async delete(url: string, config = {}) {
    try {
      const response = (
        await inversifyContainer()
          .get<AxiosInstance>("axios")
          .delete(url, config)
      ).data;

      return response as BackendStandardResponse<any>;
    } catch (error) {
      throw error;
    }
  }
}

export class ApiResultIndicator {
  public static showIndicator?: (
    isLoading: boolean,
    isSuccess: boolean,
  ) => void;

  public static useIndicator(
    showIndicator: (isLoading: boolean, isSuccess: boolean) => void,
  ) {
    this.showIndicator = showIndicator;
  }
}

export const ApiServiceInstance = () =>
  inversifyContainer().get<IApiService>(ApiService);
