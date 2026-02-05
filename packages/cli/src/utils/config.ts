import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import dotenv from 'dotenv';

/**
 * Configuration for the CLI
 */
export interface CliConfig {
    apiUrl: string;
    apiKey: string;
}

/**
 * Get config directory path
 */
export function getConfigDir(): string {
    return join(homedir(), '.offerhub');
}

/**
 * Get config file path
 */
export function getConfigPath(): string {
    return join(getConfigDir(), 'config.json');
}

/**
 * Load configuration from multiple sources (priority order):
 * 1. Environment variables
 * 2. .env file in current directory
 * 3. Global config file (~/.offerhub/config.json)
 */
export function loadConfig(): CliConfig | null {
    // Try environment variables first
    if (process.env.OFFERHUB_API_URL && process.env.OFFERHUB_API_KEY) {
        return {
            apiUrl: process.env.OFFERHUB_API_URL,
            apiKey: process.env.OFFERHUB_API_KEY,
        };
    }

    // Try .env file in current directory
    dotenv.config();
    if (process.env.OFFERHUB_API_URL && process.env.OFFERHUB_API_KEY) {
        return {
            apiUrl: process.env.OFFERHUB_API_URL,
            apiKey: process.env.OFFERHUB_API_KEY,
        };
    }

    // Try global config file
    const configPath = getConfigPath();
    if (existsSync(configPath)) {
        try {
            const content = readFileSync(configPath, 'utf-8');
            const config = JSON.parse(content);
            if (config.apiUrl && config.apiKey) {
                return config;
            }
        } catch (error) {
            // Invalid config file, ignore
        }
    }

    return null;
}

/**
 * Save configuration to global config file
 */
export function saveConfig(config: CliConfig): void {
    const configDir = getConfigDir();
    if (!existsSync(configDir)) {
        mkdirSync(configDir, { recursive: true });
    }

    const configPath = getConfigPath();
    writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
}

/**
 * Get configuration or throw error with helpful message
 */
export function getConfigOrExit(): CliConfig {
    const config = loadConfig();
    if (!config) {
        console.error('❌ Error: No configuration found.');
        console.error('');
        console.error('Please configure the CLI using one of these methods:');
        console.error('');
        console.error('1. Environment variables:');
        console.error('   export OFFERHUB_API_URL=https://api.offerhub.com');
        console.error('   export OFFERHUB_API_KEY=ohk_your_api_key');
        console.error('');
        console.error('2. .env file in current directory:');
        console.error('   OFFERHUB_API_URL=https://api.offerhub.com');
        console.error('   OFFERHUB_API_KEY=ohk_your_api_key');
        console.error('');
        console.error('3. Run: offerhub config set');
        console.error('');
        process.exit(1);
    }
    return config;
}
