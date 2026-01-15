import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('scans')
            .select('url, product_name, agent_readability_score')
            .order('agent_readability_score', { ascending: false })
            .limit(10);

        if (error) {
            console.error('Database error fetching top scans:', error);
            return NextResponse.json({ error: 'Failed to fetch top scans' }, { status: 500 });
        }

        return NextResponse.json({ scans: data || [] });
    } catch (error) {
        console.error('Error in top-scans API:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
