import _Ajv, { type ErrorObject } from 'ajv';
import { readFile } from 'fs/promises';
import type { SchemaValidationResult, SchemaError } from './types.js';

// Handle CJS/ESM interop for ajv
const Ajv = _Ajv as unknown as typeof _Ajv.default;

export class SchemaValidator {
  private ajv: _Ajv.default;

  constructor() {
    this.ajv = new Ajv({ allErrors: true, verbose: true });
  }

  async loadSchema(filePath: string): Promise<object> {
    const content = await readFile(filePath, 'utf-8');
    return JSON.parse(content) as object;
  }

  validate(schema: object, data: unknown): SchemaValidationResult {
    const valid = this.ajv.validate(schema, data);

    if (valid) {
      return { valid: true, errors: [] };
    }

    const errors: SchemaError[] = (this.ajv.errors ?? []).map((err: ErrorObject) => ({
      path: err.instancePath || '/',
      message: err.message ?? 'Unknown error',
      keyword: err.keyword,
    }));

    return { valid: false, errors };
  }

  validateString(schema: object, jsonString: string): SchemaValidationResult {
    let data: unknown;
    try {
      data = JSON.parse(jsonString);
    } catch {
      return {
        valid: false,
        errors: [
          {
            path: '/',
            message: 'Invalid JSON string',
            keyword: 'parse',
          },
        ],
      };
    }
    return this.validate(schema, data);
  }

  async validateFile(
    schemaPath: string,
    dataPath: string
  ): Promise<SchemaValidationResult> {
    const schema = await this.loadSchema(schemaPath);
    const dataContent = await readFile(dataPath, 'utf-8');
    let data: unknown;
    try {
      data = JSON.parse(dataContent);
    } catch {
      return {
        valid: false,
        errors: [
          {
            path: '/',
            message: `Failed to parse data file: ${dataPath}`,
            keyword: 'parse',
          },
        ],
      };
    }
    return this.validate(schema, data);
  }
}
