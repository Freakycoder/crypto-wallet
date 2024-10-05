const SignMessage = () => {

}

// Basically there are two Signs provided by the useWallet hook, one is the signMessage and     SignTransaction.
//SignMessage is just to sign and verify an arbiratory text or data using the private and public key, whereas SignTransaction is used to actually sign a transaction.

// Key Properties Returned by useWallet():

// publicKey:
// The public key of the connected wallet, represented as a PublicKey object.
// Example: You can display the public key or use it for sending transactions.

// wallet:
// The wallet object itself, which contains additional information about the connected wallet (e.g., the name, icon, and adapter).

// signTransaction:
// A function to sign a Solana transaction using the wallet's private key. This is crucial when submitting signed transactions to the blockchain.

// signAllTransactions:
// Similar to signTransaction, but it allows you to sign an array of transactions in one go. This is useful when multiple transactions need to be executed sequentially.

// signMessage:
// A function to sign an arbitrary message. This is often used for proving ownership of the wallet or validating actions (without broadcasting a transaction).

// sendTransaction:
// A function to send a transaction to the Solana network. This involves signing and sending the transaction to the Solana cluster and awaiting confirmation.

// connected:
// A boolean that indicates whether a wallet is currently connected.

// connecting / disconnecting:
// Boolean values that indicate the current state of the wallet connection process (whether it's currently connecting or disconnecting).

// disconnect:
// A function to disconnect the connected wallet.

// autoApprove:
// A boolean that checks whether the wallet has auto-approve functionality enabled (for auto-signing transactions without prompting the user).