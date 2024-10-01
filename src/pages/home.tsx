import React, { useState, useEffect } from "react";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { Sun, Moon } from 'lucide-react';
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { GenerateMnemonic } from "@/lib/MnemonicProvider";
import { FloatingNavBar } from '@/components/NavBar'
import { Userbalance } from '@/components/UserBalance'
import { SendSol } from "@/components/SendSol";
import { ListOfTokens } from "@/components/CryptoCoins";
import { useWallet } from "@solana/wallet-adapter-react";


type Key = {
    publicKey: string,
    privateKey: string
}

export function Home() {
    const [darkMode, setDarkMode] = useState(false);
    const [keys, setKeys] = useState<Key[]>([]);
    const wallet = useWallet();
    

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
        <div className={`min-h-screen w-full overflow-hidden ${darkMode ? 'dark' : ''}`}>
            <div className="h-full w-full dark:bg-black bg-white dark:bg-grid-small-white/[0.2] bg-grid-small-black/[0.2] relative flex flex-col md:flex-row items-center justify-between p-8">
                {/* Text on the left side */}
                <div className="w-full md:w-1/2 text-left mb-8 md:mb-0">
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
                <div className="w-full md:w-1/2 flex justify-center mb-10 items-center">
                    <BackgroundGradient className="w-[375px] h-[600px] overflow-hidden rounded-[22px] bg-white dark:bg-stone-700 shadow-lg">
                        <div className="h-full flex flex-col p-4">
                            <div className="flex items-center justify-center w-full bg-slate-400 min-h-10 rounded-lg">
                            Account: {wallet.publicKey ? wallet.publicKey.toBase58() : "Not connected"}
                            </div>
                            <div className="w-full flex items-center justify-center h-20 text-3xl font-medium">
                                <Userbalance />
                            </div>

                            <div className="rounded-xl mb-10 space-x-2 text-white flex items-center justify-center bg-black dark:bg-transparent mt-4 min-h-20  font-bold"
                            >
                                <button className="bg-slate-700 min-h-20 min-w-20 rounded-2xl transition-all hover:scale-105">Recieve</button>
                                <button className="bg-slate-700 min-h-20 min-w-20 rounded-2xl transition-all hover:scale-105">Send</button>
                                <button className="bg-slate-700 min-h-20 min-w-20 rounded-2xl transition-all hover:scale-105">Swap</button>
                                <button className="bg-slate-700 min-h-20 min-w-20 rounded-2xl transition-all hover:scale-105">Buy</button>
                            </div>
                            <div className="mb-4">
                                <ListOfTokens/>
                            </div>
                            <div className="w-full bg-transparent rounded-xl h-auto">
                                <SendSol />
                            </div>
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