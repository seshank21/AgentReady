'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Scan {
  url: string;
  product_name: string | null;
  agent_readability_score: number;
}

export function NewsTicker() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopScans = async () => {
      try {
        const response = await fetch('/api/top-scans');
        const data = await response.json();
        if (data.scans && data.scans.length > 0) {
          // Duplicate the array to create seamless loop
          setScans([...data.scans, ...data.scans]);
        }
      } catch (error) {
        console.error('Failed to fetch top scans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopScans();
    // Refresh every 30 seconds
    const interval = setInterval(fetchTopScans, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || scans.length === 0) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getDomainFromUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain;
    } catch {
      return url;
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-zinc-950/95 border-t border-zinc-800/50 backdrop-blur-md overflow-hidden">
      <div className="flex items-center gap-4 py-3">
        {/* Label */}
        <div className="flex-shrink-0 px-4 sm:px-6">
          <span className="text-xs sm:text-sm font-semibold text-green-400 uppercase tracking-wider">
            🔥 Top 10 Scans
          </span>
        </div>

        {/* Scrolling Content */}
        <div className="flex-1 overflow-hidden relative">
          <div
            className="flex gap-8 whitespace-nowrap animate-marquee pause-on-hover"
          >
            {scans.map((scan, index) => (
              <div
                key={`${scan.url}-${index}`}
                className="flex items-center gap-3 text-sm"
              >
                <span className="text-zinc-400">{(index % 10) + 1}.</span>
                <span className="text-zinc-300 font-medium">
                  {getDomainFromUrl(scan.url)}
                </span>
                <span className="text-zinc-600">:</span>
                <span className={`font-bold ${getScoreColor(scan.agent_readability_score)}`}>
                  {scan.agent_readability_score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
