import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useState, useEffect } from "react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export const UserBalance = () => {
    const [balance, setBalance] = useState<number | null>(null);
    const { connection } = useConnection();
    const { publicKey } = useWallet();

    useEffect(() => {
        const fetchBalance = async () => {
            if (publicKey) {
                try {
                    const userBalance = await connection.getBalance(publicKey);
                    setBalance(userBalance / LAMPORTS_PER_SOL);
                } catch (error) {
                    alert("Failed to fetch balance:");
                    setBalance(null);
                }
            } else {
                setBalance(null);
            }
        };

        fetchBalance();
        // Set up an interval to refresh the balance periodically
        const intervalId = setInterval(fetchBalance, 30000); // Refresh every 30 seconds

        // Clean up the interval on component unmount
        return () => clearInterval(intervalId);
    }, [connection, publicKey]);

    return (
        <div>
            {balance !== null ? (
                `$ ${balance.toFixed(4)} SOL`
            ) : (
                "Connect your wallet to view balance"
            )}
        </div>
    );
};