import { Mongoose, Model } from "mongoose";
import ConfigManager from "../../config/config.manager";
import { exit } from "process";
import { randomInt } from "crypto";

class MongoDBManager {
    private static instance: MongoDBManager;
    private ConfigManager = ConfigManager.getConfigManager();
    // url will always initialized after constructor, otherwise exit the process
    private url: string = "";
    // dbName will always initialized after constructor
    private dbName: string = "";
    // mongooseInstance will always initialized after constructor
    private mongooseInstance: Mongoose = new Mongoose();

    private constructor() {
        this.ConfigManager.get("MONGODB_URL")
            .then((url) => {
                this.url = url;
            }
            ).catch(() => {
                console.error("MongoDBManager: MONGODB_URL not found in configuration");
                console.error("Exiting...");
                exit(1);
            }
        );
        console.info(`MongoDBManager: Found MongoDB URL in configuration`);
        this.ConfigManager.get("MONGODB_DB_NAME")
            .then((dbName) => {
                this.dbName = dbName;
            }
            ).catch(() => {
                console.warn("MongoDBManager: MONGODB_DB_NAME not found in configuration, using default 'test'");
                const randomNumber: number = randomInt(0, 1000000);
                const random = randomNumber.toString().padStart(6, '0');
                this.dbName = "test-" + random;
            }
        );
        console.info(`MongoDBManager: Using database name "${this.dbName}"`);

        this.getMongooseInstance().then((instance) => {
            this.mongooseInstance = instance;
        }).catch((err) => {
            console.error("MongoDBManager: Failed to create Mongoose instance:", err);
            console.error("Exiting...");
            exit(1);
        });
        console.info("MongoDBManager: Mongoose instance initialized");
    }

    public static getInstance(): MongoDBManager {
        if (!MongoDBManager.instance) {
            MongoDBManager.instance = new MongoDBManager();
        }
        return MongoDBManager.instance;
    }

    private async getMongooseInstance(): Promise<Mongoose> {
        const mongoose = new Mongoose();
        const timeout = setTimeout(() => {
            console.error("MongoDBManager: Connection to MongoDB timed out");
            console.error("Exiting...");
            exit(1);
        }, 10000); // 10 seconds timeout
        await mongoose.connect(this.url, {
            dbName: this.dbName,
        });
        clearTimeout(timeout);
        return mongoose;
    }
    /**
     * Return a Model bound to the internal Mongoose instance. This lets
     * repository modules (e.g. src/database/user) acquire models without
     * re-creating connections or duplicating logic.
     */
    public getModel<T = any>(collectionName: string, schema: any): Model<T> {
        if (!this.mongooseInstance) {
            throw new Error("MongoDBManager: Mongoose instance has not been initialized");
        }
        return this.mongooseInstance.model(collectionName, schema) as Model<T>;
    }
}

export { MongoDBManager };