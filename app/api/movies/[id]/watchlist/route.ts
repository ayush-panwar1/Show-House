
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../lib/database";
import { verifyToken } from "../../../../../lib/jwtToken";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function getMovieId(id: string) {
  if (!/^\d+$/.test(id)) return null;

  try {
    const parsed = BigInt(id);
    const minAllowed = BigInt("0");
    const maxAllowed = BigInt("9223372036854775807");

    if (parsed <= minAllowed || parsed > maxAllowed) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function getUserId(request: NextRequest) {
  const token = request.cookies.get("userToken")?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  return payload?.userId ?? null;
}

// Check whether this movie is in the logged-in user's watchlist.
export async function GET(request: NextRequest, { params }: RouteContext) {
  const userId = getUserId(request);

  if (!userId) {
    return NextResponse.json({ error: "Please log in first." }, { status: 401 });
  }

  const { id } = await params;
  const movieId = getMovieId(id);

  if (!movieId) {
    return NextResponse.json({ error: "Invalid movie ID." }, { status: 400 });
  }

  try {
    const result = await db.query(
      `SELECT 1
       FROM public.watchlist
       WHERE user_id = $1 AND movie_id = $2`,
      [userId, movieId]
    );

    return NextResponse.json(
      { inWatchlist: (result.rowCount ?? 0) > 0 },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Watchlist check failed:", error);
    return NextResponse.json({ error: "Unable to check watchlist." }, { status: 500 });
  }
}

// Ensure the movie exists, then add it to the user's watchlist.
export async function POST(request: NextRequest, { params }: RouteContext) {
  const userId = getUserId(request);

  if (!userId) {
    return NextResponse.json({ error: "Please log in first." }, { status: 401 });
  }

  const { id } = await params;
  const movieId = getMovieId(id);

  if (!movieId) {
    return NextResponse.json({ error: "Invalid movie ID." }, { status: 400 });
  }

  let body: { title?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (typeof body.title !== "string" || !body.title.trim()) {
    return NextResponse.json({ error: "Movie title is required." }, { status: 400 });
  }

  const title = body.title.trim();
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // Insert the movie first. Keep the existing title if it already exists.
    await client.query(
      `INSERT INTO public.movies (movie_id, title)
       VALUES ($1, $2)
       ON CONFLICT (movie_id) DO NOTHING`,
      [movieId, title]
    );

    // Add the relationship. Duplicate entries are ignored.
    await client.query(
      `INSERT INTO public.watchlist (user_id, movie_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, movie_id) DO NOTHING`,
      [userId, movieId]
    );

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      inWatchlist: true,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Adding to watchlist failed:", error);

    return NextResponse.json(
      { error: "Unable to add movie to watchlist." },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

// Remove the relationship without deleting the movie itself.
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const userId = getUserId(request);

  if (!userId) {
    return NextResponse.json({ error: "Please log in first." }, { status: 401 });
  }

  const { id } = await params;
  const movieId = getMovieId(id);

  if (!movieId) {
    return NextResponse.json({ error: "Invalid movie ID." }, { status: 400 });
  }

  try {
    await db.query(
      `DELETE FROM public.watchlist
       WHERE user_id = $1 AND movie_id = $2`,
      [userId, movieId]
    );

    return NextResponse.json({ success: true, inWatchlist: false });
  } catch (error) {
    console.error("Removing from watchlist failed:", error);

    return NextResponse.json(
      { error: "Unable to remove movie from watchlist." },
      { status: 500 }
    );
  }
}
