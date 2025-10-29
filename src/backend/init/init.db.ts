import { MongoDBManager } from '../database/mongodb.manager';
export async function initDatabase(timeoutMs = 10000): Promise<void> {
  const start = Date.now();
  const db: MongoDBManager = MongoDBManager.getInstance();
  while (true) {
    try {
      if (db instanceof MongoDBManager) {
        return;
      }
    } catch (err) {
      if (Date.now() - start > timeoutMs) {
        throw new Error('Timed out waiting for Mongoose connection');
      }
      await new Promise((r) => setTimeout(r, 200));
    }
  }
}