import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/database";
import { signToken } from "../../../lib/jwtToken";

function decodeJwt(token: string) {
  const base64Payload = token.split(".")[1];
  const decodedPayload = Buffer.from(base64Payload, "base64").toString("utf-8");
  return JSON.parse(decodedPayload);
}

// this code handle the redirect url from the google authorization server sending the authorizatpn code
// the code is sent to server again from backend to get access token and id token, from which i get user info and use 
// it to call the db for user query.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        new URL(`/user?status=fail&message=${error}`, request.url),
      );
    }

    if (!code) {
      return NextResponse.json(
        { error: "Missing authorization code" },
        { status: 400 },
      );
    }

    const clientId = process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;

    //  Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: "https://show-house.vercel.app/api/auth",
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Token exchange failed");
    }

    const tokens = await tokenResponse.json();

    if (!tokens.id_token) {
      throw new Error("No id_token received");
    }

    //  Decode token
    const decoded = decodeJwt(tokens.id_token);

    const googleId = decoded.sub;
    const email = decoded.email;
    const firstName = decoded.given_name;
    const lastName = decoded.family_name;

    //  Check if user already exists
    const existingUser = await db.query(
      "SELECT id FROM users WHERE google_id = $1",
      [googleId],
    );
    let token = null;
    if (existingUser.rows.length === 0) {
      // Insert new user
      const newUser = await db.query(
        `
        INSERT INTO users (email, first_name, last_name, google_id, username)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
        `,
        [email, firstName, lastName, googleId, email],
      );

      token = signToken({ userId: newUser.rows[0].id, email: null });

      // console.log("New Google user inserted");
    } else {
      // sign jwt token:
      token = signToken({ userId: existingUser.rows[0].id, email: null });
      // console.log("User already exists");
    }

    const response = NextResponse.redirect(
      new URL("/user?status=success", request.url),
    );

    // set the token insde cookie
    response.cookies.set("userToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  } catch (err) {
    console.error("OAuth Error:", err);

    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 },
    );
  }
}
