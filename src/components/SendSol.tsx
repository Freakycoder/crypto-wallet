import { useConnection, useWallet, Wallet } from "@solana/wallet-adapter-react"
import { Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { useState } from "react";

export const SendSol = () => {

    const [Toaddress, setToaddress] = useState<string>('');
    const [Amount, setAmount] = useState<number>(0);

    const { connection } = useConnection();
    const wallet = useWallet();

    async function createTransaction() {

        try {

            if (!wallet.publicKey) {
                throw new Error('Wallet not connected');
            }

            if (!Toaddress || !PublicKey.isOnCurve(Toaddress)) {
                throw new Error('Invalid recipient address');
            }

            if (Amount <= 0) {
                throw new Error('Invalid amount');
            }

            const publickey = new PublicKey(Toaddress);
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: wallet.publicKey,
                    toPubkey: publickey,
                    lamports: LAMPORTS_PER_SOL * Amount,
                })
            );

            const signature = await wallet.sendTransaction(transaction, connection)
            const latestBlockhash = await connection.getLatestBlockhash();

            const confirmation = await connection.confirmTransaction({
                signature,
                blockhash: latestBlockhash.blockhash,
                lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
            });

            alert(`transfer succesfull to ${Toaddress}`)
        }
        catch (error) {
            alert("transaction failed")
        }
    }
    return <div className="flex flex-col">
        <div>
        <label className="text-xl"> Recipient address </label><br></br>
        <input onChange={(e)=>{
            setToaddress(e.target.value);
        }} className="text-slate-500 w-full rounded-lg" type="text" placeholder="over here"></input>

        </div>
        <div>

        <label className="text-xl"> Amount </label><br></br>
        <input onChange={(e)=>{
            setAmount(parseFloat(e.target.value))
        }} className="text-slate-500 w-full rounded-lg mb-4" type="text" placeholder="0 Sol"></input>
        </div>
        <button className="border-black min-w-10 bg-red-800 rounded-xl min-h-10" onClick={createTransaction}>Send SOL</button>
    </div>
}