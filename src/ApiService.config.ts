import axios from "axios";
import { inversifyContainer } from "./inversify.config";

export class Config {
  private static _instance: Config;
  private _projectName: string = "unknown";
  private _host: string = "localhost";
  private _port: number = 1168;
  private _protocol: string = "http";
  private _apiVersion: string = "v1";
  private _endpoint: string = `/api/${this._apiVersion}`;

  private constructor() {
    // Initialize with defaults or load from environment variables/config file
  }

  public init({
    projectName,
    host,
    port,
    protocol,
    apiVersion,
    axiosInstance,
  }: {
    projectName: string;
    host: string;
    port: number;
    protocol: "http" | "https";
    apiVersion: string;
    axiosInstance: typeof axios;
  }) {
    this._projectName = projectName;
    this._host = host;
    this._port = port;
    this._protocol = protocol;
    this._apiVersion = apiVersion;
    this._endpoint = `/api/${this._apiVersion}`;

    // rebind the axios instance
    if (inversifyContainer().isBound("axios")) {
      inversifyContainer().unbind("axios");
    }
    inversifyContainer()
      .bind("axios")
      .toConstantValue(
        axiosInstance.create({
          baseURL: `${this.baseUrl}`,
        }),
      );
  }

  public static instance(): Config {
    if (!Config._instance) {
      Config._instance = new Config();
    }
    return Config._instance;
  }

  public set projectName(projectName: string) {
    this._projectName = projectName;
  }

  public get projectName(): string {
    return this._projectName;
  }

  public get baseUrl(): string {
    return `${this._protocol}://${this._host}:${this._port}${this._endpoint}`;
  }

  public set host(host: string) {
    this._host = host;
  }

  public set port(port: number) {
    this._port = port;
  }

  public set protocol(protocol: "http" | "https") {
    this._protocol = protocol;
  }

  public set apiVersion(apiVersion: string) {
    this._apiVersion = apiVersion;
    this._endpoint = `/api/${this._apiVersion}`;
  }

  public get endpoints(): string {
    return this._endpoint;
  }
}
