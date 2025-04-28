import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Metaplex, PublicKey, Nft, Sft, NftWithToken, SftWithToken } from '@metaplex-foundation/js';
import { Search, RefreshCw, ArrowUpRight, ChevronRight, ExternalLink, Send, ArrowDown, Plus, Filter, ChevronDown, Info, Settings, AlertCircle } from "lucide-react";

interface TokenDetails {
    mintAddress: string;
    balance: number;
    name?: string;
    symbol?: string;
    imageLink?: string;
    value?: number; // Estimated USD value
    change24h?: number; // 24h price change percentage
}

export const TokenList = () => {
    const { connection } = useConnection();
    const wallet = useWallet();
    const metaplex = Metaplex.make(connection);
    const [tokenListDetails, setTokenListDetails] = useState<TokenDetails[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [sortBy, setSortBy] = useState<'balance' | 'name' | 'value'>('balance');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [selectedToken, setSelectedToken] = useState<string | null>(null);
    const [showSortMenu, setShowSortMenu] = useState<boolean>(false);

    // Mock SOL price for demo
    const solPrice = 150;

    const getTokensList = async () => {
        if (!wallet.publicKey) {
            setError("Wallet not connected");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const tokenList = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, { programId: TOKEN_PROGRAM_ID });
            
            // Add SOL to the token list
            const solBalance = await connection.getBalance(wallet.publicKey);
            
            const tokenDetails: TokenDetails[] = tokenList.value.map((element) => {
                const info = element.account.data.parsed.info;
                return {
                    mintAddress: info.mint,
                    balance: info.tokenAmount.uiAmount || 0,
                    name: "Unknown Token",
                    symbol: "???",
                    imageLink: "",
                    value: 0,
                    change24h: 0
                };
            });

            // Add SOL as a token
            tokenDetails.unshift({
                mintAddress: "SOL",
                balance: solBalance / 1_000_000_000,
                name: "Solana",
                symbol: "SOL",
                imageLink: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
                value: (solBalance / 1_000_000_000) * solPrice,
                change24h: 2.5
            });

            setTokenListDetails(tokenDetails);
            
            // Fetch metadata for other tokens
            fetchTokenMetadata(tokenDetails);
        } catch (error) {
            console.error("Failed to fetch token data:", error);
            setError("Failed to fetch tokens. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTokenMetadata = async (details: TokenDetails[]) => {
        if (details.length <= 1) return; // Just SOL, no need to fetch metadata

        try {
            const updatedTokenDetails = await Promise.all(details.map(async (token) => {
                if (token.mintAddress === "SOL") return token; // Skip SOL

                const mintPublicKey = new PublicKey(token.mintAddress);
                try {
                    const metadata = await metaplex.nfts().findByMint({ mintAddress: mintPublicKey });
                    
                    // Assign mock prices for demo
                    let estimatedValue = 0;
                    let priceChange = 0;
                    if (token.balance > 0) {
                        // Random price between $0.01 and $50 per token
                        const tokenPrice = Math.random() * 50 + 0.01;
                        estimatedValue = token.balance * tokenPrice;
                        // Random price change between -10% and +10%
                        priceChange = Math.random() * 20 - 10;
                    }
                    
                    return {
                        ...token,
                        name: (metadata as Nft | Sft | NftWithToken | SftWithToken).name || "Unknown",
                        symbol: (metadata as Nft | Sft | NftWithToken | SftWithToken).symbol || "???",
                        imageLink: (metadata as Nft | Sft | NftWithToken | SftWithToken).json?.image || "",
                        value: estimatedValue,
                        change24h: priceChange
                    };
                } catch (error) {
                    return {
                        ...token,
                        name: token.name || "Unknown Token",
                        symbol: token.symbol || "???",
                        value: 0,
                        change24h: 0
                    };
                }
            }));

            setTokenListDetails(updatedTokenDetails);
        } catch (error) {
            console.error("Failed to fetch token metadata:", error);
        }
    };

    const refreshTokens = () => {
        setIsRefreshing(true);
        getTokensList().then(() => {
            setTimeout(() => {
                setIsRefreshing(false);
            }, 1000);
        });
    };

    useEffect(() => {
        if (wallet.publicKey) {
            getTokensList();
        } else {
            setTokenListDetails([]);
        }
    }, [wallet.publicKey]);

    // Filtering and sorting logic
    const filteredTokens = tokenListDetails.filter(token => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            token.name?.toLowerCase().includes(query) ||
            token.symbol?.toLowerCase().includes(query) ||
            token.mintAddress.toLowerCase().includes(query)
        );
    });

    const sortedTokens = [...filteredTokens].sort((a, b) => {
        if (sortBy === 'balance') {
            return sortDirection === 'asc' ? a.balance - b.balance : b.balance - a.balance;
        } else if (sortBy === 'name') {
            const nameA = a.name?.toLowerCase() || '';
            const nameB = b.name?.toLowerCase() || '';
            return sortDirection === 'asc' 
                ? nameA.localeCompare(nameB)
                : nameB.localeCompare(nameA);
        } else if (sortBy === 'value') {
            const valueA = a.value || 0;
            const valueB = b.value || 0;
            return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
        }
        return 0;
    });

    const toggleSort = (type: 'balance' | 'name' | 'value') => {
        if (sortBy === type) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(type);
            setSortDirection('desc');
        }
        setShowSortMenu(false);
    };

    const getDisplayBalance = (balance: number) => {
        if (balance >= 1_000_000) {
            return `${(balance / 1_000_000).toFixed(2)}M`;
        }
        if (balance >= 1_000) {
            return `${(balance / 1_000).toFixed(2)}K`;
        }
        return balance.toFixed(balance < 0.1 ? 6 : balance < 1 ? 4 : 2);
    };

    const handleTokenClick = (mintAddress: string) => {
        setSelectedToken(selectedToken === mintAddress ? null : mintAddress);
    };

    const getTotalPortfolioValue = () => {
        return tokenListDetails.reduce((total, token) => total + (token.value || 0), 0);
    };

    return (
        <div className="rounded-xl overflow-hidden bg-gradient-to-br from-[#1b2133] to-[#0d111c] border border-[#232938]">
            <div className="p-6">
                <div className="flex flex-wrap justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent mb-2">Your Assets</h1>
                        <div className="flex items-center gap-2">
                            <p className="text-[#8b929e]">Total Portfolio Value:</p>
                            <span className="text-[#14F195] font-medium">${getTotalPortfolioValue().toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-4 sm:mt-0">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search tokens..."
                                className="w-full md:w-64 py-2 pl-9 pr-3 bg-[#0d111c] rounded-lg border border-[#232938] text-sm placeholder-[#8b929e] focus:outline-none focus:border-[#9945FF] focus:ring-1 focus:ring-[#9945FF]"
                            />
                            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8b929e]" />
                        </div>
                        
                        <div className="relative">
                            <button 
                                onClick={() => setShowSortMenu(!showSortMenu)}
                                className="flex items-center gap-1 p-2 bg-[#0d111c] rounded-lg border border-[#232938] text-[#8b929e] hover:text-white transition-colors"
                            >
                                <Filter size={16} />
                                <span className="hidden sm:inline text-sm">Sort</span>
                                <ChevronDown size={14} />
                            </button>
                            
                            {showSortMenu && (
                                <div className="absolute right-0 top-full mt-2 z-10 w-48 bg-[#0d111c] rounded-lg border border-[#232938] shadow-xl p-2">
                                    <div className="text-xs text-[#8b929e] px-3 py-2 border-b border-[#232938]">Sort by:</div>
                                    <button 
                                        onClick={() => toggleSort('balance')}
                                        className="flex items-center justify-between w-full px-3 py-2 text-sm text-white hover:bg-[#1b2133] rounded-lg transition-colors"
                                    >
                                        <span>Balance</span>
                                        {sortBy === 'balance' && (
                                            <ChevronDown className={`h-4 w-4 text-[#9945FF] transform ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                                        )}
                                    </button>
                                    <button 
                                        onClick={() => toggleSort('name')}
                                        className="flex items-center justify-between w-full px-3 py-2 text-sm text-white hover:bg-[#1b2133] rounded-lg transition-colors"
                                    >
                                        <span>Name</span>
                                        {sortBy === 'name' && (
                                            <ChevronDown className={`h-4 w-4 text-[#9945FF] transform ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                                        )}
                                    </button>
                                    <button 
                                        onClick={() => toggleSort('value')}
                                        className="flex items-center justify-between w-full px-3 py-2 text-sm text-white hover:bg-[#1b2133] rounded-lg transition-colors"
                                    >
                                        <span>Value</span>
                                        {sortBy === 'value' && (
                                            <ChevronDown className={`h-4 w-4 text-[#9945FF] transform ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        <button
                            onClick={refreshTokens}
                            disabled={isRefreshing || isLoading}
                            className={`p-2 bg-[#0d111c] rounded-lg border border-[#232938] text-[#8b929e] hover:text-white transition-colors ${isRefreshing || isLoading ? 'cursor-not-allowed' : ''}`}
                        >
                            <motion.div
                                animate={{ rotate: isRefreshing ? 360 : 0 }}
                                transition={{ duration: 1, ease: "linear", repeat: isRefreshing ? Infinity : 0 }}
                            >
                                <RefreshCw size={16} />
                            </motion.div>
                        </button>
                    </div>
                </div>

                {/* Token list display */}
                <div className="overflow-hidden rounded-xl border border-[#232938]">
                    <div className="bg-[#0d111c]">
                        <div className="py-3 px-4 text-[#8b929e] text-sm grid grid-cols-12 border-b border-[#232938]">
                            <div className="col-span-6">Asset</div>
                            <div className="col-span-3 text-right">Balance</div>
                            <div className="col-span-3 text-right">Value</div>
                        </div>
                        
                        <AnimatePresence initial={false}>
                            {isLoading ? (
                                <div className="py-16 flex flex-col items-center justify-center">
                                    <motion.div 
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
                                        className="mb-3"
                                    >
                                        <RefreshCw size={24} className="text-[#9945FF]" />
                                    </motion.div>
                                    <p className="text-sm text-[#8b929e]">Loading tokens...</p>
                                </div>
                            ) : error ? (
                                <div className="py-12 text-center p-4">
                                    <AlertCircle size={32} className="mx-auto mb-4 text-[#FF5E6D]" />
                                    <p className="text-sm text-[#FF5E6D]">{error}</p>
                                    <button
                                        onClick={refreshTokens}
                                        className="mt-4 px-4 py-2 bg-[#1b2133] text-white rounded-lg text-sm hover:bg-[#232938] transition-colors"
                                    >
                                        Retry
                                    </button>
                                </div>
                            ) : sortedTokens.length === 0 ? (
                                <div className="py-12 text-center p-4">
                                    <Info size={32} className="mx-auto mb-4 text-[#8b929e]" />
                                    <p className="text-sm text-[#8b929e]">
                                        {searchQuery ? "No tokens match your search" : "No tokens found in this wallet"}
                                    </p>
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="mt-4 px-4 py-2 bg-[#1b2133] text-white rounded-lg text-sm hover:bg-[#232938] transition-colors"
                                        >
                                            Clear Search
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="max-h-[400px] overflow-y-auto">
                                    {sortedTokens.map((token, index) => (
                                        <motion.div
                                            key={token.mintAddress}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05, duration: 0.2 }}
                                            className="border-b border-[#232938] last:border-b-0"
                                        >
                                            <div 
                                                onClick={() => handleTokenClick(token.mintAddress)}
                                                className="py-4 px-4 grid grid-cols-12 items-center cursor-pointer hover:bg-[#1b2133]/30 transition-colors"
                                            >
                                                <div className="col-span-6 flex items-center">
                                                    <div className="w-10 h-10 rounded-full overflow-hidden mr-3 bg-gradient-to-br from-[#9945FF] to-[#14F195] p-0.5">
                                                        <div className="w-full h-full bg-[#0d111c] rounded-full flex items-center justify-center">
                                                            {token.imageLink ? (
                                                                <img 
                                                                    src={token.imageLink}
                                                                    alt={token.name || "Token"}
                                                                    className="w-7 h-7 object-cover"
                                                                    onError={(e) => {
                                                                        e.currentTarget.src = "/api/placeholder/64/64";
                                                                    }}
                                                                />
                                                            ) : (
                                                                <span className="text-sm font-bold text-[#8b929e]">
                                                                    {token.symbol?.[0] || '?'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    <div>
                                                        <div className="flex items-center">
                                                            <h3 className="font-medium text-white">{token.name || "Unknown Token"}</h3>
                                                            {token.mintAddress === "SOL" && (
                                                                <span className="ml-2 px-1.5 py-0.5 bg-[#1b2133] text-[#14F195] rounded text-xs border border-[#14F195]/30">
                                                                    Native
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-[#8b929e]">{token.symbol || "???"}</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="col-span-3 text-right">
                                                    <p className="font-medium text-white">{getDisplayBalance(token.balance)}</p>
                                                    <p className="text-xs text-[#8b929e]">{token.symbol || "???"}</p>
                                                </div>
                                                
                                                <div className="col-span-3 text-right">
                                                    <p className="font-medium text-white">${(token.value || 0).toFixed(2)}</p>
                                                    {token.change24h !== undefined && (
                                                        <p className={`text-xs ${token.change24h >= 0 ? 'text-[#14F195]' : 'text-[#FF5E6D]'} flex items-center justify-end`}>
                                                            <span>{token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%</span>
                                                            <ChevronRight className={`h-4 w-4 ml-1 transition-transform ${selectedToken === token.mintAddress ? 'rotate-90' : ''}`} />
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <AnimatePresence>
                                                {selectedToken === token.mintAddress && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="px-4 pb-4 bg-[#0d111c]"
                                                    >
                                                        <div className="border-t border-[#232938] pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-3">
                                                                <div className="flex justify-between text-xs">
                                                                    <span className="text-[#8b929e]">Token Address</span>
                                                                    <span className="text-white font-mono">
                                                                        {token.mintAddress === "SOL" 
                                                                            ? "Native Token" 
                                                                            : `${token.mintAddress.substring(0, 4)}...${token.mintAddress.substring(token.mintAddress.length - 4)}`}
                                                                    </span>
                                                                </div>
                                                                
                                                                {token.value !== undefined && token.value > 0 && (
                                                                    <div className="flex justify-between text-xs">
                                                                        <span className="text-[#8b929e]">Price</span>
                                                                        <span className="text-white">
                                                                            ${(token.value / token.balance).toFixed(6)}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            
                                                            <div className="flex flex-wrap gap-2 justify-end">
                                                                <button className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white text-xs rounded-lg relative group overflow-hidden">
                                                                    <div className="absolute inset-0 bg-[#0d111c] opacity-0 transition-opacity duration-300 group-hover:opacity-90"></div>
                                                                    <Send size={14} className="relative z-10" />
                                                                    <span className="relative z-10">Send</span>
                                                                </button>
                                                                
                                                                <button className="flex items-center gap-1 px-3 py-1.5 bg-[#1b2133] hover:bg-[#232938] text-white text-xs rounded-lg border border-[#232938] transition-colors">
                                                                    <ArrowDown size={14} />
                                                                    <span>Receive</span>
                                                                </button>
                                                                
                                                                <a
                                                                    href={token.mintAddress === "SOL" 
                                                                        ? `https://explorer.solana.com/address/${wallet.publicKey}?cluster=devnet` 
                                                                        : `https://explorer.solana.com/address/${token.mintAddress}?cluster=devnet`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-1 px-3 py-1.5 bg-[#1b2133] hover:bg-[#232938] text-white text-xs rounded-lg border border-[#232938] transition-colors"
                                                                >
                                                                    <ExternalLink size={14} />
                                                                    <span>Explorer</span>
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
                
                {(!isLoading && !error) && (
                    <div className="mt-6 text-center">
                        <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white rounded-lg text-sm font-medium relative group overflow-hidden">
                            <div className="absolute inset-0 bg-[#0d111c] opacity-0 transition-opacity duration-300 group-hover:opacity-90"></div>
                            <Plus size={16} className="mr-2 relative z-10" />
                            <span className="relative z-10">Add Token</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};