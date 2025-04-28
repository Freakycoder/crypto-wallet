import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Eye, EyeOff, RefreshCw, Check, Lock, ShieldAlert, Download, AlertCircle } from "lucide-react";
import { GenerateMnemonic } from "@/lib/MnemonicProvider";
import { Keypair } from "@solana/web3.js";
import bs58 from 'bs58';

type Step = 'create' | 'display' | 'verify' | 'secure' | 'complete';

export const WalletGenerator = () => {
    const [step, setStep] = useState<Step>('create');
    const [walletType, setWalletType] = useState<'new' | 'import'>('new');
    const [seedPhrase, setSeedPhrase] = useState<string[]>([]);
    const [privateKey, setPrivateKey] = useState<string>('');
    const [publicKey, setPublicKey] = useState<string>('');
    const [showPrivateKey, setShowPrivateKey] = useState<boolean>(false);
    const [verificationWords, setVerificationWords] = useState<{index: number, word: string}[]>([]);
    const [userVerification, setUserVerification] = useState<string[]>(['', '', '']);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [seedInputs, setSeedInputs] = useState<string[]>(Array(12).fill(''));
    const [copied, setCopied] = useState<{phrase: boolean, privateKey: boolean, publicKey: boolean}>({
        phrase: false,
        privateKey: false,
        publicKey: false
    });
    const [error, setError] = useState<string | null>(null);

    // Generate new wallet
    const generateNewWallet = () => {
        setIsLoading(true);
        setTimeout(() => {
            try {
                const { seedPhrase, privateKey, publicKey } = GenerateMnemonic();
                
                setSeedPhrase(seedPhrase.split(' '));
                setPrivateKey(privateKey);
                setPublicKey(publicKey);
                
                // Select 3 random words for verification
                const indices : any[] = [];
                while (indices.length < 3) {
                    const idx = Math.floor(Math.random() * 12);
                    if (!indices.includes(idx)) {
                        indices.push(idx);
                    }
                }
                
                const verification = indices.map(index => ({
                    index,
                    word: seedPhrase.split(' ')[index]
                }));
                
                setVerificationWords(verification);
                setIsLoading(false);
                setStep('display');
                setError(null);
            } catch (error) {
                console.error("Error generating wallet:", error);
                setError("Failed to generate wallet. Please try again.");
                setIsLoading(false);
            }
        }, 1500);
    };
    
    // Import existing wallet from seed phrase
    const importFromSeed = () => {
        setIsLoading(true);
        setTimeout(() => {
            try {
                const seedPhrase = seedInputs.join(' ').trim();
                
                // Validate the seed phrase (this is a simple check, should be more robust in production)
                if (seedPhrase.split(' ').length !== 12) {
                    throw new Error("Invalid seed phrase. Must be 12 words.");
                }
                
                const { privateKey, publicKey } = GenerateMnemonic();
                
                setSeedPhrase(seedPhrase.split(' '));
                setPrivateKey(privateKey);
                setPublicKey(publicKey);
                
                setIsLoading(false);
                setStep('secure');
                setError(null);
            } catch (error) {
                console.error("Error importing wallet:", error);
                setError("Failed to import wallet. Please check your seed phrase.");
                setIsLoading(false);
            }
        }, 1500);
    };
    
    // Verify user has written down their seed phrase
    const verifySeedPhrase = () => {
        const isCorrect = verificationWords.every((item, index) => 
            item.word.toLowerCase() === userVerification[index].toLowerCase().trim()
        );
        
        if (isCorrect) {
            setStep('secure');
            setError(null);
        } else {
            setError("Words don't match. Please check and try again.");
        }
    };
    
    // Handle seed phrase input change for import
    const handleSeedInputChange = (index: number, value: string) => {
        const newInputs = [...seedInputs];
        newInputs[index] = value;
        setSeedInputs(newInputs);
    };
    
    // Copy to clipboard utility
    const copyToClipboard = (text: string, type: 'phrase' | 'privateKey' | 'publicKey') => {
        navigator.clipboard.writeText(text);
        setCopied({ ...copied, [type]: true });
        setTimeout(() => {
            setCopied({ ...copied, [type]: false });
        }, 2000);
    };
    
    // Export wallet as JSON
    const exportWalletJson = () => {
        const wallet = {
            publicKey,
            privateKey,
            seedPhrase: seedPhrase.join(' ')
        };
        
        const blob = new Blob([JSON.stringify(wallet, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `solana-wallet-${publicKey.substring(0, 8)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="w-full max-w-md mx-auto bg-slate-900 rounded-xl shadow-lg p-6 border border-slate-800">
            <h2 className="text-xl font-semibold text-white mb-4 text-center">Solana Wallet Generator</h2>
            
            <AnimatePresence mode="wait">
                {/* Step 1: Choose Create or Import */}
                {step === 'create' && (
                    <motion.div
                        key="create"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="mb-6">
                            <p className="text-slate-300 text-sm mb-4">
                                Create a new wallet or import an existing one using a seed phrase.
                            </p>
                            
                            <div className="flex bg-slate-800 rounded-lg p-1 mb-6">
                                <button 
                                    onClick={() => setWalletType('new')}
                                    className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${
                                        walletType === 'new' 
                                            ? 'bg-purple-600 text-white' 
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    Create New
                                </button>
                                <button 
                                    onClick={() => setWalletType('import')}
                                    className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${
                                        walletType === 'import' 
                                            ? 'bg-purple-600 text-white' 
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    Import Existing
                                </button>
                            </div>
                            
                            {walletType === 'new' ? (
                                <div className="text-center">
                                    <p className="text-slate-400 text-sm mb-4">
                                        Create a new Solana wallet with a secure seed phrase. 
                                        Make sure to write down your seed phrase and keep it safe.
                                    </p>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={generateNewWallet}
                                        disabled={isLoading}
                                        className={`w-full py-3 rounded-lg flex items-center justify-center ${
                                            isLoading
                                                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                                : 'bg-purple-600 text-white hover:bg-purple-700'
                                        } transition-colors`}
                                    >
                                        {isLoading ? (
                                            <>
                                                <RefreshCw size={18} className="mr-2 animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            "Create Wallet"
                                        )}
                                    </motion.button>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-slate-400 text-sm mb-4">
                                        Enter your 12-word seed phrase to restore your wallet.
                                    </p>
                                    
                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                        {seedInputs.map((word, index) => (
                                            <div key={index} className="relative">
                                                <span className="absolute left-2 top-2 text-xs text-slate-500">{index + 1}.</span>
                                                <input
                                                    type="text"
                                                    value={word}
                                                    onChange={(e) => handleSeedInputChange(index, e.target.value)}
                                                    placeholder={`Word ${index + 1}`}
                                                    className="w-full pl-7 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={importFromSeed}
                                        disabled={isLoading || seedInputs.some(word => !word.trim())}
                                        className={`w-full py-3 rounded-lg flex items-center justify-center ${
                                            isLoading || seedInputs.some(word => !word.trim())
                                                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                                : 'bg-purple-600 text-white hover:bg-purple-700'
                                        } transition-colors`}
                                    >
                                        {isLoading ? (
                                            <>
                                                <RefreshCw size={18} className="mr-2 animate-spin" />
                                                Importing...
                                            </>
                                        ) : (
                                            "Import Wallet"
                                        )}
                                    </motion.button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
                
                {/* Step 2: Display Seed Phrase */}
                {step === 'display' && (
                    <motion.div
                        key="display"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg text-white font-medium">Your Seed Phrase</h3>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => copyToClipboard(seedPhrase.join(' '), 'phrase')}
                                    className="flex items-center gap-1 text-xs px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg"
                                >
                                    {copied.phrase ? (
                                        <>
                                            <Check size={14} className="text-green-400" />
                                            <span className="text-green-400">Copied</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={14} />
                                            <span>Copy</span>
                                        </>
                                    )}
                                </motion.button>
                            </div>
                            
                            <div className="bg-slate-800 p-4 rounded-lg mb-4">
                                <div className="grid grid-cols-3 gap-3">
                                    {seedPhrase.map((word, index) => (
                                        <div key={index} className="flex">
                                            <span className="text-slate-500 w-5 text-right mr-2">{index + 1}.</span>
                                            <span className="text-white font-mono">{word}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="bg-yellow-600/20 border border-yellow-600/30 rounded-lg p-3 mb-6">
                                <div className="flex items-start">
                                    <ShieldAlert size={18} className="text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                                    <p className="text-xs text-yellow-300">
                                        <strong>Important:</strong> Write down these 12 words on paper and keep them in a secure place. 
                                        Anyone with access to this seed phrase will have full control of your wallet.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex justify-between gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setStep('create')}
                                    className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm"
                                >
                                    Back
                                </motion.button>
                                
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setStep('verify')}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex-1"
                                >
                                    I've Written It Down
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
                
                {/* Step 3: Verify Seed Phrase */}
                {step === 'verify' && (
                    <motion.div
                        key="verify"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="mb-6">
                            <h3 className="text-lg text-white font-medium mb-2">Verify Your Seed Phrase</h3>
                            <p className="text-slate-400 text-sm mb-4">
                                Please enter the following words from your seed phrase to confirm you've saved it.
                            </p>
                            
                            <div className="space-y-3 mb-6">
                                {verificationWords.map((item, index) => (
                                    <div key={index} className="flex items-center">
                                        <span className="text-slate-400 w-24">Word #{item.index + 1}</span>
                                        <input
                                            type="text"
                                            value={userVerification[index]}
                                            onChange={(e) => {
                                                const newVerification = [...userVerification];
                                                newVerification[index] = e.target.value;
                                                setUserVerification(newVerification);
                                            }}
                                            placeholder={`Enter word #${item.index + 1}`}
                                            className="flex-1 px-3 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
                                        />
                                    </div>
                                ))}
                            </div>
                            
                            <div className="flex justify-between gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setStep('display')}
                                    className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm"
                                >
                                    Back
                                </motion.button>
                                
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={verifySeedPhrase}
                                    disabled={userVerification.some(word => !word.trim())}
                                    className={`px-4 py-2 rounded-lg transition-colors text-sm flex-1 ${
                                        userVerification.some(word => !word.trim())
                                            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                            : 'bg-purple-600 text-white hover:bg-purple-700'
                                    }`}
                                >
                                    Verify & Continue
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
                
                {/* Step 4: Secure and Display Keys */}
                {step === 'secure' && (
                    <motion.div
                        key="secure"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="mb-6">
                            <h3 className="text-lg text-white font-medium mb-2">Your Wallet Details</h3>
                            <p className="text-slate-400 text-sm mb-4">
                                Your wallet has been created successfully. Here are your wallet details.
                            </p>
                            
                            <div className="space-y-4 mb-6">
                                {/* Public Key */}
                                <div className="bg-slate-800 p-3 rounded-lg">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-slate-400 text-xs">Public Key</span>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => copyToClipboard(publicKey, 'publicKey')}
                                            className="flex items-center gap-1 text-xs px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                                        >
                                            {copied.publicKey ? (
                                                <>
                                                    <Check size={12} className="text-green-400" />
                                                    <span className="text-green-400">Copied</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy size={12} />
                                                    <span>Copy</span>
                                                </>
                                            )}
                                        </motion.button>
                                    </div>
                                    <p className="text-sm text-white font-mono break-all">{publicKey}</p>
                                </div>
                                
                                {/* Private Key */}
                                <div className="bg-slate-800 p-3 rounded-lg">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-slate-400 text-xs flex items-center">
                                            <Lock size={12} className="mr-1" />
                                            Private Key
                                        </span>
                                        <div className="flex gap-1">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setShowPrivateKey(!showPrivateKey)}
                                                className="flex items-center gap-1 text-xs px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                                            >
                                                {showPrivateKey ? (
                                                    <>
                                                        <EyeOff size={12} />
                                                        <span>Hide</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Eye size={12} />
                                                        <span>Show</span>
                                                    </>
                                                )}
                                            </motion.button>
                                            
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => copyToClipboard(privateKey, 'privateKey')}
                                                disabled={!showPrivateKey}
                                                className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg ${
                                                    showPrivateKey 
                                                        ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                                                        : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                                                }`}
                                            >
                                                {copied.privateKey ? (
                                                    <>
                                                        <Check size={12} className="text-green-400" />
                                                        <span className="text-green-400">Copied</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy size={12} />
                                                        <span>Copy</span>
                                                    </>
                                                )}
                                            </motion.button>
                                        </div>
                                    </div>
                                    <p className="text-sm font-mono break-all">
                                        {showPrivateKey ? (
                                            <span className="text-white">{privateKey}</span>
                                        ) : (
                                            <span className="text-slate-500">••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••</span>
                                        )}
                                    </p>
                                </div>
                                
                                {/* Seed Phrase Reminder */}
                                <div className="bg-slate-800 p-3 rounded-lg">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-slate-400 text-xs flex items-center">
                                            <ShieldAlert size={12} className="mr-1" />
                                            Seed Phrase
                                        </span>
                                        <div className="flex gap-1">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => copyToClipboard(seedPhrase.join(' '), 'phrase')}
                                                className="flex items-center gap-1 text-xs px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                                            >
                                                {copied.phrase ? (
                                                    <>
                                                        <Check size={12} className="text-green-400" />
                                                        <span className="text-green-400">Copied</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy size={12} />
                                                        <span>Copy</span>
                                                    </>
                                                )}
                                            </motion.button>
                                        </div>
                                    </div>
                                    <p className="text-sm font-mono text-white break-all">
                                        {seedPhrase.join(' ')}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="bg-red-600/20 border border-red-600/30 rounded-lg p-3 mb-6">
                                <div className="flex items-start">
                                    <ShieldAlert size={18} className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                                    <p className="text-xs text-red-300">
                                        <strong>Warning:</strong> Never share your private key or seed phrase with anyone. 
                                        Store them securely offline. Anyone with this information can access your funds.
                                    </p>
                                </div>
                            </div>
                            
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={exportWalletJson}
                                className="w-full py-3 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-3"
                            >
                                <Download size={16} />
                                Export Wallet Backup
                            </motion.button>
                            
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setStep('complete')}
                                className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                Finish
                            </motion.button>
                        </div>
                    </motion.div>
                )}
                
                {/* Step 5: Complete */}
                {step === 'complete' && (
                    <motion.div
                        key="complete"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="text-center mb-6">
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <Check size={32} className="text-green-500" />
                                </div>
                            </div>
                            
                            <h3 className="text-lg text-white font-medium mb-2">Wallet Setup Complete!</h3>
                            <p className="text-slate-400 text-sm mb-6">
                                Your Solana wallet has been successfully created and is ready to use.
                                Remember to keep your recovery information safe.
                            </p>
                            
                            <div className="bg-slate-800 p-3 rounded-lg mb-6">
                                <p className="text-sm text-white font-mono break-all mb-1">{publicKey}</p>
                                <p className="text-xs text-slate-400">Your wallet address</p>
                            </div>
                            
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => window.location.reload()}
                                className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                Go to Wallet
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400 flex items-start"
                    >
                        <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};