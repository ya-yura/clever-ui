import type { UISchema } from '@cleverence/shared-schema';
import { validateSchema, decompressSchema, createDefaultSchema } from '@cleverence/shared-schema';

/**
 * Сервис для загрузки схем интерфейса
 */
export class SchemaLoader {
  /**
   * Загрузить схему из LocalStorage
   */
  static loadFromLocalStorage(name = 'default'): UISchema | null {
    try {
      const stored = localStorage.getItem(`ui-schema-${name}`);
      if (!stored) {
        return null;
      }

      const schema = JSON.parse(stored);
      if (validateSchema(schema)) {
        return schema;
      }

      console.warn('Invalid schema in localStorage');
      return null;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return null;
    }
  }

  /**
   * Загрузить схему из сжатой строки (из QR-кода)
   */
  static loadFromCompressed(compressed: string): UISchema | null {
    try {
      const schema = decompressSchema(compressed);
      if (validateSchema(schema)) {
        return schema;
      }

      console.warn('Invalid decompressed schema');
      return null;
    } catch (error) {
      console.error('Failed to decompress schema:', error);
      return null;
    }
  }

  /**
   * Сохранить схему в LocalStorage
   */
  static saveToLocalStorage(schema: UISchema, name = 'default'): boolean {
    try {
      localStorage.setItem(`ui-schema-${name}`, JSON.stringify(schema));
      return true;
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      return false;
    }
  }

  /**
   * Загрузить схему из файла
   */
  static async loadFromFile(file: File): Promise<UISchema | null> {
    try {
      const text = await file.text();
      const schema = JSON.parse(text);
      
      if (validateSchema(schema)) {
        return schema;
      }

      console.warn('Invalid schema in file');
      return null;
    } catch (error) {
      console.error('Failed to load from file:', error);
      return null;
    }
  }

  /**
   * Получить схему по умолчанию
   */
  static getDefaultSchema(): UISchema {
    return createDefaultSchema();
  }

  /**
   * Удалить схему из LocalStorage
   */
  static deleteFromLocalStorage(name: string): boolean {
    try {
      localStorage.removeItem(`ui-schema-${name}`);
      return true;
    } catch (error) {
      console.error('Failed to delete from localStorage:', error);
      return false;
    }
  }

  /**
   * Получить список сохранённых схем
   */
  static getSavedSchemas(): string[] {
    const schemas: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('ui-schema-')) {
        schemas.push(key.replace('ui-schema-', ''));
      }
    }
    return schemas;
  }
}

