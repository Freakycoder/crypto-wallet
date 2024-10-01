import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { useState, useEffect } from "react";
import { Metaplex, PublicKey } from '@metaplex-foundation/js';

interface Details {
    mintAddress: string,
    balance: number,
    name?: string,
    symbol?: string,
    imageLink?: string
}

export const ListOfTokens = () => {

    const { connection } = useConnection();
    const wallet = useWallet();
    const metaplex = Metaplex.make(connection);
    const [Tokenlistdetails, setTokenlistdetails] = useState<Details[]>();

    const getTokensList = async () => {

        try {

            if (!wallet.publicKey) {
                alert("please connect your wallet")
            }

            if (wallet.publicKey) {
                const tokenlist = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, { programId: TOKEN_PROGRAM_ID })
                const tokenlistdetails = tokenlist.value.map((element) => {
                    const info = element.account.data.parsed.info
                    return {
                        mintAddress: info.mint,
                        balance: info.tokenAmount.uiAmount
                    }
                })
                setTokenlistdetails(tokenlistdetails);
            }
        }
        catch (error) {
            alert("fetching token data failed...")
        }
    }

    const fetchTokenMetadata = async () => {

        if (Tokenlistdetails) {
            const tokenMetadata = await Promise.all(Tokenlistdetails.map(async (token) => {
                const mintPublicKey = new PublicKey(token.mintAddress);
                try {
                    const metadata = await metaplex.nfts().findByMint({ mintAddress: mintPublicKey });
                    return {
                        ...token, // Spread the existing token details
                        name: metadata?.name || "Unknown", // Default value if name is not available
                        symbol: metadata?.symbol || "Unknown", // Default value if symbol is not available
                        imageLink: metadata?.uri || "", // Default value if uri is not available
                    };
                } catch (error) {
                    alert(`Failed to fetch metadata for token ${token.mintAddress}`);
                    return {
                        ...token,
                        name: "Unknown",
                        symbol: "Unknown",
                        imageLink: "",
                    };
                }
            }));

            setTokenlistdetails(tokenMetadata);
        }
    }

    useEffect(() => {
        getTokensList();

        if (Tokenlistdetails && Tokenlistdetails.length > 0 && !Tokenlistdetails[0].name) {
            fetchTokenMetadata();
        }

    }, [wallet.publicKey, Tokenlistdetails]);

    return (
        <div className="flex flex-col items-center space-y-4">
            {Tokenlistdetails && Tokenlistdetails.length > 0 ? (
                Tokenlistdetails.map((token) => (
                    <div key={token.mintAddress} className="flex flex-col bg-transparent rounded-xl max-w-md w-full">
                        <div id={token.name} className="w-full min-h-20 rounded-2xl bg-slate-600 mb-4 p-4">
                            <div className="flex items-center space-x-4">
                                <img src={token.imageLink || "/api/placeholder/64/64"} alt={token.name} className="w-16 h-16 rounded-full" />
                                <div>
                                    <h2 className="text-xl font-bold">{token.name}</h2>
                                    <p className="text-sm">{token.symbol}</p>
                                </div>
                            </div>
                            <p className="mt-2">Balance: {token.balance}</p>
                        </div>
                    </div>
                ))
            ) : (
                <div className="flex flex-col bg-transparent rounded-xl max-w-md w-full">
                    <div className="w-full min-h-20 rounded-2xl bg-slate-600 mb-4 p-4">
                        <div className="flex items-center space-x-4">

                        </div>

                    </div>
                    <div className="w-full min-h-20 rounded-2xl bg-slate-600 mb-4 p-4">
                        <div className="flex items-center space-x-4">

                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}