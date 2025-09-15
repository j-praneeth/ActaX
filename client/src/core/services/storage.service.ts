import { IStorageService } from '../interfaces/services';

export class StorageService implements IStorageService {
  private storage: Storage;

  constructor() {
    this.storage = localStorage;
  }

  get<T>(key: string): T | null {
    try {
      const item = this.storage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Failed to get item from storage:', error);
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      this.storage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to set item in storage:', error);
    }
  }

  remove(key: string): void {
    try {
      this.storage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove item from storage:', error);
    }
  }

  clear(): void {
    try {
      this.storage.clear();
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }
}
