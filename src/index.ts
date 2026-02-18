#!/usr/bin/env node

import { Command } from 'commander';
import { registerConnectCommand } from './commands/connect.js';
import { registerSendCommand } from './commands/send.js';
import { registerRecordCommand } from './commands/record.js';
import { registerReplayCommand } from './commands/replay.js';
import { registerLoadTestCommand } from './commands/loadtest.js';
import { registerValidateCommand } from './commands/validate.js';
import { registerWebCommand } from './commands/web.js';

const program = new Command();

program
  .name('ws-tester')
  .description('WebSocket Connection Tester — connect, send/receive, record/replay, load test, validate schemas')
  .version('1.0.0');

registerConnectCommand(program);
registerSendCommand(program);
registerRecordCommand(program);
registerReplayCommand(program);
registerLoadTestCommand(program);
registerValidateCommand(program);
registerWebCommand(program);

program.parse();
