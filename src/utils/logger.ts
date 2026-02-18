import chalk from 'chalk';

export class Logger {
  static info(msg: string): void {
    console.log(chalk.blue('ℹ'), msg);
  }

  static success(msg: string): void {
    console.log(chalk.green('✔'), msg);
  }

  static warn(msg: string): void {
    console.log(chalk.yellow('⚠'), msg);
  }

  static error(msg: string): void {
    console.error(chalk.red('✖'), msg);
  }

  static sent(msg: string): void {
    console.log(chalk.cyan('→'), chalk.dim('sent:'), msg);
  }

  static received(msg: string): void {
    console.log(chalk.magenta('←'), chalk.dim('recv:'), msg);
  }

  static separator(): void {
    console.log(chalk.gray('─'.repeat(60)));
  }

  static header(title: string): void {
    console.log();
    console.log(chalk.bold.white(title));
    Logger.separator();
  }

  static dim(msg: string): void {
    console.log(chalk.dim(msg));
  }

  static connectionStatus(url: string, status: 'connected' | 'disconnected' | 'error'): void {
    const colors = {
      connected: chalk.green,
      disconnected: chalk.yellow,
      error: chalk.red,
    };
    console.log(colors[status](`● ${status.toUpperCase()}`), chalk.dim(url));
  }
}
