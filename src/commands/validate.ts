import { Command } from 'commander';
import { SchemaValidator } from '../core/schema-validator.js';
import { Logger } from '../utils/logger.js';
import { Formatter } from '../utils/formatter.js';

export function registerValidateCommand(program: Command): void {
  program
    .command('validate')
    .description('Validate a message against a JSON Schema')
    .requiredOption('-s, --schema <path>', 'Path to JSON Schema file')
    .option('-d, --data <path>', 'Path to data JSON file')
    .option('-m, --message <json>', 'Inline JSON message to validate')
    .action(async (opts: { schema: string; data?: string; message?: string }) => {
      const validator = new SchemaValidator();

      try {
        if (opts.data) {
          Logger.info(`Validating ${opts.data} against ${opts.schema}...`);
          const result = await validator.validateFile(opts.schema, opts.data);
          console.log('\n' + Formatter.validationReport(result));
          process.exit(result.valid ? 0 : 1);
        }

        if (opts.message) {
          Logger.info(`Validating inline message against ${opts.schema}...`);
          const schema = await validator.loadSchema(opts.schema);
          const result = validator.validateString(schema, opts.message);
          console.log('\n' + Formatter.validationReport(result));
          process.exit(result.valid ? 0 : 1);
        }

        Logger.error('Provide either --data or --message to validate.');
        process.exit(1);
      } catch (err: unknown) {
        Logger.error(`Validation failed: ${(err as Error).message}`);
        process.exit(1);
      }
    });
}
