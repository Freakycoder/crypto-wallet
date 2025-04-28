import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { createAssociatedTokenAccountInstruction, createInitializeMetadataPointerInstruction, createInitializeMintInstruction, createMintToInstruction, ExtensionType, getAssociatedTokenAddressSync, getMintLen, LENGTH_SIZE, TOKEN_2022_PROGRAM_ID, TYPE_SIZE } from '@solana/spl-token';
import { Metaplex } from "@metaplex-foundation/js";
import { Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { createInitializeInstruction, pack } from '@solana/spl-token-metadata';
import { ChevronLeft, AlertCircle, Check, Loader2, Info } from "lucide-react";

export const CreateMint = ({ onBack }: { onBack?: () => void }) => {
    const { connection } = useConnection();
    const wallet = useWallet();

    const [name, setName] = useState<string>("");
    const [symbol, setSymbol] = useState<string>("");
    const [uri, setUri] = useState<string>("");
    const [initialSupply, setInitialSupply] = useState<string>("1000000000");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [step, setStep] = useState<number>(1);
    const [mintAddress, setMintAddress] = useState<string | null>(null);
    
    const steps = [
        "Token Details",
        "Supply & Image",
        "Review & Submit"
    ];

    // Validate current step
    const validateCurrentStep = () => {
        setError(null);
        
        if (step === 1) {
            if (!name.trim()) return "Token name is required";
            if (!symbol.trim()) return "Token symbol is required";
        } else if (step === 2) {
            if (!uri.trim()) return "Token image URL is required";
            if (!initialSupply || parseFloat(initialSupply) <= 0) return "Initial supply must be greater than 0";
        }
        
        return null;
    };

    // Go to next step
    const nextStep = () => {
        const validationError = validateCurrentStep();
        if (validationError) {
            setError(validationError);
            return;
        }
        setStep(prev => prev < 3 ? prev + 1 : prev);
    };

    // Go to previous step
    const prevStep = () => {
        setStep(prev => prev > 1 ? prev - 1 : prev);
        setError(null);
    };

    const createTokenWithMetadata = async () => {
        if (!wallet.publicKey) {
            setError("Please connect your wallet first");
            return;
        }

        const validationError = validateCurrentStep();
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const mintKeypair = Keypair.generate();
            const metadata = {
                mint: mintKeypair.publicKey,
                name: name,
                symbol: symbol,
                uri: uri,
                additionalMetadata: []
            };
            
            const mintLength = getMintLen([ExtensionType.MetadataPointer]);
            const metadataLength = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
            const lamports = await connection.getMinimumBalanceForRentExemption(mintLength + metadataLength);

            // Step 1: Create the mint account
            const transaction = new Transaction().add(
                SystemProgram.createAccount({
                    fromPubkey: wallet.publicKey,
                    newAccountPubkey: mintKeypair.publicKey,
                    space: mintLength,
                    lamports,
                    programId: TOKEN_2022_PROGRAM_ID
                }),
                createInitializeMintInstruction(mintKeypair.publicKey, 9, wallet.publicKey, null, TOKEN_2022_PROGRAM_ID),
                createInitializeInstruction({
                    programId: TOKEN_2022_PROGRAM_ID,
                    metadata: mintKeypair.publicKey,
                    updateAuthority: wallet.publicKey,
                    mint: mintKeypair.publicKey,
                    mintAuthority: wallet.publicKey,
                    name: metadata.name,
                    symbol: metadata.symbol,
                    uri: metadata.uri,
                }),
                createInitializeMetadataPointerInstruction(mintKeypair.publicKey, wallet.publicKey, mintKeypair.publicKey, TOKEN_2022_PROGRAM_ID)
            );

            transaction.feePayer = wallet.publicKey;
            transaction.recentBlockhash = (await (connection.getLatestBlockhash())).blockhash;
            transaction.partialSign(mintKeypair);

            const signature1 = await wallet.sendTransaction(transaction, connection);
            await connection.confirmTransaction(signature1);
            
            // Step 2: Create associated token account
            const associatedTokenAccount = getAssociatedTokenAddressSync(
                mintKeypair.publicKey,
                wallet.publicKey,
                true,
                TOKEN_2022_PROGRAM_ID,
            );

            const transaction2 = new Transaction().add(
                createAssociatedTokenAccountInstruction(
                    wallet.publicKey,
                    associatedTokenAccount,
                    wallet.publicKey,
                    mintKeypair.publicKey,
                    TOKEN_2022_PROGRAM_ID,
                )
            );

            const signature2 = await wallet.sendTransaction(transaction2, connection);
            await connection.confirmTransaction(signature2);
            
            // Step 3: Mint tokens to the associated token account
            const supply = parseFloat(initialSupply) * 1_000_000_000; // Adjust for decimals
            const transaction3 = new Transaction().add(
                createMintToInstruction(
                    mintKeypair.publicKey,
                    associatedTokenAccount,
                    wallet.publicKey,
                    supply,
                    [],
                    TOKEN_2022_PROGRAM_ID
                )
            );

            const signature3 = await wallet.sendTransaction(transaction3, connection);
            await connection.confirmTransaction(signature3);

            // Save the mint address for reference
            setMintAddress(mintKeypair.publicKey.toBase58());
            setSuccess(`Successfully created token ${name} (${symbol})!`);
            
        } catch (err) {
            console.error("Error creating token:", err);
            setError("Failed to create token. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center mb-6">
                {onBack && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onBack}
                        className="mr-3 p-2 rounded-full dark:bg-gray-700 bg-gray-200 dark:text-gray-300 text-gray-700"
                    >
                        <ChevronLeft size={16} />
                    </motion.button>
                )}
                <h2 className="text-xl font-semibold dark:text-white text-gray-900">Create New Token</h2>
            </div>
            
            {/* Progress Steps */}
            <div className="w-full flex justify-between mb-8 relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 dark:bg-gray-700 bg-gray-300 -translate-y-1/2 z-0"></div>
                {steps.map((stepName, index) => (
                    <div key={index} className="z-10 flex flex-col items-center">
                        <motion.div 
                            initial={false}
                            animate={{ 
                                backgroundColor: step > index ? "#6366f1" : step === index + 1 ? "#6366f1" : "#1f2937",
                                scale: step === index + 1 ? 1.1 : 1
                            }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center dark:text-white text-white mb-2 ${
                                step > index 
                                    ? 'dark:bg-indigo-600 bg-indigo-600' 
                                    : step === index + 1 
                                        ? 'dark:bg-indigo-600 bg-indigo-600' 
                                        : 'dark:bg-gray-700 bg-gray-300'
                            }`}
                        >
                            {step > index + 1 ? (
                                <Check size={14} />
                            ) : (
                                <span className="text-xs">{index + 1}</span>
                            )}
                        </motion.div>
                        <span className="text-xs dark:text-gray-400 text-gray-500">{stepName}</span>
                    </div>
                ))}
            </div>

            {/* Form Steps */}
            <div className="flex-1 overflow-auto">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">Token Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., My Awesome Token"
                                    className="w-full p-3 dark:bg-gray-700 bg-gray-100 dark:text-white text-gray-900 rounded-lg dark:border-gray-600 border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                <p className="mt-1 text-xs dark:text-gray-400 text-gray-500">The full name of your token</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">Token Symbol</label>
                                <input
                                    type="text"
                                    value={symbol}
                                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                                    placeholder="e.g., AWSM"
                                    className="w-full p-3 dark:bg-gray-700 bg-gray-100 dark:text-white text-gray-900 rounded-lg dark:border-gray-600 border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    maxLength={5}
                                />
                                <p className="mt-1 text-xs dark:text-gray-400 text-gray-500">Short abbreviation (2-5 characters)</p>
                            </div>
                        </motion.div>
                    )}
                    
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">Token Image URL</label>
                                <input
                                    type="text"
                                    value={uri}
                                    onChange={(e) => setUri(e.target.value)}
                                    placeholder="https://example.com/my-token-image.png"
                                    className="w-full p-3 dark:bg-gray-700 bg-gray-100 dark:text-white text-gray-900 rounded-lg dark:border-gray-600 border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                <p className="mt-1 text-xs dark:text-gray-400 text-gray-500">URL to your token's image or metadata</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">Initial Supply</label>
                                <input
                                    type="text"
                                    value={initialSupply}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^0-9.]/g, '');
                                        setInitialSupply(value);
                                    }}
                                    placeholder="1000000000"
                                    className="w-full p-3 dark:bg-gray-700 bg-gray-100 dark:text-white text-gray-900 rounded-lg dark:border-gray-600 border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                <p className="mt-1 text-xs dark:text-gray-400 text-gray-500">Number of tokens to create initially</p>
                            </div>
                        </motion.div>
                    )}
                    
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            <div className="dark:bg-gray-700/50 bg-gray-100 rounded-lg p-4">
                                <h3 className="text-lg font-medium dark:text-white text-gray-900 mb-4">Review Token Details</h3>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm dark:text-gray-400 text-gray-500">Token Name</p>
                                        <p className="dark:text-white text-gray-900 font-medium">{name || "-"}</p>
                                    </div>
                                    
                                    <div>
                                        <p className="text-sm dark:text-gray-400 text-gray-500">Token Symbol</p>
                                        <p className="dark:text-white text-gray-900 font-medium">{symbol || "-"}</p>
                                    </div>
                                    
                                    <div>
                                        <p className="text-sm dark:text-gray-400 text-gray-500">Initial Supply</p>
                                        <p className="dark:text-white text-gray-900 font-medium">{initialSupply || "-"}</p>
                                    </div>
                                    
                                    <div>
                                        <p className="text-sm dark:text-gray-400 text-gray-500">Image URL</p>
                                        <p className="dark:text-white text-gray-900 font-medium truncate">{uri || "-"}</p>
                                    </div>
                                </div>
                                
                                <div className="mt-4 flex items-center">
                                    {uri && (
                                        <div className="w-16 h-16 dark:bg-gray-800 bg-white rounded-lg overflow-hidden mr-4 flex items-center justify-center">
                                            <img 
                                                src={uri} 
                                                alt="Token" 
                                                className="max-w-full max-h-full object-contain"
                                                onError={(e) => {
                                                    e.currentTarget.src = "/api/placeholder/64/64";
                                                }}
                                            />
                                        </div>
                                    )}
                                    
                                    <div className="flex-1">
                                        <p className="text-sm dark:text-gray-300 text-gray-700">You're about to create a new SPL token on the Solana blockchain. This action cannot be undone.</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="dark:bg-amber-900/20 bg-amber-50 border dark:border-amber-500/20 border-amber-200 rounded-lg p-3 flex items-start">
                                <Info size={16} className="mr-2 mt-0.5 flex-shrink-0 dark:text-amber-400 text-amber-600" />
                                <p className="text-sm dark:text-amber-400 text-amber-700">
                                    Creating a token requires SOL to pay for transaction fees and storage.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            {/* Error and Success Messages */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-4 dark:bg-red-900/20 bg-red-50 border dark:border-red-500/20 border-red-200 rounded-lg p-3 text-sm dark:text-red-400 text-red-600 flex items-start"
                    >
                        <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                    </motion.div>
                )}
                
                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-4 dark:bg-green-900/20 bg-green-50 border dark:border-green-500/20 border-green-200 rounded-lg p-3"
                    >
                        <div className="flex items-start">
                            <Check size={16} className="mr-2 mt-0.5 dark:text-green-400 text-green-600 flex-shrink-0" />
                            <div>
                                <p className="text-sm dark:text-green-400 text-green-600">{success}</p>
                                {mintAddress && (
                                    <p className="text-xs dark:text-gray-400 text-gray-500 mt-1">
                                        Token address: {mintAddress}
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Navigation Buttons */}
            <div className="mt-6 flex justify-between">
                {step > 1 ? (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={prevStep}
                        className="px-4 py-2 rounded-lg dark:bg-gray-700 bg-gray-200 dark:text-white text-gray-700 hover:dark:bg-gray-600 hover:bg-gray-300 transition-colors"
                        disabled={isLoading}
                    >
                        Back
                    </motion.button>
                ) : (
                    <div></div>
                )}
                
                {step < 3 ? (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={nextStep}
                        className="px-4 py-2 rounded-lg dark:bg-indigo-600 bg-indigo-600 dark:text-white text-white hover:dark:bg-indigo-700 hover:bg-indigo-700 transition-colors"
                    >
                        Next
                    </motion.button>
                ) : (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={createTokenWithMetadata}
                        className="px-6 py-2 rounded-lg dark:bg-indigo-600 bg-indigo-600 dark:text-white text-white hover:dark:bg-indigo-700 hover:bg-indigo-700 transition-colors flex items-center"
                        disabled={isLoading || !!success}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={16} className="mr-2 animate-spin" />
                                Creating...
                            </>
                        ) : success ? (
                            <>
                                <Check size={16} className="mr-2" />
                                Created
                            </>
                        ) : (
                            "Create Token"
                        )}
                    </motion.button>
                )}
            </div>
        </div>
    );
};