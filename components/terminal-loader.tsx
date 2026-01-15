'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LOGS = [
    '> Connecting to Agent Network...',
    '> Fetching HTML source...',
    '> Checking robots.txt for GPTBot...',
    '> Parsing DOM structure...',
    '> Extracting pricing metadata...',
    '> Analyzing Commerce Intent...',
    '> Calculating Agent Readability Score...',
    '> Finalizing Report...',
];

interface TerminalLoaderProps {
    onComplete?: () => void;
}

export function TerminalLoader({ onComplete }: TerminalLoaderProps) {
    const [currentLogs, setCurrentLogs] = useState<string[]>([]);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (index < LOGS.length) {
            const timer = setTimeout(() => {
                setCurrentLogs((prev) => [...prev, LOGS[index]]);
                setIndex((prev) => prev + 1);
            }, Math.random() * 800 + 400); // Random delay between 400ms and 1.2s
            return () => clearTimeout(timer);
        } else if (onComplete) {
            const timer = setTimeout(onComplete, 1000);
            return () => clearTimeout(timer);
        }
    }, [index, onComplete]);

    return (
        <div className="w-full max-w-3xl mx-auto font-mono text-sm bg-zinc-900/40 border border-zinc-800/50 rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl">
            <div className="flex items-center gap-2 px-5 py-3 bg-zinc-900/60 border-b border-zinc-800/50 backdrop-blur-sm">
                <div className="w-3 h-3 rounded-full bg-red-400/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                <div className="w-3 h-3 rounded-full bg-green-400/60" />
                <span className="ml-2 text-zinc-500 text-xs uppercase tracking-[0.2em] font-medium">Agent Scan Terminal</span>
            </div>
            <div className="p-8 space-y-2 h-[320px] overflow-y-auto custom-scrollbar">
                <AnimatePresence initial={false}>
                    {currentLogs.map((log, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-green-400 font-light"
                        >
                            {log}
                        </motion.div>
                    ))}
                </AnimatePresence>
                {index < LOGS.length && (
                    <motion.div
                        animate={{ opacity: [1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="w-2 h-4 bg-green-400 inline-block align-middle ml-1"
                    />
                )}
            </div>
        </div>
    );
}
