import { NextResponse } from 'next/server';

export async function GET() {
  // Since we don't have a database in this frontend-only version, 
  // we return a mock leaderboard. 
  // In a real Vercel app, you would use Vercel KV or Postgres here.
  const mockLeaderboard = [
    { id: 1, name: "Yusuf", gamesWon: 42, highScore: 5000 },
    { id: 2, name: "Asmaca Üstadı", gamesWon: 35, highScore: 4200 },
    { id: 3, name: "Kelime Avcısı", gamesWon: 28, highScore: 3500 },
    { id: 4, name: "Misafir", gamesWon: 15, highScore: 1800 },
    { id: 5, name: "Çaylak", gamesWon: 5, highScore: 600 }
  ];

  return NextResponse.json(mockLeaderboard);
}
