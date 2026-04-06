import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/database";
import { signToken } from "../../../lib/jwtToken";
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { email, password } = body;

    // Basic validation
    if (!email || !password ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

   

    // Normalize email
    const normalizedEmail = email.toLowerCase();

    // Check if user already exists
    const existingUser = await db.query(
      "SELECT id, password_hash FROM users WHERE email = $1",
      [normalizedEmail]
    );

    if (existingUser.rows.length == 0) {
      return NextResponse.json(
        { error: "No User Found" },
        { status: 403 }
      );
    }
    // case of email and no password( google login):
    if(existingUser.rows[0].password_hash == null){
        return NextResponse.json(
        { error: "User already Exist. Continue login with Google." },
        { status: 403 }
      );
    }
    // Compare password
    const isPasswordValid = await bcrypt.compare(password, existingUser.rows[0].password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 403 }
      );
    }

    const userId = existingUser.rows[0].id;

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
    console.error("Signin Error:", err);

    return NextResponse.json(
      { error: "Signin failed" },
      { status: 500 }
    );
  }
}