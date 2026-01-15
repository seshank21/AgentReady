import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '@/lib/supabase';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
}) : null;

const genAI = process.env.GOOGLE_GENERATIVE_AI_API_KEY ? new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY) : null;

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // Normalize URL
        const targetUrl = new URL(url).toString();

        // 1. Check Supabase for cached data (last 4 hours)
        const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
        const { data: cachedData } = await supabase
            .from('scans')
            .select('*')
            .eq('url', targetUrl)
            .gt('updated_at', fourHoursAgo)
            .single();

        if (cachedData) {
            console.log('Returning cached result (scanned within last 4 hours) for:', targetUrl);
            return NextResponse.json(cachedData);
        }
        
        console.log('No recent cache found, performing fresh scan for:', targetUrl);

        // 2. Scrape the HTML
        let html: string;
        try {
            const response = await fetch(targetUrl, {
                headers: {
                    'User-Agent': 'AgentReadyScanner/1.0',
                    'Accept': 'text/html,application/xhtml+xml',
                },
                redirect: 'follow',
            });

            if (!response.ok) {
                console.error('Fetch failed', response.status, response.statusText, 'for', targetUrl);
                return NextResponse.json({ error: `Failed to fetch URL: ${response.status} ${response.statusText}` }, { status: 502 });
            }

            html = await response.text();
        } catch (e: any) {
            console.error('Network error while fetching URL:', e?.message || e);
            return NextResponse.json({ error: `Network error while fetching URL: ${e?.message || String(e)}` }, { status: 502 });
        }

        const $ = cheerio.load(html);
        console.log('Scraping successful. Title:', $('title').text());

        // COMPREHENSIVE DATA EXTRACTION
        const baseUrl = new URL(targetUrl);
        
        // 1. Basic SEO & Structured Data
        const title = $('title').text();
        const metaDescription = $('meta[name="description"]').attr('content') || '';
        const metaKeywords = $('meta[name="keywords"]').attr('content') || '';
        const ogTitle = $('meta[property="og:title"]').attr('content') || '';
        const ogDescription = $('meta[property="og:description"]').attr('content') || '';
        
        // 2. Extract ALL headings for context
        const headings = {
            h1: $('h1').map((_, el) => $(el).text().trim()).get().join(' | '),
            h2: $('h2').map((_, el) => $(el).text().trim()).get().join(' | '),
            h3: $('h3').map((_, el) => $(el).text().trim()).get().join(' | '),
        };
        
        // 3. Extract JSON-LD structured data
        let structuredData = '';
        $('script[type="application/ld+json"]').each((_, el) => {
            try {
                const jsonData = JSON.parse($(el).html() || '{}');
                structuredData += JSON.stringify(jsonData) + ' ';
            } catch (e) {
                // Invalid JSON, skip
            }
        });
        
        // 4. COMPREHENSIVE pricing extraction
        const priceSelectors = [
            '[class*="price"]', '[id*="price"]', '[class*="pricing"]', '[id*="pricing"]',
            '[itemprop="price"]', '[itemscope][itemtype*="Offer"]', '[data-price]',
            '.cost', '.amount', '.fee', '.rate', '[class*="plan"]', '[id*="plan"]',
            '[class*="tier"]', '[id*="tier"]', 'table', '.package', '.subscription'
        ];
        
        let pricingElements: string[] = [];
        priceSelectors.forEach(selector => {
            try {
                $(selector).each((_, el) => {
                    const text = $(el).text().trim();
                    const html = $(el).html() || '';
                    // Extract if contains currency symbols or numeric patterns
                    if (text && (text.match(/[$€£¥₹]/g) || text.match(/\d+[.,]\d+/g) || text.includes('price') || text.includes('month') || text.includes('year'))) {
                        pricingElements.push(text);
                    }
                });
            } catch (e) {
                // Ignore selector errors
            }
        });
        
        // 5. Extract buy buttons and CTAs
        const buyButtonSelectors = [
            'button', 'a[href*="buy"]', 'a[href*="cart"]', 'a[href*="checkout"]',
            'a[href*="purchase"]', '[class*="cta"]', '[id*="cta"]', 
            '[class*="buy"]', '[class*="cart"]', '[class*="checkout"]',
            'input[type="submit"]', '[role="button"]'
        ];
        
        let buyButtons: string[] = [];
        buyButtonSelectors.forEach(selector => {
            try {
                $(selector).each((_, el) => {
                    const text = $(el).text().trim();
                    const href = $(el).attr('href') || '';
                    if (text && text.length < 100) {
                        buyButtons.push(`${text} [${href}]`);
                    }
                });
            } catch (e) {
                // Ignore errors
            }
        });
        
        // 6. Find relevant sub-pages
        const relevantLinks: string[] = [];
        $('a[href]').each((_, el) => {
            const href = $(el).attr('href') || '';
            const text = $(el).text().trim().toLowerCase();
            
            // Look for pricing, product, buy pages
            if (href && (
                href.includes('pricing') || href.includes('price') || 
                href.includes('buy') || href.includes('shop') || 
                href.includes('product') || href.includes('plans') ||
                text.includes('pricing') || text.includes('buy') || 
                text.includes('shop') || text.includes('plans')
            )) {
                try {
                    const fullUrl = new URL(href, baseUrl.origin);
                    if (fullUrl.hostname === baseUrl.hostname && !relevantLinks.includes(fullUrl.toString())) {
                        relevantLinks.push(fullUrl.toString());
                    }
                } catch (e) {
                    // Invalid URL, skip
                }
            }
        });
        
        // 7. Scrape up to 3 most relevant sub-pages
        let subPagesContent = '';
        for (let i = 0; i < Math.min(3, relevantLinks.length); i++) {
            try {
                console.log(`Scraping sub-page ${i + 1}:`, relevantLinks[i]);
                const subResponse = await fetch(relevantLinks[i], {
                    headers: {
                        'User-Agent': 'AgentReadyScanner/1.0',
                        'Accept': 'text/html,application/xhtml+xml',
                    },
                    redirect: 'follow',
                    signal: AbortSignal.timeout(5000), // 5 second timeout per sub-page
                });
                
                if (subResponse.ok) {
                    const subHtml = await subResponse.text();
                    const $sub = cheerio.load(subHtml);
                    
                    // Extract pricing info from sub-page
                    const subPricing = $sub('[class*="price"], [id*="price"], [class*="pricing"]').text();
                    const subContent = $sub('body').text().replace(/\s+/g, ' ').substring(0, 5000);
                    subPagesContent += `\n\nSub-page (${relevantLinks[i]}): ${subPricing} ${subContent}`;
                }
            } catch (e) {
                console.log(`Failed to fetch sub-page ${relevantLinks[i]}:`, e);
                // Continue with other pages
            }
        }
        
        // 8. Get FULL body content (no limits)
        const fullBodyText = $('body').text().replace(/\s+/g, ' ');
        
        // 9. Combine everything for AI analysis
        const contentForAI = `
WEBSITE ANALYSIS FOR: ${targetUrl}

META DATA:
Title: ${title}
Description: ${metaDescription}
Keywords: ${metaKeywords}
OG Title: ${ogTitle}
OG Description: ${ogDescription}

HEADINGS:
H1: ${headings.h1}
H2: ${headings.h2}
H3: ${headings.h3}

STRUCTURED DATA (JSON-LD):
${structuredData.substring(0, 2000)}

PRICING ELEMENTS FOUND (${pricingElements.length} elements):
${pricingElements.slice(0, 50).join(' | ')}

BUY BUTTONS/CTAs FOUND (${buyButtons.length} buttons):
${buyButtons.slice(0, 30).join(' | ')}

FULL PAGE CONTENT:
${fullBodyText}

${subPagesContent}
`.trim();

        // 3. Analyze with available AI provider
        let analysis: any = {};
        const systemPrompt = `You are an AI Agent with the task of purchasing a product or service from a website. You must be EXTREMELY THOROUGH.

INSTRUCTIONS:
1. Extract 'product_name': The main product, service, or company name (REQUIRED)
2. Extract 'price': Look for ANY pricing information - numbers with currency symbols ($, €, £, ¥, ₹, etc.), pricing tables, subscription costs, monthly/yearly rates. Extract the FIRST clear price you find as a number only (e.g., 99.99, 1200, 49). Return null ONLY if absolutely no pricing exists anywhere.
3. Extract 'currency': Detect the currency from the pricing. Return the 3-letter ISO code:
   - $ or USD or dollars → "USD"
   - € or EUR or euros → "EUR"
   - £ or GBP or pounds → "GBP"
   - ¥ or JPY or yen → "JPY"
   - ₹ or INR or rupees → "INR"
   - AUD, CAD, CHF, CNY, etc. → use the 3-letter code
   If no currency detected, return "USD" as default.
4. Set 'buy_link_found': Return "true" if you can see:
   - Buy buttons, "Add to Cart", "Purchase", "Checkout" buttons
   - Clear pricing tables with plan options
   - Contact/Demo buttons for enterprise products
   - Any clear path to purchase or pricing inquiry
   Return "false" ONLY if there's absolutely no way to buy or inquire about pricing.
5. Write 'summary': Describe what the product/service is and what pricing you found
6. Calculate 'agent_readability_score': 
   - 90-100: Perfect - clear product, visible pricing, obvious buy button
   - 70-89: Good - product clear, pricing visible but may require scrolling
   - 50-69: Fair - product clear, pricing exists but hard to find
   - 30-49: Poor - pricing hidden or unclear
   - 0-29: Very Poor - no pricing or very difficult to find

RETURN ONLY VALID JSON with fields: product_name, price, currency, buy_link_found, summary, agent_readability_score`;
        const userPrompt = contentForAI;

        let geminiError: any = null;
        
        // Try Gemini first if available
        if (genAI) {
            console.log('Attempting Google Generative AI (Gemini)');
            try {
                const model = genAI.getGenerativeModel({
                    model: 'gemini-2.5-flash', // Using 2.5-flash model
                    generationConfig: {}
                });
                const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);
                const text = result.response.text();
                console.log('Gemini raw response:', text);
                
                // Strip markdown code blocks if present
                let jsonText = text.trim();
                if (jsonText.startsWith('```json')) {
                    jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
                } else if (jsonText.startsWith('```')) {
                    jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
                }
                
                try {
                    analysis = JSON.parse(jsonText);
                    console.log('✓ Successfully analyzed with Gemini');
                } catch (parseErr: any) {
                    console.error('Failed to parse Gemini JSON:', parseErr, 'raw:', text);
                    return NextResponse.json({ error: 'AI returned invalid JSON (Gemini)', raw: text }, { status: 502 });
                }
            } catch (aiError: any) {
                console.error('Gemini error:', aiError.message);
                geminiError = aiError;
                
                // Check if it's a quota/rate limit error
                if (aiError.message?.includes('quota') || aiError.message?.includes('429') || aiError.message?.includes('rate limit')) {
                    console.log('Gemini quota exceeded, will try OpenAI fallback if available');
                } else {
                    // For non-quota errors, fail immediately
                    throw new Error(`AI Analysis failed (Gemini): ${aiError.message}`);
                }
            }
        }

        // Try OpenAI if Gemini failed with quota error or if Gemini not available
        if (!analysis.product_name && openai) {
            console.log(geminiError ? 'Falling back to OpenAI (GPT-4o-mini)' : 'Using OpenAI (GPT-4o-mini)');
            try {
                const completion = await openai.chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt },
                    ],
                    response_format: { type: 'json_object' },
                });
                const content = completion.choices[0].message.content || '{}';
                const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
                console.log('OpenAI raw response:', contentStr);
                try {
                    analysis = JSON.parse(contentStr);
                    console.log('✓ Successfully analyzed with OpenAI');
                } catch (parseErr: any) {
                    console.error('Failed to parse OpenAI JSON:', parseErr, 'raw:', contentStr);
                    return NextResponse.json({ error: 'AI returned invalid JSON (OpenAI)', raw: contentStr }, { status: 502 });
                }
            } catch (aiError: any) {
                console.error('OpenAI error:', aiError);
                throw new Error(`AI Analysis failed (OpenAI): ${aiError.message}`);
            }
        }

        // If still no analysis, return appropriate error
        if (!analysis.product_name) {
            if (geminiError) {
                return NextResponse.json({ 
                    error: 'AI quota exceeded. Please add an OPENAI_API_KEY to your .env.local file for fallback, or wait for your Gemini quota to reset.',
                    details: geminiError.message 
                }, { status: 429 });
            }
            return NextResponse.json({ error: 'No AI provider available. Please set OPENAI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY' }, { status: 500 });
        }

        // 4. Cache to Supabase
        const { data: savedData, error: saveError } = await supabase
            .from('scans')
            .upsert({
                url: targetUrl,
                product_name: analysis.product_name,
                price: analysis.price,
                currency: analysis.currency || 'USD',
                buy_link_found: analysis.buy_link_found === true || analysis.buy_link_found === 'true',
                summary: analysis.summary,
                agent_readability_score: analysis.agent_readability_score,
                updated_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (saveError) {
            console.error('Database save error:', saveError);
        }

        return NextResponse.json(savedData || analysis);
    } catch (error: any) {
        console.error('Scan error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
