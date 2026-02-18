import Table from 'cli-table3';
import chalk from 'chalk';
import type { LoadTestMetrics, SchemaValidationResult, SessionRecording } from '../core/types.js';

export class Formatter {
  static loadTestReport(metrics: LoadTestMetrics): string {
    const lines: string[] = [];

    lines.push('');
    lines.push(chalk.bold.white('  Load Test Results'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));

    const connTable = new Table({
      chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
      style: { 'padding-left': 2 },
    });

    connTable.push(
      [chalk.dim('Total Connections'), metrics.totalConnections.toString()],
      [chalk.dim('Successful'), chalk.green(metrics.successfulConnections.toString())],
      [chalk.dim('Failed'), metrics.failedConnections > 0 ? chalk.red(metrics.failedConnections.toString()) : '0'],
      [chalk.dim('Avg Connect Time'), `${metrics.avgConnectionTimeMs.toFixed(1)}ms`],
      [chalk.dim('Min Connect Time'), `${metrics.minConnectionTimeMs.toFixed(1)}ms`],
      [chalk.dim('Max Connect Time'), `${metrics.maxConnectionTimeMs.toFixed(1)}ms`]
    );
    lines.push(connTable.toString());

    lines.push('');
    lines.push(chalk.bold.white('  Messages'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));

    const msgTable = new Table({
      chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
      style: { 'padding-left': 2 },
    });

    msgTable.push(
      [chalk.dim('Sent'), metrics.totalMessagesSent.toString()],
      [chalk.dim('Received'), metrics.totalMessagesReceived.toString()],
      [chalk.dim('Messages/sec'), metrics.messagesPerSecond.toFixed(1)],
      [chalk.dim('Avg Latency'), `${metrics.avgLatencyMs.toFixed(1)}ms`],
      [chalk.dim('Min Latency'), `${metrics.minLatencyMs.toFixed(1)}ms`],
      [chalk.dim('Max Latency'), `${metrics.maxLatencyMs.toFixed(1)}ms`]
    );
    lines.push(msgTable.toString());

    if (metrics.errorsCount > 0) {
      lines.push('');
      lines.push(chalk.bold.red(`  Errors (${metrics.errorsCount})`));
      lines.push(chalk.gray('  ' + '─'.repeat(50)));
      for (const err of metrics.errors) {
        lines.push(chalk.red(`  • ${err}`));
      }
    }

    lines.push('');
    lines.push(chalk.dim(`  Duration: ${(metrics.durationMs / 1000).toFixed(1)}s`));
    lines.push('');

    return lines.join('\n');
  }

  static validationReport(result: SchemaValidationResult): string {
    if (result.valid) {
      return chalk.green('✔ Validation passed — message matches schema');
    }

    const lines = [chalk.red(`✖ Validation failed — ${result.errors.length} error(s)`)];
    for (const err of result.errors) {
      lines.push(chalk.red(`  • ${err.path}: ${err.message} [${err.keyword}]`));
    }
    return lines.join('\n');
  }

  static sessionSummary(recording: SessionRecording): string {
    const sent = recording.messages.filter((m) => m.direction === 'sent').length;
    const received = recording.messages.filter((m) => m.direction === 'received').length;
    const duration = new Date(recording.endedAt).getTime() - new Date(recording.startedAt).getTime();

    const table = new Table({
      chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
      style: { 'padding-left': 2 },
    });

    table.push(
      [chalk.dim('URL'), recording.url],
      [chalk.dim('Started'), recording.startedAt],
      [chalk.dim('Duration'), `${(duration / 1000).toFixed(1)}s`],
      [chalk.dim('Messages Sent'), sent.toString()],
      [chalk.dim('Messages Received'), received.toString()],
      [chalk.dim('Total Messages'), recording.messages.length.toString()]
    );

    return '\n' + chalk.bold.white('  Session Summary\n') + table.toString() + '\n';
  }
}
