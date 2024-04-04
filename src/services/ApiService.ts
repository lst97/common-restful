/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NavigateFunction } from "react-router-dom";
import axios, { AxiosResponse } from "axios";
import { BackendStandardResponse } from "@lst97/common-response-structure";
import { InvalidApiResponseStructure } from "../errors/ApiErrors";
import { apiConfig } from "../configs/ApiConfig";
import { validateApiResponse } from "../validators/ApiValidator";
import { AccessTokenService } from "./TokenService";

export class CommonApiErrorHandler implements IApiErrorHandler {
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
  private redirectPath: string = "/login";

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
        AccessTokenService.removeToken();
        if (this.navigate) {
          this.navigate(this.redirectPath, { replace: true });
        }

        if (this.showSnackbar) {
          this.showSnackbar("Session expired. Please sign in again", "error");
        }

        break;
    }
  }
}
export interface IApiErrorHandler {
  handleError(error: any): void;
}
class DefaultApiErrorHandler implements IApiErrorHandler {
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
class ApiService {
  private _axiosInstance;

  constructor() {
    this._axiosInstance = axios.create({
      baseURL: `${apiConfig.baseUrl}`,
    });
  }

  get AxiosInstance() {
    return this._axiosInstance;
  }

  async get(url: string, config = {}) {
    try {
      const response = validateApiResponse(
        (await this._axiosInstance.get(url, config)).data,
      );
      return response as BackendStandardResponse<any>;
    } catch (error) {
      throw error;
    }
  }

  async post(url: string, data: any, config = {}) {
    try {
      const response = validateApiResponse(
        (await this._axiosInstance.post(url, data, config)).data,
      );
      return response as BackendStandardResponse<any>;
    } catch (error) {
      throw error;
    }
  }

  async put(url: string, data: any, config = {}) {
    try {
      const response = validateApiResponse(
        (await this._axiosInstance.put(url, data, config)).data,
      );

      return response as BackendStandardResponse<any>;
    } catch (error) {
      throw error;
    }
  }

  async delete(url: string, config = {}) {
    try {
      const response = validateApiResponse(
        (await this._axiosInstance.delete(url, config)).data,
      );
      return response as BackendStandardResponse<any>;
    } catch (error) {
      throw error;
    }
  }
}

// class ApiResultIndicator {
//   public static showIndicator?: (
//     isLoading: boolean,
//     isSuccess: boolean,
//   ) => void;

//   public static useIndicator(
//     showIndicator: (isLoading: boolean, isSuccess: boolean) => void,
//   ) {
//     this.showIndicator = showIndicator;
//   }
// }
// example:
// export class StaffApiService extends ApiResultIndicator {
//     static async fetchStaffData(...errorHandlers: IApiErrorHandler[]) {
//         try {
//             const response = await apiService.get(
//                 API_ENDPOINTS.fetchStaffsData
//             );

//             return response.data as StaffData[];
//         } catch (error) {
//             defaultApiErrorHandler.handleError(error);
//             for (const errorHandler of errorHandlers) {
//                 errorHandler.handleError(error);
//             }
//             return [];
//         }
//     }

//     static async createStaff(
//         staff: StaffData,
//         ...errorHandlers: IApiErrorHandler[]
//     ) {
//         const createStaffForm = new CreateStaffForm({
//             staffName: staff.name,
//             email: staff.email === '' ? undefined : staff.email,
//             color: staff.color,
//             phoneNumber:
//                 staff.phoneNumber === '' ? undefined : staff.phoneNumber
//         });

//         try {
//             if (this.showIndicator) {
//                 this.showIndicator(true, false);
//             }

//             const response = await apiService.post(
//                 API_ENDPOINTS.createStaff,
//                 createStaffForm
//             );

//             if (this.showIndicator) {
//                 this.showIndicator(false, true);
//             }

//             return response as BackendStandardResponse<StaffData>;
//         } catch (error) {
//             if (this.showIndicator) {
//                 this.showIndicator(false, false);
//             }

//             defaultApiErrorHandler.handleError(error);
//             for (const errorHandler of errorHandlers) {
//                 errorHandler.handleError(error);
//             }
//             return null;
//         }
//     }
// }

export const apiService = new ApiService();
export const defaultApiErrorHandler = new DefaultApiErrorHandler();
