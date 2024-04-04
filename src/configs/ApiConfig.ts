class ApiConfig {
  private static _instance: ApiConfig;
  private _projectName: string = "unknown";
  private _host: string = "localhost";
  private _port: number = 1168;
  private _protocol: string = "http";
  private _apiVersion: string = "v1";
  private _endpoints: string = `/api/${this._apiVersion}`;

  private constructor() {
    // Initialize with defaults or load from environment variables/config file
  }
  public static instance(): ApiConfig {
    if (!ApiConfig._instance) {
      ApiConfig._instance = new ApiConfig();
    }
    return ApiConfig._instance;
  }

  public set projectName(projectName: string) {
    this._projectName = projectName;
  }

  public get projectName(): string {
    return this._projectName;
  }

  public get baseUrl(): string {
    return `${this._protocol}://${this._host}:${this._port}${this._endpoints}`;
  }
}

export const apiConfig = ApiConfig.instance();
