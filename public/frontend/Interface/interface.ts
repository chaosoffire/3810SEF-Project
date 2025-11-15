import "express";

// sign up
export interface signUpPayload {
    username: string;
    password: string;
    admin: boolean;
}

export interface signUpError {
    status: boolean;
    error: string;
}
// -------------------
// sign in
export interface signInPayload {
    username: string;
    password: string;
}

interface baseSignInResult {
    success: boolean;
}

interface signInSuccess extends baseSignInResult {
    username: string;
    error?: never;
}

interface signInFailed extends baseSignInResult {
    username: never;
    error: string;
}

export type signInResult = signInSuccess | signInFailed;
// -------------------
// role

export interface getRoleResult {
    success: boolean;
    isAdmin: boolean;
}

// book result

export interface book {
    _id: string;
    title: string;
    author: string;
    price: number;
    genres: string[];
    publishedYear: string;
    coverImage: string;
}

export interface bookResult {
    success: boolean;
    data: book[];
    count: number;
}

export interface singleBook {
    success:boolean;
    data:{
        _id: string;
        title: string;
        author: string;
        description: string;
        price: number;
        genres: string[];
        publishedYear: string;
        coverImage: string;
    }
}
