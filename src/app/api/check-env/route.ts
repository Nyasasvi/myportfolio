// Check environment variables endpoint
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      smtpUser: process.env.SMTP_USER ? 'Set ✅' : 'Not set ❌',
      smtpPass: process.env.SMTP_PASS ? 'Set ✅' : 'Not set ❌',
      cronSecret: process.env.CRON_SECRET ? 'Set ✅' : 'Not set ❌',
      openaiKey: process.env.OPENAI_API_KEY ? 'Set ✅' : 'Not set ❌',
      nodeEnv: process.env.NODE_ENV || 'Not set',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check environment variables' },
      { status: 500 }
    );
  }
}
