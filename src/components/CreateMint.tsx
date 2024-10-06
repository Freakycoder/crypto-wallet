import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { createAssociatedTokenAccountInstruction, createInitializeMetadataPointerInstruction, createInitializeMintInstruction, createMintToInstruction, ExtensionType, getAssociatedTokenAddressSync, getMintLen, LENGTH_SIZE, TOKEN_2022_PROGRAM_ID, TYPE_SIZE } from '@solana/spl-token'
import { Metaplex } from "@metaplex-foundation/js";
import { Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js"
import { useState } from "react";
import { createInitializeInstruction, pack } from '@solana/spl-token-metadata';

export const CreateMint = () => {
    const { connection } = useConnection();
    const wallet = useWallet();

    const createTokenWithMetadata = async () => {

        const [Name, setName] = useState<string>("");
        const [Symbol, setSymbol] = useState<string>("");
        const [Uri, setUri] = useState<string>("");


        const mintKeypair = Keypair.generate();
        const metadata = {
            mint: mintKeypair.publicKey,
            name: Name,
            symbol: Symbol,
            uri: Uri,
            additionalMetadata: []
        };
        const mintLength = getMintLen([ExtensionType.MetadataPointer]);
        const metadataLength = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
        const lamports = await connection.getMinimumBalanceForRentExemption(mintLength + metadataLength);

        if (wallet.publicKey) {

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

            await wallet.sendTransaction(transaction, connection);

            const associatedTokenAccount = getAssociatedTokenAddressSync(
                mintKeypair.publicKey,
                wallet.publicKey,
                true,
                TOKEN_2022_PROGRAM_ID,
            )

            const transaction2 = new Transaction().add(
                createAssociatedTokenAccountInstruction(
                    wallet.publicKey,
                    associatedTokenAccount,
                    wallet.publicKey,
                    mintKeypair.publicKey,
                    TOKEN_2022_PROGRAM_ID,
                )
            );

            await wallet.sendTransaction(transaction2, connection);

            const transaction3 = new Transaction().add(
                createMintToInstruction(
                    mintKeypair.publicKey,
                    associatedTokenAccount,
                    wallet.publicKey,
                    1000000000,
                )
            )

            await wallet.sendTransaction(transaction3, connection);
        }
        else{
            alert("Connect Your wallet");
        }

    }
    return<div style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column'
    }}>
        <h1>Solana Token Launchpad</h1>
        <input className='inputText' type='text' placeholder='Name'></input> <br />
        <input className='inputText' type='text' placeholder='Symbol'></input> <br />
        <input className='inputText' type='text' placeholder='Image URL'></input> <br />
        <input className='inputText' type='text' placeholder='Initial Supply'></input> <br />
        <button onClick={createTokenWithMetadata} className='btn'>Create a token</button>
    </div>
}