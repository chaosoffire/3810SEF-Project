import { FlattenMaps } from 'mongoose';
import { MongoDBManager } from '../../mongodb.manager';
import { userSchema, IUser, Role } from '../schema/userSchema';

export const USER_COLLECTION = 'users';

export async function createUser(userData: IUser): Promise<true> {
  const model = MongoDBManager.getInstance().getModel<IUser>(USER_COLLECTION, userSchema);
  await model.create(userData);
  return true;
};

/*
 * DEPRECATED: No callers in current codebase; prefer username lookups for repository guardrails.
export async function hasUserById(userId: string): Promise<boolean> {
  const model = MongoDBManager.getInstance().getModel(USER_COLLECTION, userSchema);
  const user = await model.findById(userId).lean();
  return !!user;
};
*/

export async function hasUserByUsername(username: string): Promise<boolean> {
  const model = MongoDBManager.getInstance().getModel(USER_COLLECTION, userSchema);
  const user = await model.findOne({ 'credential.username': username }).lean();
  return !!user;
};

export async function getAllUsers(): Promise<FlattenMaps<string>[]> {
  const model = MongoDBManager.getInstance().getModel(USER_COLLECTION, userSchema);
  const users = await model.find({}).lean();
  return users.map((u) => JSON.parse(JSON.stringify(u)));
};

export async function hasAdminUser(): Promise<boolean> {
  const model = MongoDBManager.getInstance().getModel(USER_COLLECTION, userSchema);
  const exists = await model.exists({ role: 'admin' });
  return !!exists;
};

export async function getUserByUsername(username: string): Promise<FlattenMaps<string> | null> {
  const model = MongoDBManager.getInstance().getModel(USER_COLLECTION, userSchema);
  const user = await model.findOne({ 'credential.username': username }).lean();
  return user ? JSON.parse(JSON.stringify(user)) : null;
};

/*
 * DEPRECATED: Never referenced; retain for legacy compatibility only.
export async function getUserById(userId: string): Promise<FlattenMaps<string> | null> {
  const model = MongoDBManager.getInstance().getModel(USER_COLLECTION, userSchema);
  const user = await model.findById(userId).lean();
  return user ? JSON.parse(JSON.stringify(user)) : null;
};
*/

/*
 * DEPRECATED: Unused v1 helper; rely on logoutUserByUsername for active sessions.
export async function logoutUserById(userId: string): Promise<true> {
  const model = MongoDBManager.getInstance().getModel(USER_COLLECTION, userSchema);
  await model.updateOne({ _id: userId }, { $set: { 'session.lastLogoutAt': Date.now() } });
  return true;
};
*/

export async function logoutUserByUsername(username: string): Promise<true> {
  const model = MongoDBManager.getInstance().getModel(USER_COLLECTION, userSchema);
  await model.updateOne({ 'credential.username': username }, { $set: { 'session.lastLogoutAt': Date.now() } });
  return true;
};

/*
 * DEPRECATED: Broad wipe utility is unused; avoid accidental destructive operations.
export async function deleteAllUsers(): Promise<true> {
  const model = MongoDBManager.getInstance().getModel(USER_COLLECTION, userSchema);
  await model.deleteMany({});
  return true;
};
*/

/*
 * DEPRECATED: Not referenced; prefer username-specific deletions aligning with credential index.
export async function deleteUserById(userId: string): Promise<true> {
  const model = MongoDBManager.getInstance().getModel(USER_COLLECTION, userSchema);
  await model.deleteOne({ _id: userId });
  return true;
};
*/

export async function deleteUserByUsername(username: string): Promise<true> {
  const model = MongoDBManager.getInstance().getModel(USER_COLLECTION, userSchema);
  await model.deleteOne({ 'credential.username': username });
  return true;
};

export async function updateUserPasswordHashByUsername(username: string, passwordHash: string): Promise<true> {
  const model = MongoDBManager.getInstance().getModel(USER_COLLECTION, userSchema);
  await model.updateOne({ 'credential.username': username }, { $set: { 'credential.passwordHash': passwordHash } });
  return true;
};

export async function getUserOrdersByUsername(username: string): Promise<string[] | null> {
  const model = MongoDBManager.getInstance().getModel<IUser>(USER_COLLECTION, userSchema);
  const user = await model.findOne({ 'credential.username': username }).lean();
  return user ? JSON.parse(JSON.stringify(user.orders)) : null;
}