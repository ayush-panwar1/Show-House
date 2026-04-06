import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/database";
import { signToken } from "../../../lib/jwtToken";
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const { email, password, confirm_password } = body;

        // Basic validation
        if (!email || !password || !confirm_password) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        if (password !== confirm_password) {
            return NextResponse.json(
                { error: "Passwords do not match" },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: "Password must be at least 6 characters" },
                { status: 400 }
            );
        }

        // Normalize email
        const normalizedEmail = email.toLowerCase();


        // Check if user already exists
        const existingUser = await db.query(
            "SELECT id,password_hash,google_id FROM users WHERE email = $1",
            [normalizedEmail]
        );

        if (existingUser.rows.length > 0) {
            if (existingUser.rows[0].password_hash != null) {
                return NextResponse.json(
                    { error: "Email already registered" },
                    { status: 409 }
                );
            }
            // case of user registered with google id
            // they will be asked to login with google, then can upadte password in the setting
            return NextResponse.json(
                    { error: "User already exist, continue with Google." },
                    { status: 409 }
                );


        }


        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const newUser = await db.query(
            `
            INSERT INTO users (email, password_hash, username)
            VALUES ($1, $2, $3)
            RETURNING id
            `,
            [normalizedEmail, hashedPassword, normalizedEmail]
        );

        const userId = newUser.rows[0].id;

        // Create JWT
        const token = signToken({
            userId,
            email: normalizedEmail,
        });


        // Redirect response
        const response = NextResponse.redirect(
            new URL("/user?status=success", request.url)
        );

        // Set cookie
        response.cookies.set("userToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });

        return response;
    } catch (err) {
        console.error("Signup Error:", err);

        return NextResponse.json(
            { error: "Signup failed" },
            { status: 500 }
        );
    }
}