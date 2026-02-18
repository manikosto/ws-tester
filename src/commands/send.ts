import { Command } from 'commander';
import { readFile } from 'fs/promises';
import { WebSocketManager } from '../core/connection.js';
import { Logger } from '../utils/logger.js';

export function registerSendCommand(program: Command): void {
  program
    .command('send <url>')
    .description('Send messages to a WebSocket endpoint')
    .option('-m, --message <text>', 'Message to send')
    .option('-f, --file <path>', 'File with messages (one per line)')
    .option('-j, --json <path>', 'JSON file with array of messages')
    .option('-i, --interval <ms>', 'Delay between messages in ms', '0')
    .option('-w, --wait <ms>', 'Wait for responses after sending', '2000')
    .option('-H, --header <headers...>', 'Custom headers (key:value)')
    .action(async (url: string, opts: {
      message?: string;
      file?: string;
      json?: string;
      interval: string;
      wait: string;
      header?: string[];
    }) => {
      const headers: Record<string, string> = {};
      if (opts.header) {
        for (const h of opts.header) {
          const [key, ...rest] = h.split(':');
          headers[key.trim()] = rest.join(':').trim();
        }
      }

      const messages: string[] = [];

      if (opts.message) {
        messages.push(opts.message);
      }

      if (opts.file) {
        const content = await readFile(opts.file, 'utf-8');
        messages.push(...content.split('\n').filter((l) => l.trim()));
      }

      if (opts.json) {
        const content = await readFile(opts.json, 'utf-8');
        const arr = JSON.parse(content);
        if (Array.isArray(arr)) {
          messages.push(...arr.map((m) => (typeof m === 'string' ? m : JSON.stringify(m))));
        }
      }

      if (messages.length === 0) {
        Logger.error('No messages to send. Use -m, -f, or -j to specify messages.');
        process.exit(1);
      }

      const manager = new WebSocketManager({ url, headers });
      const received: string[] = [];

      manager.onMessage((data) => {
        received.push(data);
        Logger.received(data);
      });

      try {
        Logger.info(`Connecting to ${url}...`);
        await manager.connect();
        Logger.connectionStatus(url, 'connected');

        const interval = parseInt(opts.interval, 10);

        for (const msg of messages) {
          manager.send(msg);
          Logger.sent(msg);
          if (interval > 0) {
            await new Promise((r) => setTimeout(r, interval));
          }
        }

        Logger.info(`Sent ${messages.length} message(s). Waiting for responses...`);

        await new Promise((r) => setTimeout(r, parseInt(opts.wait, 10)));

        await manager.disconnect();
        Logger.success(`Done. Received ${received.length} response(s).`);
      } catch (err: unknown) {
        Logger.error(`Failed: ${(err as Error).message}`);
        process.exit(1);
      }
    });
}
