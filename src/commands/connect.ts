import { Command } from 'commander';
import { createInterface } from 'readline';
import { WebSocketManager } from '../core/connection.js';
import { Logger } from '../utils/logger.js';

export function registerConnectCommand(program: Command): void {
  program
    .command('connect <url>')
    .description('Open an interactive WebSocket connection')
    .option('-H, --header <headers...>', 'Custom headers (key:value)')
    .option('-r, --reconnect', 'Auto-reconnect on disconnect', false)
    .option('-t, --timeout <ms>', 'Connection timeout in ms', '10000')
    .action(async (url: string, opts: { header?: string[]; reconnect: boolean; timeout: string }) => {
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
        reconnect: opts.reconnect,
        timeout: parseInt(opts.timeout, 10),
      });

      manager.onMessage((data) => Logger.received(data));
      manager.onError((err) => Logger.error(err.message));
      manager.on('close', (code: number, reason: string) => {
        Logger.connectionStatus(url, 'disconnected');
        Logger.dim(`Code: ${code}, Reason: ${reason || 'none'}`);
      });
      manager.on('reconnecting', (attempt: number) => {
        Logger.warn(`Reconnecting... attempt ${attempt}`);
      });

      try {
        Logger.info(`Connecting to ${url}...`);
        await manager.connect();
        Logger.connectionStatus(url, 'connected');
        Logger.dim('Type messages and press Enter to send. Ctrl+C to exit.\n');

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

        rl.on('close', async () => {
          await manager.disconnect();
          process.exit(0);
        });

        process.on('SIGINT', async () => {
          Logger.info('Disconnecting...');
          await manager.disconnect();
          rl.close();
          process.exit(0);
        });
      } catch (err: unknown) {
        Logger.error(`Failed to connect: ${(err as Error).message}`);
        process.exit(1);
      }
    });
}
