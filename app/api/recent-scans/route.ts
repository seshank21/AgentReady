import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('scans')
            .select('url, product_name, agent_readability_score')
            .order('updated_at', { ascending: false }) // Use updated_at (or created_at) for recency
            .limit(10);

        if (error) {
            console.error('Database error fetching recent scans:', error);
            return NextResponse.json({ error: 'Failed to fetch recent scans' }, { status: 500 });
        }

        return NextResponse.json({ scans: data || [] });
    } catch (error) {
        console.error('Error in recent-scans API:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
