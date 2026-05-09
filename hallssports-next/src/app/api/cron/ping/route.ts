import { NextResponse } from 'next/server';

// Health check endpoint for uptime monitoring (e.g., UptimeRobot, Better Uptime)
// This is a simple ping endpoint that returns 200 OK
export async function GET() {
  return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
}