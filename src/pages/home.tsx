"use client";
import React from "react";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { IconAppWindow } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { Sun, Moon } from 'lucide-react';
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { GenerateMnemonic } from "@/lib/MnemonicProvider";
import {
    TextRevealCard,
    TextRevealCardDescription,
    TextRevealCardTitle,
} from "@/components/ui/text-reveal-card";
import { Badge } from "@/components/ui/badge"



type key = {
    publicKey: string,
    privateKey: string
}

export function Home() {
    const [darkMode, setDarkMode] = useState(false);
    const [Keys, setKeys] = useState<key[]>([]);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);


    const words1 = [
        { text: "Create" },
        { text: "Your" },
        { text: "Own" },
    ];
    const words2 = [
        { text: "Web3", className: "text-blue-500 dark:text-blue-500" },
        { text: "Wallet.", className: "text-blue-500 dark:text-blue-500" },
    ]

    return (
        <div className={`h-screen w-screen overflow-hidden ${darkMode ? 'dark' : ''}`}>
            <div className="h-full w-full dark:bg-black bg-white dark:bg-grid-small-white/[0.2] bg-grid-small-black/[0.2] relative flex items-center justify-between p-8">
                {/* Text on the left side */}
                <div className="w-1/2 text-left over">
                    <h1 className="text-4xl sm:text-6xl text-black dark:text-white mb-6">
                        <TypewriterEffectSmooth words={words1} />
                        <TypewriterEffectSmooth words={words2} />
                    </h1>
                    <p className="text-base sm:text-xl text-neutral-600 dark:text-neutral-400">
                        The Air Jordan 4 Retro Reimagined Bred will release on Saturday,
                        February 17, 2024. Your best opportunity to get these right now is by
                        entering raffles and waiting for the official releases.
                    </p>
                </div>

                {/* Card on the right side */}
                <div className="relative w-full sm:w-1/2 flex justify-center items-center mt-8 mb-8 sm:mt-10 p-10">
                    <BackgroundGradient className="overflow-y-hidden flex flex-col gap-y-2 rounded-[22px] h-[calc(100vh-3rem)] max-w-sm p-4 sm:p-10 bg-white dark:bg-zinc-900 relative z-10">
                        <button onClick={() => {
                            const resp = GenerateMnemonic();
                            const publicKey = resp.publicKey;
                            const privateKey = resp.privateKey;
                            let newKey: key = { publicKey, privateKey };
                            setKeys(prevKeys => [...prevKeys, newKey]); // Append the new key to the existing array
                        }}
                            className="rounded-full p-4 text-white flex items-center space-x-1 bg-black mt-4 text-xs font-bold dark:bg-green-600">
                            create new wallet
                        </button>

                        <div className="flex  bg-[#0E0E10] rounded-2xl w-full h-full">
                            <Badge className="rounded-lg" variant="secondary">Secondary</Badge>
                        </div>
                    </BackgroundGradient>
                </div>

                {/* Dark mode toggle with icon */}
                <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                    {darkMode ? <Sun size={24} /> : <Moon size={24} />}
                </button>
            </div>
        </div>
    );
}


export default Home;