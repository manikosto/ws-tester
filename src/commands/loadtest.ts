import { Command } from 'commander';
import ora from 'ora';
import { LoadTester } from '../core/load-tester.js';
import { Logger } from '../utils/logger.js';
import { Formatter } from '../utils/formatter.js';

export function registerLoadTestCommand(program: Command): void {
  program
    .command('loadtest <url>')
    .description('Run a load test with concurrent WebSocket connections')
    .option('-c, --connections <n>', 'Number of concurrent connections', '10')
    .option('-d, --duration <seconds>', 'Test duration in seconds', '10')
    .option('-m, --message <text>', 'Message to send periodically')
    .option('--interval <ms>', 'Message send interval in ms', '1000')
    .option('-H, --header <headers...>', 'Custom headers (key:value)')
    .action(async (url: string, opts: {
      connections: string;
      duration: string;
      message?: string;
      interval: string;
      header?: string[];
    }) => {
      const headers: Record<string, string> = {};
      if (opts.header) {
        for (const h of opts.header) {
          const [key, ...rest] = h.split(':');
          headers[key.trim()] = rest.join(':').trim();
        }
      }

      const connections = parseInt(opts.connections, 10);
      const duration = parseInt(opts.duration, 10);

      Logger.header(`Load Test: ${connections} connections for ${duration}s`);
      Logger.dim(`Target: ${url}\n`);

      const tester = new LoadTester({
        url,
        connections,
        duration,
        message: opts.message,
        messageInterval: parseInt(opts.interval, 10),
        headers,
      });

      const spinner = ora('Preparing...').start();

      tester.on('phase', (phase: string) => {
        if (phase === 'connecting') spinner.text = 'Establishing connections...';
        if (phase === 'sending') spinner.text = 'Sending messages...';
        if (phase === 'closing') spinner.text = 'Closing connections...';
      });

      tester.on('connections_progress', (p: { current: number; total: number; successful: number; failed: number }) => {
        spinner.text = `Connecting... ${p.current}/${p.total} (${p.successful} ok, ${p.failed} failed)`;
      });

      tester.on('send_progress', (p: { elapsed: number; duration: number; activeConnections: number }) => {
        const pct = Math.round((p.elapsed / p.duration) * 100);
        spinner.text = `Sending messages... ${pct}% (${p.activeConnections} active connections)`;
      });

      process.on('SIGINT', () => {
        spinner.stop();
        Logger.warn('Stopping load test...');
        tester.stop();
      });

      try {
        const metrics = await tester.run();
        spinner.stop();
        console.log(Formatter.loadTestReport(metrics));
      } catch (err: unknown) {
        spinner.stop();
        Logger.error(`Load test failed: ${(err as Error).message}`);
        process.exit(1);
      }
    });
}
