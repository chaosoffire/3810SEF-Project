import mongoose, { Schema, model, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

const USER_COLLECTION = 'users';

// Export the schema so other modules can type their models against it
export const userSchema = new Schema({
    role: {
        type: String,
        enum: ['admin', 'user', 'test'],
        default: 'user'
    },
    credential: {
        username: {
            type: String,
            required: [true, 'Username is required'],
            unique: true,
            trim: true
        },
        passwordHash: {
            type: String,
            required: [true, 'Password Hash is required']
        }
    },
    session: {
        lastLogoutAt: {
            type: Date,
            default: null
        }
    },
    orders: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'Order'
        }
    ],
    createdAt: {
        type: Date,
        default: () => Date.now()
    }
});

// Add index for better query performance
userSchema.index({ 'credential.username': 1 });

userSchema.pre('save', async function(next) {
    if (!this.credential || !this.isModified('credential.passwordHash')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.credential.passwordHash = await bcrypt.hash(this.credential.passwordHash, salt);
        next();
    } catch (err: any) {
        next(err);
    }
});

/*
 * DEPRECATED: comparePassword relied on direct model usage; repositories now handle password verification explicitly.
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.credential.passwordHash);
};
*/

// Strong input type for creating a user (aligns with schema)
export type Role = 'admin' | 'user' | 'test';
export interface IUser {
    role?: Role;
    credential: {
        username: string;
        passwordHash: string;
    };
    session?: { 
        lastLogoutAt?: Date | null 
    };
    orders?: Types.ObjectId[];
    createdAt?: Date;
};