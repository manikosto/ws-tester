import { Command } from 'commander';
import { createInterface } from 'readline';
import { WebSocketManager } from '../core/connection.js';
import { SessionRecorder } from '../core/recorder.js';
import { Logger } from '../utils/logger.js';
import { Formatter } from '../utils/formatter.js';

export function registerRecordCommand(program: Command): void {
  program
    .command('record <url>')
    .description('Record a WebSocket session to a file')
    .requiredOption('-o, --output <path>', 'Output file path for recording')
    .option('-H, --header <headers...>', 'Custom headers (key:value)')
    .option('-t, --timeout <ms>', 'Connection timeout', '10000')
    .action(async (url: string, opts: { output: string; header?: string[]; timeout: string }) => {
      const headers: Record<string, string> = {};
      if (opts.header) {
        for (const h of opts.header) {
          const [key, ...rest] = h.split(':');
          headers[key.trim()] = rest.join(':').trim();
        }
      }

      const manager = new WebSocketManager({
        url,
        headers,
        timeout: parseInt(opts.timeout, 10),
      });

      try {
        Logger.info(`Connecting to ${url}...`);
        await manager.connect();
        Logger.connectionStatus(url, 'connected');

        const recorder = new SessionRecorder(manager, url);
        recorder.start();

        Logger.info('Recording started. Type messages to send. Ctrl+C to stop and save.\n');

        manager.onMessage((data) => Logger.received(data));

        const rl = createInterface({ input: process.stdin, output: process.stdout });

        rl.on('line', (line) => {
          if (!line.trim()) return;
          try {
            manager.send(line);
            Logger.sent(line);
          } catch (err: unknown) {
            Logger.error((err as Error).message);
          }
        });

        const shutdown = async () => {
          Logger.info('Stopping recording...');
          const recording = await recorder.save(opts.output);
          console.log(Formatter.sessionSummary(recording));
          Logger.success(`Session saved to ${opts.output}`);
          await manager.disconnect();
          process.exit(0);
        };

        rl.on('close', shutdown);
        process.on('SIGINT', shutdown);
      } catch (err: unknown) {
        Logger.error(`Failed: ${(err as Error).message}`);
        process.exit(1);
      }
    });
}
