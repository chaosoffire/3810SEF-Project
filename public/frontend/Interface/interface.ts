import 'express';

// sign up
export interface signUpPayload{
    username: string,
    password: string,
    admin: boolean
}

export interface signUpError{
    status:boolean,
    error:string
}
// -------------------
// sign in
export interface signInPayload{
    username: string,
    password: string,
}

interface baseSignInResult{
    success: boolean
}

interface signInSuccess extends baseSignInResult{
    username: string,
    error?: never
}

interface signInFailed extends baseSignInResult{
    username: never,
    error: string
}

export type signInResult = signInSuccess | signInFailed;
// -------------------
// role

export interface getRoleResult{
    success: true,
    isAdmin: true
}



