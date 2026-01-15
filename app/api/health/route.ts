import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    return NextResponse.json({
        env_check: {
            has_openai_key: !!process.env.OPENAI_API_KEY,
            has_gemini_key: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
            has_supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            has_supabase_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        },
        node_version: process.version,
        timestamp: new Date().toISOString(),
    });
}
