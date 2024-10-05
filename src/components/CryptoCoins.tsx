import { useWallet, useConnection } from "@solana/wallet-adapter-react"
   import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
   import { useState, useEffect } from "react";
   import { Metaplex, PublicKey, Nft, Sft, NftWithToken, SftWithToken } from '@metaplex-foundation/js';

   interface TokenDetails {
       mintAddress: string;
       balance: number;
       name?: string;
       symbol?: string;
       imageLink?: string;
   }

   export const ListOfTokens = () => {
       const { connection } = useConnection();
       const wallet = useWallet();
       const metaplex = Metaplex.make(connection);
       const [tokenListDetails, setTokenListDetails] = useState<TokenDetails[]>([]);

       const getTokensList = async () => {
           if (!wallet.publicKey) {
               alert("Wallet not connected");
               return;
           }

           try {
               const tokenList = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, { programId: TOKEN_PROGRAM_ID });
               const tokenDetails = tokenList.value.map((element) => {
                   const info = element.account.data.parsed.info;
                   return {
                       mintAddress: info.mint,
                       balance: info.tokenAmount.uiAmount
                   };
               });
               setTokenListDetails(tokenDetails);
           } catch (error) {
               alert("Failed to fetch token data:");
           }
       };

       const fetchTokenMetadata = async () => {
           if (tokenListDetails.length === 0) return;

           const updatedTokenDetails = await Promise.all(tokenListDetails.map(async (token) => {
               const mintPublicKey = new PublicKey(token.mintAddress);
               try {
                   const metadata = await metaplex.nfts().findByMint({ mintAddress: mintPublicKey });
                   return {
                       ...token,
                       name: (metadata as Nft | Sft | NftWithToken | SftWithToken).name || "Unknown",
                       symbol: (metadata as Nft | Sft | NftWithToken | SftWithToken).symbol || "Unknown",
                       imageLink: (metadata as Nft | Sft | NftWithToken | SftWithToken).uri || "",
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

           setTokenListDetails(updatedTokenDetails);
       };

       useEffect(() => {
           getTokensList();
       }, [wallet.publicKey]);

       useEffect(() => {
           if (tokenListDetails.length > 0 && !tokenListDetails[0].name) {
               fetchTokenMetadata();
           }
       }, [tokenListDetails]);

       return (
           <div className="flex flex-col items-center space-y-4">
               {tokenListDetails.length > 0 ? (
                   tokenListDetails.map((token) => (
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
                           <div className="flex items-center space-x-4">Tokens not available</div>
                       </div>
                       <div className="w-full min-h-20 rounded-2xl bg-slate-600 mb-4 p-4">
                           <div className="flex items-center space-x-4">tokens not available</div>
                       </div>
                   </div>
               )}
           </div>
       );
   }