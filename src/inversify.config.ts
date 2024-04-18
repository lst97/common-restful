import { Container } from "inversify";
import { ApiService, IApiService } from "./services/ApiService";

/**
 * For the user to get the singleton instance of the services,
 * Support to use the provided container to build the services.
 * If not provided, it will create a new container for the services.
 * It makes use it use the singleton instance of the services.
 *
 */
export class Containers {
  private static _instance: Containers;
  private container: Container;

  private constructor() {
    this.container = new Container();
    this.buildContainers();
  }

  public static get instance() {
    if (!Containers._instance) {
      Containers._instance = new Containers();
    }
    return Containers._instance;
  }

  public get inversifyContainer() {
    return this.container;
  }

  private buildContainers() {
    this.buildConstantsContainer();
    this.buildServiceContainer();
  }

  // Arguments that required for the services
  private buildConstantsContainer() {}
  private buildServiceContainer() {
    if (!this.container.isBound(ApiService)) {
      this.container.bind<IApiService>(ApiService).toSelf().inSingletonScope();
    }
  }

  public useInversify(container: Container) {
    // use the user provided container to build the middleware containers
    this.container = container;
    this.buildContainers();
  }
}

/**
 * For the user to inject the services into the application.
 *
 * @param container - The user provided container.
 *
 * @example
 * ```typescript
 * import { useInversify } from '@lst97/common_response';
  const container = new Container();
  function buildLibContainers() {
    useInversify(container);
  }
 * ```
 */
export const useInversify = (container: Container) => {
  Containers.instance.useInversify(container);
};

/**
 * For internal use only.
 * @returns the singleton instance of the container
 */
export const inversifyContainer = () => {
  return Containers.instance.inversifyContainer;
};
