// Dependency Injection Container following the Dependency Inversion Principle
export class DIContainer {
  private services = new Map<string, any>();
  private factories = new Map<string, () => any>();

  // Register a service instance
  register<T>(name: string, instance: T): void {
    this.services.set(name, instance);
  }

  // Register a factory function
  registerFactory<T>(name: string, factory: () => T): void {
    this.factories.set(name, factory);
  }

  // Get a service instance
  get<T>(name: string): T {
    if (this.services.has(name)) {
      return this.services.get(name);
    }

    if (this.factories.has(name)) {
      const factory = this.factories.get(name);
      const instance = factory();
      this.services.set(name, instance);
      return instance;
    }

    throw new Error(`Service '${name}' not found`);
  }

  // Check if a service is registered
  has(name: string): boolean {
    return this.services.has(name) || this.factories.has(name);
  }

  // Clear all services (useful for testing)
  clear(): void {
    this.services.clear();
    this.factories.clear();
  }
}

// Global container instance
export const container = new DIContainer();
