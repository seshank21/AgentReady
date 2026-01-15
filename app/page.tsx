'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TerminalLoader } from '@/components/terminal-loader';
import { NewsTicker } from '@/components/news-ticker';
import { Search, Shield, ShoppingCart, Info, ExternalLink, Twitter } from 'lucide-react';

// Currency symbol mapping
const getCurrencySymbol = (currency: string = 'USD'): string => {
  const symbols: { [key: string]: string } = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CNY': '¥',
    'INR': '₹',
    'AUD': 'A$',
    'CAD': 'C$',
    'CHF': 'CHF',
    'KRW': '₩',
    'BRL': 'R$',
    'MXN': 'MX$',
    'RUB': '₽',
    'ZAR': 'R',
  };
  return symbols[currency.toUpperCase()] || currency;
};

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setResult(null);
    setError(null);

    // Initial delay to show terminal loader starting
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  const onLoaderComplete = async () => {
    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      let data;
      const contentType = response.headers.get('content-type');
      const text = await response.text();

      console.log('Response status:', response.status);
      console.log('Content-Type:', contentType);
      console.log('Raw response:', text.substring(0, 500)); // Log first 500 chars only

      if (contentType?.includes('application/json')) {
        try {
          data = JSON.parse(text);
        } catch (parseErr) {
          console.error('Failed to parse JSON:', parseErr);
          data = { error: `Server returned invalid JSON. Status: ${response.status}` };
        }
      } else {
        // Server returned HTML or other non-JSON content
        console.error('Server returned non-JSON response (likely an error page)');
        data = {
          error: `Server Error (${response.status}): The API route returned HTML instead of JSON. Check server logs for details.`,
          raw: text.substring(0, 200)
        };
      }

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to reach the server. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  const shareOnX = () => {
    const text = `My site is ${result.agent_readability_score < 50 ? 'INVISIBLE' : 'OPTIMIZED'} for AI Agents! 🤖\n\nAgentReady Score: ${result.agent_readability_score}/100\n\nCheck yours at agentready-o0gjprt5f-venkataseshanka-gmailcoms-projects.vercel.app #${result.agent_readability_score > 50 ? 'AIReady' : 'SEO'}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank');
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-200 selection:bg-green-500/30 pb-32">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-green-400/10 to-emerald-500/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-blue-500/10 to-cyan-500/10 blur-[140px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 via-zinc-950 to-zinc-950" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* Hero Section */}
        <div className="text-center space-y-6 sm:space-y-8 mb-12 sm:mb-16 lg:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold tracking-widest text-green-400 border border-green-400/20 rounded-full bg-green-400/5 uppercase backdrop-blur-sm inline-block">
              AgentReady Engine v1.0
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[1.1] px-4"
          >
            Google is <span className="text-zinc-600 line-through decoration-red-500/50">dead</span>.
            <br />
            <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 text-transparent bg-clip-text">Optimize</span> your workflow.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-zinc-400 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed font-light px-4"
          >
            A next-generation scanner that analyzes if autonomous AI Agents can discover your products, extract pricing data, and execute transactions. Don't remain invisible to the future of digital commerce.
          </motion.p>
        </div>

        {/* Input Section */}
        {!result && !loading && (
          <motion.form
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            onSubmit={handleScan}
            className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-3 p-2 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl focus-within:border-green-400/30 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-sm"
          >
            <Input
              placeholder="https://your-store.com/product"
              className="bg-transparent border-zinc-800 text-base sm:text-lg h-12 sm:h-14 placeholder:text-zinc-600 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:border-green-400 focus-visible:shadow-[0_0_20px_rgba(74,222,128,0.2)]"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button size="lg" className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-zinc-950 font-semibold px-8 sm:px-10 h-12 sm:h-14 rounded-xl shadow-[0_4px_20px_rgba(74,222,128,0.25)] transition-all hover:shadow-[0_4px_24px_rgba(74,222,128,0.4)] whitespace-nowrap">
              Scan Now
            </Button>
          </motion.form>
        )}


        {/* Loading State */}
        {loading && (
          <div className="py-10">
            <TerminalLoader onComplete={onLoaderComplete} />
          </div>
        )}

        {/* Results Section */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Main Score */}
            <div className="flex flex-col items-center justify-center p-8 sm:p-12 lg:p-16 bg-gradient-to-br from-zinc-900/60 via-zinc-900/50 to-zinc-900/60 border border-zinc-700/50 rounded-2xl sm:rounded-[2rem] backdrop-blur-xl relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              <div className={`absolute inset-0 opacity-5 ${result.agent_readability_score > 70 ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gradient-to-br from-red-400 to-orange-500'}`} />
              <h2 className="text-zinc-300 uppercase tracking-[0.2em] sm:tracking-[0.3em] font-semibold text-xs sm:text-sm mb-4 sm:mb-6">Agent Readability Score</h2>
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, type: "spring" }}
                className={`text-[6rem] sm:text-[8rem] md:text-[10rem] lg:text-[14rem] font-extrabold leading-none tracking-tighter ${result.agent_readability_score > 70 ? 'bg-gradient-to-br from-green-400 to-emerald-400 text-transparent bg-clip-text' : 'bg-gradient-to-br from-red-400 to-orange-400 text-transparent bg-clip-text'}`}
              >
                {result.agent_readability_score}
              </motion.span>
              <p className="text-sm sm:text-base lg:text-lg text-zinc-200 mt-4 sm:mt-6 lg:mt-8 max-w-2xl text-center font-light leading-relaxed px-4">
                {result.summary}
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <MetricCard
                icon={<ShoppingCart className="w-5 h-5" />}
                label="Product Discovery"
                value={result.product_name || "Not Found"}
                status={result.product_name ? "OPTIMIZED" : "FAIL"}
                isSuccess={!!result.product_name}
              />
              <MetricCard
                icon={<Info className="w-5 h-5" />}
                label="Price Visibility"
                value={result.price ? `${getCurrencySymbol(result.currency)}${result.price}` : "Hidden"}
                status={result.price ? "VISIBLE" : "BLOCKED"}
                isSuccess={!!result.price}
              />
              <MetricCard
                icon={<Shield className="w-5 h-5" />}
                label="Buy Link found"
                value={result.buy_link_found ? "Detected" : "Missing"}
                status={result.buy_link_found ? "ACCESSIBLE" : "MISSING"}
                isSuccess={result.buy_link_found}
              />
            </div>

            {/* Recommendations Section */}
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              {/* What's Working */}
              {(result.product_name || result.price || result.buy_link_found) && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-green-400/5 border border-green-400/20 rounded-2xl p-6 sm:p-8 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-400/15 rounded-lg">
                      <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-green-400">What's Working</h3>
                  </div>
                  <ul className="space-y-3">
                    {result.product_name && (
                      <li className="flex items-start gap-3">
                        <span className="text-green-400 mt-1">✓</span>
                        <span className="text-zinc-200 text-sm sm:text-base">
                          <strong>Product is discoverable:</strong> AI agents can identify "{result.product_name}"
                        </span>
                      </li>
                    )}
                    {result.price && (
                      <li className="flex items-start gap-3">
                        <span className="text-green-400 mt-1">✓</span>
                        <span className="text-zinc-200 text-sm sm:text-base">
                          <strong>Price is visible:</strong> Clear pricing at {getCurrencySymbol(result.currency)}{result.price} helps agents make decisions
                        </span>
                      </li>
                    )}
                    {result.buy_link_found && (
                      <li className="flex items-start gap-3">
                        <span className="text-green-400 mt-1">✓</span>
                        <span className="text-zinc-200 text-sm sm:text-base">
                          <strong>Purchase path exists:</strong> Agents can locate the buy button or checkout link
                        </span>
                      </li>
                    )}
                  </ul>
                </motion.div>
              )}

              {/* Next Steps */}
              {(!result.product_name || !result.price || !result.buy_link_found) && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-orange-400/5 border border-orange-400/20 rounded-2xl p-6 sm:p-8 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-orange-400/15 rounded-lg">
                      <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-orange-400">Action Items</h3>
                  </div>
                  <ul className="space-y-4">
                    {!result.product_name && (
                      <li className="flex items-start gap-3">
                        <span className="text-orange-400 mt-1 font-bold">→</span>
                        <div className="text-zinc-200 text-sm sm:text-base">
                          <strong className="block mb-1">Add clear product names:</strong>
                          <span className="text-zinc-400">Use descriptive H1 tags, product titles in meta tags, and structured data (schema.org)</span>
                        </div>
                      </li>
                    )}
                    {!result.price && (
                      <li className="flex items-start gap-3">
                        <span className="text-orange-400 mt-1 font-bold">→</span>
                        <div className="text-zinc-200 text-sm sm:text-base">
                          <strong className="block mb-1">Display pricing prominently:</strong>
                          <span className="text-zinc-400">Add visible price tags, use schema.org/Offer markup, avoid hiding prices behind login</span>
                        </div>
                      </li>
                    )}
                    {!result.buy_link_found && (
                      <li className="flex items-start gap-3">
                        <span className="text-orange-400 mt-1 font-bold">→</span>
                        <div className="text-zinc-200 text-sm sm:text-base">
                          <strong className="block mb-1">Make purchase buttons obvious:</strong>
                          <span className="text-zinc-400">Use clear CTAs like "Add to Cart", "Buy Now", ensure buttons are easily identifiable</span>
                        </div>
                      </li>
                    )}
                  </ul>
                </motion.div>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center items-stretch sm:items-center pb-8 sm:pb-12 lg:pb-20 mt-6 sm:mt-8">
              <Button
                onClick={shareOnX}
                className="w-full sm:w-auto bg-white hover:bg-zinc-100 text-black font-semibold px-8 sm:px-12 h-12 sm:h-14 rounded-xl flex gap-3 items-center justify-center shadow-[0_4px_20px_rgba(255,255,255,0.1)] transition-all hover:shadow-[0_4px_24px_rgba(255,255,255,0.15)]"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                </svg>
                Share Report
              </Button>
              <Button
                variant="outline"
                className="w-full sm:w-auto border-zinc-600 hover:bg-zinc-800/80 hover:border-zinc-500 text-white bg-zinc-900/80 px-8 sm:px-12 h-12 sm:h-14 rounded-xl backdrop-blur-sm transition-all"
                onClick={() => {
                  setResult(null);
                  setUrl('');
                }}
              >
                Scan Another
              </Button>
            </div>
          </motion.div>
        )}

        {error && (
          <div className="max-w-md mx-auto mt-10 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-center">
            {error}
          </div>
        )}
      </div>

      <footer className="fixed bottom-16 left-0 right-0 z-20 py-4 sm:py-6 text-center bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent pointer-events-none">
        <p className="text-zinc-600 text-xs sm:text-sm font-light tracking-wide pointer-events-auto">
          &copy; 2026 AgentReady — Built for the Agentic Age
        </p>
      </footer>

      <NewsTicker />
    </main>
  );
}

function MetricCard({ icon, label, value, status, isSuccess }: any) {
  return (
    <Card className="bg-zinc-900/60 border-zinc-700/50 overflow-hidden hover:border-zinc-600/50 transition-all backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`p-1.5 sm:p-2 rounded-lg ${isSuccess ? 'bg-green-400/15' : 'bg-red-400/15'}`}>
            {React.cloneElement(icon as any, {
              className: `w-4 h-4 sm:w-5 sm:h-5 ${isSuccess ? 'text-green-400' : 'text-red-400'}`
            })}
          </div>
          <span className="text-xs sm:text-sm font-medium text-zinc-200">{label}</span>
        </div>
        <span className={`text-[9px] sm:text-[10px] font-semibold px-2 sm:px-3 py-1 rounded-full ${isSuccess ? 'bg-green-400/15 text-green-300 border border-green-400/30' : 'bg-red-400/15 text-red-300 border border-red-400/30'}`}>
          {status}
        </span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-white break-words">{value}</div>
      </CardContent>
    </Card>
  );
}
