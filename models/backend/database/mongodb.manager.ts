import { randomInt } from "node:crypto";
import { exit } from "node:process";

import { type Model, Mongoose } from "mongoose";

import ConfigManager from "../../config/config.manager";

class MongoDBManager {
	private static instance: MongoDBManager;
	private configManager = ConfigManager.getConfigManager();
	private url = "";
	private dbName = "";
	private mongooseInstance: Mongoose = new Mongoose();
	private ready: Promise<void>;

	private constructor() {
		this.ready = this.initialize();
	}

	public static getInstance(): MongoDBManager {
		if (!MongoDBManager.instance) {
			MongoDBManager.instance = new MongoDBManager();
		}
		return MongoDBManager.instance;
	}

	private async initialize(): Promise<void> {
		try {
			this.url = await this.configManager.get("MONGODB_URI");
		} catch {
			console.error("MongoDBManager: MONGODB_URI not found in configuration");
			console.error("Exiting...");
			exit(1);
		}

		try {
			this.dbName = await this.configManager.get("MONGODB_DB_NAME");
		} catch {
			console.warn(
				"MongoDBManager: MONGODB_DB_NAME not found in configuration, using random test database",
			);
			const randomNumber: number = randomInt(0, 1000000);
			const random = randomNumber.toString().padStart(6, "0");
			this.dbName = `test-${random}`;
		}

		try {
			await this.connectWithTimeout();
			console.info(`MongoDBManager: Connected to ${this.url}/${this.dbName}`);
		} catch (err) {
			console.error("MongoDBManager: Failed to connect to MongoDB:", err);
			console.error("Exiting...");
			exit(1);
		}
	}

	private async connectWithTimeout(timeoutMs = 10000): Promise<void> {
		await new Promise<void>((resolve, reject) => {
			const timeout = setTimeout(() => {
				reject(new Error("MongoDBManager: Connection to MongoDB timed out"));
			}, timeoutMs);

			this.mongooseInstance
				.connect(this.url, {
					dbName: this.dbName,
				})
				.then(() => {
					clearTimeout(timeout);
					resolve();
				})
				.catch((err) => {
					clearTimeout(timeout);
					reject(err);
				});
		});
	}

	public async waitUntilReady(timeoutMs = 10000): Promise<void> {
		await Promise.race([
			this.ready,
			new Promise<void>((_, reject) => {
				setTimeout(
					() => reject(new Error("MongoDBManager: waitUntilReady timed out")),
					timeoutMs,
				);
			}),
		]);

		const readyState = this.mongooseInstance.connection.readyState;
		if (readyState !== 1) {
			throw new Error(
				`MongoDBManager: Connection not ready (state=${readyState})`,
			);
		}
	}

	public getModel<T = any>(collectionName: string, schema: any): Model<T> {
		if (!this.mongooseInstance) {
			throw new Error(
				"MongoDBManager: Mongoose instance has not been initialized",
			);
		}
		const existing = this.mongooseInstance.models[collectionName] as
			| Model<T>
			| undefined;
		if (existing) {
			return existing;
		}
		return this.mongooseInstance.model(collectionName, schema) as Model<T>;
	}
}

export { MongoDBManager };
