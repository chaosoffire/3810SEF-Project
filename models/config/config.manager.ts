import fs from "node:fs";
import path from "node:path";
import { exit } from "node:process";

import dotenv from "dotenv";

interface ConfigManagerInterface {
    get(key: string): Promise<string>;
    has(key: string): Promise<boolean>;
}

class ConfigManager implements ConfigManagerInterface {
    private static instance: ConfigManager;
    private configFilePath: string;
    private config: Map<string, string> = new Map<string, string>();

    private constructor() {
        this.configFilePath = path.resolve(process.cwd(), ".env");
        if (fs.existsSync(this.configFilePath)) {
            console.info(".env file found. Loading configuration.");
        } else if (fs.existsSync(path.resolve(process.cwd(), ".env.example"))) {
            fs.copyFileSync(
                path.resolve(process.cwd(), ".env.example"),
                this.configFilePath,
            );
            console.warn(
                ".env file does not exist. Creating .env from .env.example",
            );
        } else {
            console.error("Both .env and .env.example files are missing.");
            exit(1);
        }
        this.loadConfig();
    }

    public static getConfigManager(): ConfigManager {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }

    private loadConfig(): void {
        // Load from .env file first
        if (fs.existsSync(this.configFilePath)) {
            const fileContent: string = fs.readFileSync(
                this.configFilePath,
                "utf8",
            );
            const parsedConfig = dotenv.parse(fileContent);
            this.config = new Map<string, string>(Object.entries(parsedConfig));
        }

        // Override with process.env variables
        for (const [key, value] of Object.entries(process.env)) {
            if (value !== undefined) {
                this.config.set(key, value);
            }
        }
    }

    async get(key: string): Promise<string> {
        if (this.config.has(key)) {
            return this.config.get(key) as string;
        }
        throw new Error(`Config key "${key}" not found`);
    }

    async has(key: string): Promise<boolean> {
        return this.config.has(key);
    }
}

export default ConfigManager;
