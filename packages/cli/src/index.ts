#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { createKeysCommand } from './commands/keys.js';
import { createConfigCommand } from './commands/config.js';
import { createMaintenanceCommand } from './commands/maintenance.js';

/**
 * OfferHub CLI
 * Command-line tool for managing the OfferHub Orchestrator
 */

const program = new Command();

program
    .name('offerhub')
    .description('CLI tool for OfferHub Orchestrator - API key management and maintenance operations')
    .version('0.0.0');

// Add commands
program.addCommand(createConfigCommand());
program.addCommand(createKeysCommand());
program.addCommand(createMaintenanceCommand());

// Handle unknown commands
program.on('command:*', () => {
    console.error(chalk.red(`Invalid command: ${program.args.join(' ')}`));
    console.log('');
    console.log('Run', chalk.cyan('offerhub --help'), 'to see available commands.');
    process.exit(1);
});

// Show help if no command provided
if (!process.argv.slice(2).length) {
    program.outputHelp();
}

// Parse arguments
program.parse(process.argv);
