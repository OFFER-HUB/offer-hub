import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { loadConfig, saveConfig, getConfigPath } from '../utils/config.js';

/**
 * Create config command
 */
export function createConfigCommand(): Command {
    const config = new Command('config')
        .description('Manage CLI configuration');

    // Set config
    config
        .command('set')
        .description('Set API configuration')
        .option('--api-url <url>', 'API URL')
        .option('--api-key <key>', 'API Key')
        .action(async (options) => {
            const answers = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'apiUrl',
                    message: 'API URL:',
                    default: options.apiUrl || 'http://localhost:3000',
                    validate: (input) => {
                        try {
                            new URL(input);
                            return true;
                        } catch {
                            return 'Please enter a valid URL';
                        }
                    },
                },
                {
                    type: 'password',
                    name: 'apiKey',
                    message: 'API Key:',
                    mask: '*',
                    default: options.apiKey,
                    validate: (input) => input.trim() !== '' || 'API Key is required',
                },
            ]);

            saveConfig({
                apiUrl: options.apiUrl || answers.apiUrl,
                apiKey: options.apiKey || answers.apiKey,
            });

            console.log(chalk.green('✓ Configuration saved successfully!'));
            console.log(chalk.gray(`Config file: ${getConfigPath()}`));
        });

    // Show config
    config
        .command('show')
        .description('Show current configuration')
        .action(() => {
            const currentConfig = loadConfig();

            if (!currentConfig) {
                console.log(chalk.yellow('No configuration found.'));
                console.log('');
                console.log('Run:', chalk.cyan('offerhub config set'));
                return;
            }

            console.log('');
            console.log(chalk.bold('Current Configuration:'));
            console.log('');
            console.log(chalk.bold('API URL:'), currentConfig.apiUrl);
            console.log(chalk.bold('API Key:'), `${currentConfig.apiKey.substring(0, 10)}...`);
            console.log('');
            console.log(chalk.gray(`Config file: ${getConfigPath()}`));
            console.log('');
        });

    return config;
}
