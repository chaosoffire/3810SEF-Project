import bcrypt from "bcryptjs";
import express from "express";
import { body, param, validationResult } from "express-validator";

import * as userRepo from "../../database/model/user/user.repository";
import { registerUser } from "../auth/service/register";
import { userExists } from "../user/service/service";

export const testRouter = express.Router({
	mergeParams: true,
});

const handleValidationErrors = (
	req: express.Request,
	res: express.Response,
	next: express.NextFunction,
) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({
			success: false,
			error: "Validation failed",
			details: errors.array(),
		});
	}
	next();
};

// C: Create a test user (role=test)
// POST /api/:api_version/test/TEST_PATH/users
testRouter.post(
	"/users",
	body("username").isString().isLength({
		min: 8,
		max: 32,
	}),
	body("password").isString().isLength({
		min: 12,
		max: 64,
	}),
	handleValidationErrors,
	async (req, res) => {
		const { username, password } = req.body as {
			username: string;
			password: string;
		};
		try {
			if (await userExists(username)) {
				return res.status(409).json({
					success: false,
					error: "Username already exists",
				});
			}
			// Use register flow to create role 'test' user; hashing handled by pre-save/registration logic
			await registerUser(username, password, "test");
			return res.status(201).json({
				success: true,
				username,
			});
		} catch (_err: any) {
			return res.status(500).json({
				success: false,
				error: "Failed to create test user",
			});
		}
	},
);

// R: Read all test users
// GET /api/:api_version/test/TEST_PATH/users
testRouter.get("/users", async (_req, res) => {
	try {
		const all = await userRepo.getAllUsers();
		const users = (all || []).filter((u: any) => u.role === "test");
		return res.json({
			success: true,
			users,
		});
	} catch (_err: any) {
		return res.status(500).json({
			success: false,
			error: "Failed to fetch users",
		});
	}
});

// R: Read a specific test user by username
// GET /api/:api_version/test/TEST_PATH/users/:username
testRouter.get(
	"/users/:username",
	param("username").isString().isLength({
		min: 1,
		max: 64,
	}),
	handleValidationErrors,
	async (req, res) => {
		const username = req.params.username;
		try {
			const user = await userRepo.getUserByUsername(username);
			const u = user ? JSON.parse(JSON.stringify(user)) : null;
			if (!u || u.role !== "test")
				return res.status(404).json({
					success: false,
					error: "User not found",
				});
			return res.json({
				success: true,
				user: u,
			});
		} catch (_err: any) {
			return res.status(500).json({
				success: false,
				error: "Failed to fetch user",
			});
		}
	},
);

// U: Change a field of a test user (password)
// PUT /api/:api_version/test/TEST_PATH/users/:username
// Body: { password: string }
testRouter.put(
	"/users/:username",
	param("username").isString().isLength({
		min: 1,
		max: 64,
	}),
	body("password").isString().isLength({
		min: 12,
		max: 64,
	}),
	handleValidationErrors,
	async (req, res) => {
		const username = req.params.username;
		const { password } = req.body as {
			password: string;
		};
		try {
			const user = await userRepo.getUserByUsername(username);
			const u = user ? JSON.parse(JSON.stringify(user)) : null;
			if (!u || u.role !== "test")
				return res.status(404).json({
					success: false,
					error: "Test user not found",
				});

			const salt = await bcrypt.genSalt(10);
			const hash = await bcrypt.hash(password, salt);
			await userRepo.updateUserPasswordHashByUsername(username, hash);
			return res.json({
				success: true,
			});
		} catch (_err: any) {
			return res.status(500).json({
				success: false,
				error: "Failed to update user",
			});
		}
	},
);

// D: Delete a specific user by username if role is 'test'
// DELETE /api/:api_version/test/TEST_PATH/users/:username
testRouter.delete(
	"/users/:username",
	param("username").isString().isLength({
		min: 8,
		max: 32,
	}),
	handleValidationErrors,
	async (req, res) => {
		const username = req.params.username;
		try {
			const user = await userRepo.getUserByUsername(username);
			const u = user ? JSON.parse(JSON.stringify(user)) : null;
			if (!u)
				return res.status(404).json({
					success: false,
					error: "User not found",
				});
			if (u.role !== "test")
				return res.status(403).json({
					success: false,
					error: "Only test users can be deleted",
				});
			await userRepo.deleteUserByUsername(username);
			return res.json({
				success: true,
			});
		} catch (err: any) {
			if (err?.name === "CastError")
				return res.status(400).json({
					success: false,
					error: "Invalid username",
				});
			return res.status(500).json({
				success: false,
				error: "Failed to delete user",
			});
		}
	},
);
