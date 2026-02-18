import { Command } from 'commander';

export function registerWebCommand(program: Command): void {
  program
    .command('web')
    .description('Start the web dashboard')
    .option('-p, --port <number>', 'Port to listen on', '3456')
    .action(async (opts: { port: string }) => {
      const { startServer } = await import('../web/server.js');
      const port = parseInt(opts.port, 10);
      startServer(port);
    });
}
