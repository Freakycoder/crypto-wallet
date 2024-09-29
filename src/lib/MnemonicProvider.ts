import nacl from "tweetnacl";
import { generateMnemonic, mnemonicToSeedSync } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import { useState } from "react";
import bs58 from 'bs58';

export const GenerateMnemonic = () => {
    // State to hold the seed phrase as an array of words
    const [seedphrase, setseedphrase] = useState<string[]>(Array(12).fill(''));

    // Function to determine seed length based on the seedphrase length
    const Seedlength = () => {
        return seedphrase.length === 12 ? 128 : 256;
    };

    // Generate a new seed phrase
    const seedPhrase = generateMnemonic(Seedlength());
    
    // Update the seedphrase state with the new seed phrase split into an array of words
    setseedphrase(seedPhrase.split(' '));

    // Convert the seed phrase to a root seed buffer
    const rootSeed = mnemonicToSeedSync(seedPhrase); // the root seed generated is in the form of a buffer

    let accountCount = 0; // You can change this to generate multiple accounts
    let Path = `m/44'/501'/${accountCount}'/0'`;

    // Derive the seed from the path
    let derivedSeed = derivePath(Path, rootSeed.toString('hex')).key; // derivePath returns an object with properties, we use the key property for the derived seed

    // Generate the key pair from the derived seed
    let secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey; // secretKey contains both the public and private key together

    // Create a public-private key pair from the secret key
    let publicPrivatePair = Keypair.fromSecretKey(secret); // Keypair object containing public and private keys

    // Convert the public key to Base58 format
    let publicKey = publicPrivatePair.publicKey.toBase58();
    
    // Convert the private key to Base58 format
    let privateKey = bs58.encode(publicPrivatePair.secretKey);

    // Return an object with public key, private key, and seed phrase
    return { publicKey, 
             privateKey, 
             seedPhrase };
};
