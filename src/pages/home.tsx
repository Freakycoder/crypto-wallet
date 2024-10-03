import React, { useState, useEffect, useMemo } from "react";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { Sun, Moon } from 'lucide-react';
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { UserBalance } from '@/components/UserBalance'
import { SendSol } from "@/components/SendSol";
import { ListOfTokens } from "@/components/CryptoCoins";
import { ConnectionProvider, WalletProvider, useWallet } from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";

// Import wallet styles
import "@solana/wallet-adapter-react-ui/styles.css";

type Key = {
    publicKey: string,
    privateKey: string
}

export function Home() {
    const [darkMode, setDarkMode] = useState(false);
    const [keys, setKeys] = useState<Key[]>([]);

    // Set up Solana network and wallet configuration
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);
    const wallets = useMemo(
        () => [new PhantomWalletAdapter(), new SolflareWalletAdapter({ network })],
        [network]
    );

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
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    <div className={`min-h-screen w-full overflow-hidden ${darkMode ? 'dark' : ''}`}>
                        <div className="h-full w-full dark:bg-black bg-white dark:bg-grid-small-white/[0.2] bg-grid-small-black/[0.2] relative flex flex-col md:flex-row items-center justify-between p-8">
                            {/* Text on the left side */}
                            <div className="flex flex-col md:w-1/2 space-y-10">
                                <div className="absolute top-4 left-4">
                                    <WalletMultiButton className="dark:!bg-purple-600 hover:!bg-purple-700" />
                                </div>
                                <div className="w-full text-left mb-8 md:mb-0">
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
                            </div>

                            {/* Card on the right side */}
                            <div className="w-full md:w-1/2 flex justify-center mb-10 items-center">
                                <BackgroundGradient className="w-[375px] h-[600px] overflow-hidden rounded-[22px] bg-[#222528] shadow-lg">
                                    <div className="h-full flex flex-col p-4 text-white">
                                        <WalletInfo />
                                        <div className="w-full flex items-center justify-center h-20 text-3xl font-medium text-white">
                                            <UserBalance />
                                        </div>
                                        <div className="rounded-xl mb-10 space-x-2 flex items-center justify-center mt-4 min-h-20 font-bold">
                                            <button className="bg-[#454a51] min-h-16 min-w-16 rounded-2xl transition-all hover:scale-105 hover:bg-[#5468ff] text-sm">
                                                Receive
                                            </button>
                                            <button className="bg-[#454a51] min-h-16 min-w-16 rounded-2xl transition-all hover:scale-105 hover:bg-[#5468ff] text-sm">
                                                Send
                                            </button>
                                            <button className="bg-[#454a51] min-h-16 min-w-16 rounded-2xl transition-all hover:scale-105 hover:bg-[#5468ff] text-sm">
                                                Swap
                                            </button>
                                            <button className="bg-[#454a51] min-h-16 min-w-16 rounded-2xl transition-all hover:scale-105 hover:bg-[#5468ff] text-sm">
                                                Buy
                                            </button>
                                        </div>
                                        <div className="mb-4 bg-[#2c2f33] rounded-xl p-4">
                                            <ListOfTokens />
                                        </div>
                                        <div className="w-full bg-[#2c2f33] rounded-xl h-auto p-4">
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
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}

// Separate component for wallet info to use useWallet hook
function WalletInfo() {
    const wallet = useWallet();
    return (
        <div className="flex items-center justify-center w-full bg-slate-400 min-h-10 rounded-lg">
            Account: {wallet.publicKey ? wallet.publicKey.toBase58() : "Not connected"}
        </div>
    );
}

export default Home;