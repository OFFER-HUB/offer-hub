import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { table } from 'table';
import { getConfigOrExit } from '../utils/config.js';
import { makeRequest } from '../utils/api.js';

/**
 * API Key response type
 */
interface ApiKey {
    id: string;
    key?: string; // Only present when creating
    maskedKey: string;
    userId: string;
    scopes: string[];
    name?: string;
    expiresAt?: string;
    createdAt: string;
    lastUsedAt?: string;
}

/**
 * Create keys command group
 */
export function createKeysCommand(): Command {
    const keys = new Command('keys')
        .description('Manage API keys');

    // List keys
    keys
        .command('list')
        .description('List all API keys')
        .option('-u, --user-id <userId>', 'Filter by user ID')
        .action(async (options) => {
            const config = getConfigOrExit();
            const spinner = ora('Fetching API keys...').start();

            try {
                const queryParams = options.userId ? `?userId=${options.userId}` : '';
                const response = await makeRequest<{ data: ApiKey[] }>(
                    config,
                    'GET',
                    `auth/api-keys${queryParams}`,
                );

                spinner.stop();

                if (response.data.length === 0) {
                    console.log(chalk.yellow('No API keys found.'));
                    return;
                }

                // Format data for table
                const tableData = [
                    ['ID', 'Key', 'User ID', 'Scopes', 'Created', 'Last Used'],
                    ...response.data.map((key) => [
                        key.id,
                        key.maskedKey,
                        key.userId,
                        key.scopes.join(', '),
                        new Date(key.createdAt).toLocaleDateString(),
                        key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'Never',
                    ]),
                ];

                console.log(table(tableData));
                console.log(chalk.green(`✓ Found ${response.data.length} API key(s)`));
            } catch (error) {
                spinner.fail('Failed to fetch API keys');
                console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
                process.exit(1);
            }
        });

    // Create key
    keys
        .command('create')
        .description('Create a new API key')
        .option('-u, --user-id <userId>', 'User ID')
        .option('-s, --scopes <scopes>', 'Comma-separated scopes (read,write,support)')
        .option('-n, --name <name>', 'Key name/description')
        .action(async (options) => {
            const config = getConfigOrExit();

            // Interactive prompts if options not provided
            const answers = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'userId',
                    message: 'User ID:',
                    when: !options.userId,
                    validate: (input) => input.trim() !== '' || 'User ID is required',
                },
                {
                    type: 'checkbox',
                    name: 'scopes',
                    message: 'Select scopes:',
                    when: !options.scopes,
                    choices: [
                        { name: 'read - Read access to resources', value: 'read' },
                        { name: 'write - Create and modify resources', value: 'write' },
                        { name: 'support - Support and admin operations', value: 'support' },
                    ],
                    validate: (input) => input.length > 0 || 'At least one scope is required',
                },
                {
                    type: 'input',
                    name: 'name',
                    message: 'Key name (optional):',
                    when: !options.name,
                },
            ]);

            const userId = options.userId || answers.userId;
            const scopes = options.scopes
                ? options.scopes.split(',').map((s: string) => s.trim())
                : answers.scopes;
            const name = options.name || answers.name || undefined;

            const spinner = ora('Creating API key...').start();

            try {
                const response = await makeRequest<{ data: ApiKey }>(
                    config,
                    'POST',
                    'auth/api-keys',
                    { userId, scopes, name },
                );

                spinner.succeed('API key created successfully!');
                console.log('');
                console.log(chalk.yellow('⚠️  IMPORTANT: Save this key now. You won\'t be able to see it again!'));
                console.log('');
                console.log(chalk.bold('API Key:'), chalk.green(response.data.key));
                console.log(chalk.bold('Key ID:'), response.data.id);
                console.log(chalk.bold('User ID:'), response.data.userId);
                console.log(chalk.bold('Scopes:'), response.data.scopes.join(', '));
                if (response.data.name) {
                    console.log(chalk.bold('Name:'), response.data.name);
                }
                console.log('');
            } catch (error) {
                spinner.fail('Failed to create API key');
                console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
                process.exit(1);
            }
        });

    // Revoke key
    keys
        .command('revoke <keyId>')
        .description('Revoke an API key')
        .option('-y, --yes', 'Skip confirmation')
        .action(async (keyId, options) => {
            const config = getConfigOrExit();

            // Confirm before revoking
            if (!options.yes) {
                const { confirm } = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'confirm',
                        message: `Are you sure you want to revoke API key ${keyId}?`,
                        default: false,
                    },
                ]);

                if (!confirm) {
                    console.log(chalk.yellow('Revocation cancelled.'));
                    return;
                }
            }

            const spinner = ora('Revoking API key...').start();

            try {
                await makeRequest(config, 'DELETE', `auth/api-keys/${keyId}`);
                spinner.succeed(`API key ${keyId} revoked successfully!`);
            } catch (error) {
                spinner.fail('Failed to revoke API key');
                console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
                process.exit(1);
            }
        });

    // Generate token
    keys
        .command('token <keyId>')
        .description('Generate a short-lived token from an API key')
        .option('-t, --ttl <seconds>', 'Token TTL in seconds (default: 3600)', '3600')
        .action(async (keyId, options) => {
            const config = getConfigOrExit();
            const spinner = ora('Generating token...').start();

            try {
                const ttl = parseInt(options.ttl, 10);
                const response = await makeRequest<{ data: { token: string; expiresAt: string } }>(
                    config,
                    'POST',
                    `auth/api-keys/${keyId}/token`,
                    { ttl },
                );

                spinner.succeed('Token generated successfully!');
                console.log('');
                console.log(chalk.bold('Token:'), chalk.green(response.data.token));
                console.log(chalk.bold('Expires:'), new Date(response.data.expiresAt).toLocaleString());
                console.log('');
                console.log(chalk.yellow('⚠️  This token will expire. Save it now!'));
                console.log('');
            } catch (error) {
                spinner.fail('Failed to generate token');
                console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
                process.exit(1);
            }
        });

    return keys;
}
