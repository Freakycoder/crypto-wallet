import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { WalletProvider, ConnectionProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

export default function App({ Component, pageProps }: AppProps) {

  <ConnectionProvider endpoint="https://eth-mainnet.g.alchemy.com/v2/IbA-eashNtxQ2fo250TIj5e3-0byxlLf/getNFTs/?owner=vitalik.eth">
    <WalletProvider wallets={[]} >
      <WalletModalProvider>
        
    return <Component {...pageProps} />;

      </WalletModalProvider>
    </WalletProvider>
  </ConnectionProvider>
}
