
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/database";
import { verifyToken } from "../../../../lib/jwtToken";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("userToken")?.value;

    if (!token) {
      return NextResponse.json(
        { user: null },
        {
          status: 401,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    const payload = verifyToken(token);

    if (!payload || !payload.userId) {
      return NextResponse.json(
        { user: null },
        {
          status: 401,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    const result = await db.query(
      `SELECT id, email, first_name, last_name, username
       FROM users
       WHERE id = $1`,
      [payload.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { user: null },
        {
          status: 401,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    const row = result.rows[0];

    return NextResponse.json(
      {
        user: {
          id: row.id,
          email: row.email ?? null,
          name: [row.first_name, row.last_name]
            .filter(Boolean)
            .join(" "),
          username: row.username ?? null,
        },
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("Authentication check failed:", error);

    return NextResponse.json(
      { user: null, error: "Unable to verify authentication" },
      { status: 500 }
    );
  }
}
