import nacl from "tweetnacl";
import { generateMnemonic, mnemonicToSeedSync } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import { useState } from "react";

export const GenerateMnemonic = () => {

    const [seedphrase, setseedphrase] = useState<string[]>([...Array(12).fill('')]);

    const Seedlength = () => {
        let seedlength = seedphrase.length === 12 ? 128 : 256
        return seedlength;
    }
    const seedPhrase = generateMnemonic(Seedlength());
    setseedphrase(seedPhrase.split(' '));
    const rootSeed = mnemonicToSeedSync(seedPhrase); // the root seed generated is in form of a buffer (<buffer ....>)
    let accountCount = 0;
    const Path = `m/44'/501'/${accountCount}'/0'`
    const derivedSeed = derivePath(Path, rootSeed.toString('hex')).key; //derive path returns an object with bunch of properties, the key property has the derived seed in it(private key)
    const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey; // "nacl.sign.keyPair.fromSeed(derivedSeed)" will return an object with public key and private key(secret key), but the secretKey will have both the public and private key together
    const publicPrivatePair = Keypair.fromSecretKey(secret); // this contains an object with public and private key(Secret key) . "Keypair.fromSecretKey(secret)" takes the secret key and makes a public private key pair out of it.
    return publicPrivatePair;
}