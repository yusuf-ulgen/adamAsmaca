import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // In a frontend-only setup, we primarily rely on localStorage.
  // This endpoint can be used later if a database is added.
  // For now, we just return a success status to not break the frontend.
  return NextResponse.json({ status: "success", message: "Stats updated locally in browser" });
}
