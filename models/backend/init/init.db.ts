import { MongoDBManager } from '../database/mongodb.manager';
import ConfigManager from '../../config/config.manager';
import { hasAdminUser, getUserByUsername } from '../database/model/user/user.repository';
import { registerUser } from '../api/auth/service/register';
import { exit } from 'process';

export async function initDatabase(timeoutMs = 10000): Promise<void> {
  const db = MongoDBManager.getInstance();
  await db.waitUntilReady(timeoutMs);
  await ensureInitialAdminUser();
}

async function ensureInitialAdminUser(): Promise<void> {
  try {
    if (await hasAdminUser()) {
      return;
    }

    const config = ConfigManager.getConfigManager();
    let username: string;
    let password: string;

    try {
      username = await config.get('INIT_ADMIN_USERNAME');
      password = await config.get('INIT_ADMIN_PASSWORD');
    } catch {
      console.error('INIT_ADMIN_USERNAME or INIT_ADMIN_PASSWORD not set; skipping automatic admin bootstrap.');
      exit(1);
    }

    if (username.length < 8 || username.length > 32) {
      console.error('INIT_ADMIN_USERNAME must be 8-32 characters; skipping automatic admin bootstrap.');
      exit(1);
    }

    if (password.length < 12 || password.length > 64) {
      console.error('INIT_ADMIN_PASSWORD must be 12-64 characters; skipping automatic admin bootstrap.');
      exit(1);
    }

    const existing = await getUserByUsername(username);
    if (existing) {
      console.error(`Bootstrap admin username "${username}" already exists but is not an admin. Aborting startup to avoid privilege escalation.`);
      exit(1);
    }

    await registerUser(username, password, 'admin');
    console.info(`Bootstrap admin user "${username}" created.`);
  } catch (err) {
    console.error('Failed to ensure initial admin user:', err);
    exit(1);
  }
}