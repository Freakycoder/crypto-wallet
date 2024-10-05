import { useState } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"


const Faucet = () => {
    const [Amount, setAmount] = useState<number>(0)

    function airdrop(){
        const myconnection = useConnection();
        const wallet = useWallet();
        if(wallet.publicKey){
            myconnection.connection.requestAirdrop(wallet.publicKey, Amount * 1000000000);
            alert(`the amount ${Amount} is sent ${wallet.publicKey.toBase58()}`);
        }
        else{
            alert("Please connect your wallet");
        }
    }
    return <div>
        <input type= "number" onChange={(e)=> {
            setAmount(parseFloat(e.target.value));
        }} 
        placeholder="Enter the amount"></input>
        <button onClick={airdrop} >Request</button>
    </div>
}
