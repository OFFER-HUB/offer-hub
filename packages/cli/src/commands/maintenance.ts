import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { getConfigOrExit } from '../utils/config.js';
import { makeRequest } from '../utils/api.js';

/**
 * Maintenance mode status
 */
interface MaintenanceStatus {
    enabled: boolean;
    message?: string;
    enabledAt?: string;
    enabledBy?: string;
}

/**
 * Create maintenance command
 */
export function createMaintenanceCommand(): Command {
    const maintenance = new Command('maintenance')
        .description('Manage maintenance mode');

    // Enable maintenance mode
    maintenance
        .command('enable')
        .description('Enable maintenance mode')
        .option('-m, --message <message>', 'Maintenance message')
        .option('-y, --yes', 'Skip confirmation')
        .action(async (options) => {
            const config = getConfigOrExit();

            // Prompt for confirmation if not provided
            if (!options.yes) {
                const { confirm } = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'confirm',
                        message: 'Enable maintenance mode? This will make the API read-only.',
                        default: false,
                    },
                ]);

                if (!confirm) {
                    console.log(chalk.yellow('Cancelled.'));
                    return;
                }
            }

            // Prompt for message if not provided
            let message = options.message;
            if (!message) {
                const answers = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'message',
                        message: 'Maintenance message (optional):',
                        default: 'System maintenance in progress',
                    },
                ]);
                message = answers.message;
            }

            const spinner = ora('Enabling maintenance mode...').start();

            try {
                await makeRequest(
                    config,
                    'POST',
                    'admin/maintenance/enable',
                    { message },
                );

                spinner.succeed('Maintenance mode enabled!');
                console.log('');
                console.log(chalk.yellow('⚠️  API is now in read-only mode'));
                console.log(chalk.gray(`Message: ${message}`));
                console.log('');
            } catch (error) {
                spinner.fail('Failed to enable maintenance mode');
                console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
                process.exit(1);
            }
        });

    // Disable maintenance mode
    maintenance
        .command('disable')
        .description('Disable maintenance mode')
        .option('-y, --yes', 'Skip confirmation')
        .action(async (options) => {
            const config = getConfigOrExit();

            // Prompt for confirmation if not provided
            if (!options.yes) {
                const { confirm } = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'confirm',
                        message: 'Disable maintenance mode? API will return to normal operation.',
                        default: false,
                    },
                ]);

                if (!confirm) {
                    console.log(chalk.yellow('Cancelled.'));
                    return;
                }
            }

            const spinner = ora('Disabling maintenance mode...').start();

            try {
                await makeRequest(config, 'POST', 'admin/maintenance/disable');

                spinner.succeed('Maintenance mode disabled!');
                console.log('');
                console.log(chalk.green('✓ API is now operating normally'));
                console.log('');
            } catch (error) {
                spinner.fail('Failed to disable maintenance mode');
                console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
                process.exit(1);
            }
        });

    // Check maintenance status
    maintenance
        .command('status')
        .description('Check maintenance mode status')
        .action(async () => {
            const config = getConfigOrExit();
            const spinner = ora('Checking maintenance status...').start();

            try {
                const response = await makeRequest<{ data: MaintenanceStatus }>(
                    config,
                    'GET',
                    'admin/maintenance/status',
                );

                spinner.stop();

                const status = response.data;
                console.log('');
                console.log(chalk.bold('Maintenance Mode Status:'));
                console.log('');

                if (status.enabled) {
                    console.log(chalk.yellow('Status:'), chalk.red('ENABLED'));
                    if (status.message) {
                        console.log(chalk.yellow('Message:'), status.message);
                    }
                    if (status.enabledAt) {
                        console.log(chalk.yellow('Enabled:'), new Date(status.enabledAt).toLocaleString());
                    }
                    if (status.enabledBy) {
                        console.log(chalk.yellow('Enabled by:'), status.enabledBy);
                    }
                } else {
                    console.log(chalk.green('Status:'), chalk.green('NORMAL'));
                    console.log(chalk.gray('API is operating normally'));
                }

                console.log('');
            } catch (error) {
                spinner.fail('Failed to check maintenance status');
                console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
                process.exit(1);
            }
        });

    return maintenance;
}
