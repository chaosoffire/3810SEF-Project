import crypto from "node:crypto";
import { exit } from "node:process";

import ConfigManager from "../../../../config/config.manager";

export interface SessionPayload {
	username: string;
	create_at: number; // epoch ms
	timeout: number; // epoch ms
}

function getSecretKey(): Promise<Buffer> {
	return ConfigManager.getConfigManager()
		.get("SESSION_SECRET")
		.then((s) => {
			// Derive a 32-byte key from the secret using SHA-256
			const key = crypto.createHash("sha256").update(String(s)).digest();
			return key;
		})
		.catch(() => {
			console.error("SESSION_SECRET not set in configuration");
			exit(1);
		});
}

export async function createSessionToken(
	username: string,
	ttlMs?: number,
): Promise<string> {
	const now = Date.now();
	// Load TTL from configuration if not provided
	let ttl = ttlMs;
	if (ttl == null) {
		try {
			const cfg = await ConfigManager.getConfigManager().get("SESSION_TIMEOUT");
			const parsed = Number(cfg);
			if (Number.isFinite(parsed) && parsed > 0) ttl = parsed;
		} catch {
			// fallback below
		}
	}
	if (ttl == null) ttl = 30 * 60 * 1000;
	const payload: SessionPayload = {
		username,
		create_at: now,
		timeout: now + ttl,
	};
	const plaintext = Buffer.from(JSON.stringify(payload), "utf8");
	const key = await getSecretKey();
	const iv = crypto.randomBytes(12); // AES-GCM recommended 12-byte IV
	const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
	const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
	const tag = cipher.getAuthTag();
	// Pack iv|tag|ciphertext to a single buffer
	const packed = Buffer.concat([iv, tag, encrypted]);
	return packed.toString("base64");
}

export async function verifySessionToken(
	token: string,
): Promise<SessionPayload | null> {
	try {
		const buf = Buffer.from(token, "base64");
		if (buf.length < 12 + 16 + 1) return null; // iv(12) + tag(16) + at least 1 byte
		const iv = buf.subarray(0, 12);
		const tag = buf.subarray(12, 28);
		const ciphertext = buf.subarray(28);
		const key = await getSecretKey();
		const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
		decipher.setAuthTag(tag);
		const decrypted = Buffer.concat([
			decipher.update(ciphertext),
			decipher.final(),
		]);
		const payload = JSON.parse(decrypted.toString("utf8")) as SessionPayload;
		// basic shape validation
		if (
			!payload ||
			typeof payload.username !== "string" ||
			typeof payload.create_at !== "number" ||
			typeof payload.timeout !== "number"
		) {
			return null;
		}
		return payload;
	} catch {
		return null;
	}
}

export function isExpired(payload: SessionPayload): boolean {
	return Date.now() > payload.timeout;
}
