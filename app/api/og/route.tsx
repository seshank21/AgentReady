import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        // Get params
        const url = searchParams.get('url') || 'mysite.com';
        const score = parseInt(searchParams.get('score') || '0');
        const productName = searchParams.get('product') || 'Unknown Product';

        const isOptimized = score >= 80;
        const isModerate = score >= 50 && score < 80;

        let accentColor = '#ef4444'; // Red-500
        if (isOptimized) accentColor = '#22c55e'; // Green-500
        if (isModerate) accentColor = '#eab308'; // Yellow-500

        const statusText = isOptimized ? 'OPTIMIZED' : score < 50 ? 'INVISIBLE' : 'MODERATE';

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#09090b',
                        color: '#fafafa',
                        fontFamily: 'Inter, sans-serif',
                        padding: '80px',
                        position: 'relative',
                    }}
                >
                    {/* Grid Background */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            backgroundImage: 'radial-gradient(circle at 2px 2px, #27272a 1px, transparent 0)',
                            backgroundSize: '40px 40px',
                            opacity: 0.5,
                        }}
                    />

                    {/* Header */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '60px',
                            left: '80px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}
                    >
                        <div style={{ width: '12px', height: '12px', backgroundColor: accentColor, borderRadius: '2px' }} />
                        <span style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '2px', color: '#71717a' }}>
                            AGENTREADY AUDIT // V1.0
                        </span>
                    </div>

                    {/* Main Content */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                        <span style={{ fontSize: '32px', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '4px' }}>
                            Readability Score
                        </span>
                        <span
                            style={{
                                fontSize: '240px',
                                fontWeight: 900,
                                color: accentColor,
                                lineHeight: 1,
                                letterSpacing: '-12px',
                            }}
                        >
                            {score}
                        </span>
                    </div>

                    {/* Badge/Stamp */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            right: '80px',
                            transform: 'translateY(-50%) rotate(15deg)',
                            border: `8px solid ${accentColor}`,
                            padding: '12px 24px',
                            color: accentColor,
                            fontSize: '48px',
                            fontWeight: '900',
                            textTransform: 'uppercase',
                            borderRadius: '12px',
                            opacity: 0.8,
                        }}
                    >
                        {statusText}
                    </div>

                    {/* Footer Metadata */}
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '60px',
                            left: '80px',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <span style={{ fontSize: '20px', color: '#71717a', textTransform: 'uppercase' }}>Target URL</span>
                        <span style={{ fontSize: '28px', fontWeight: 'bold' }}>{url.replace(/^https?:\/\//, '')}</span>
                    </div>

                    <div
                        style={{
                            position: 'absolute',
                            bottom: '60px',
                            right: '80px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            backgroundColor: '#18181b',
                            padding: '12px 24px',
                            borderRadius: '100px',
                            border: '1px solid #27272a',
                        }}
                    >
                        <span style={{ fontSize: '18px', color: '#a1a1aa' }}>Scanned by</span>
                        <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#fafafa' }}>AgentReady.ai</span>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    } catch (e: any) {
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
