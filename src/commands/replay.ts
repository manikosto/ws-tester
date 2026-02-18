import { Command } from 'commander';
import { WebSocketManager } from '../core/connection.js';
import { SessionReplayer } from '../core/replayer.js';
import { Logger } from '../utils/logger.js';
import { Formatter } from '../utils/formatter.js';

export function registerReplayCommand(program: Command): void {
  program
    .command('replay <url>')
    .description('Replay a recorded WebSocket session')
    .requiredOption('-i, --input <path>', 'Path to the recording file')
    .option('-H, --header <headers...>', 'Custom headers (key:value)')
    .action(async (url: string, opts: { input: string; header?: string[] }) => {
      const headers: Record<string, string> = {};
      if (opts.header) {
        for (const h of opts.header) {
          const [key, ...rest] = h.split(':');
          headers[key.trim()] = rest.join(':').trim();
        }
      }

      const manager = new WebSocketManager({ url, headers });
      const replayer = new SessionReplayer(manager);

      try {
        Logger.info(`Loading recording from ${opts.input}...`);
        const recording = await replayer.loadRecording(opts.input);
        console.log(Formatter.sessionSummary(recording));

        Logger.info(`Connecting to ${url}...`);
        await manager.connect();
        Logger.connectionStatus(url, 'connected');

        manager.onMessage((data) => Logger.received(data));

        Logger.info('Replaying session...\n');

        const result = await replayer.replay(recording, (msg, index) => {
          const total = recording.messages.length;
          if (msg.direction === 'sent') {
            Logger.sent(`[${index + 1}/${total}] ${msg.data}`);
          } else {
            Logger.dim(`  [${index + 1}/${total}] (skipped received: ${msg.data.substring(0, 60)}...)`);
          }
        });

        Logger.success(`Replay complete. Sent: ${result.replayed}, Skipped: ${result.skipped}`);
        await manager.disconnect();
      } catch (err: unknown) {
        Logger.error(`Failed: ${(err as Error).message}`);
        process.exit(1);
      }
    });
}
