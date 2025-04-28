import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Search, RefreshCw, Send, ArrowDown, Wallet, ChevronDown, ExternalLink, Copy, BarChart2, Layers, PlusCircle, Settings, Check } from "lucide-react";
import { UserBalance } from "@/components/UserBalance";

// Mock data for demonstration
const recentActivity = [
  { type: 'sent', amount: '-0.1', dollarAmount: '$15.00', time: '2 hours ago' },
  { type: 'received', amount: '+0.25', dollarAmount: '$37.50', time: '2 hours ago' },
  { type: 'sent', amount: '-0.1', dollarAmount: '$15.00', time: '3 hours ago' },
];

export default function Dashboard() {
  const [copied, setCopied] = useState(false);
  const displayAddress = "EobAY9...GrgY";
  
  const copyAddress = () => {
    navigator.clipboard.writeText(displayAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen w-full bg-black text-white">
      {/* Main gradient background effect */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(101,39,190,0.15),transparent_50%),radial-gradient(circle_at_left,rgba(10,70,120,0.15),transparent_50%)] pointer-events-none z-0"></div>
      
      {/* Header */}
      <header className="relative z-10 border-b border-gray-800/40 backdrop-blur-md bg-black/50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-purple-600 to-blue-500 rounded-md p-1.5 mr-3">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400">
              Solana Wallet
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="px-3 py-1.5 bg-gray-900/80 rounded-lg text-sm flex items-center gap-2 border border-gray-800">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span>Devnet</span>
              <ChevronDown size={14} className="text-gray-400" />
            </div>
            
            <button className="p-2 bg-gray-900/80 rounded-full border border-gray-800">
              <Sun size={16} className="text-gray-400" />
            </button>
            
            <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-0.5 rounded-lg">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 rounded-md text-sm font-medium">
                <span className="truncate">EobA...GrgY</span>
                <ChevronDown size={14} className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="relative z-10 flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-56px)] border-r border-gray-800/40 bg-black/50 backdrop-blur-md">
          {/* Navigation */}
          <nav className="py-6 px-4">
            <div className="space-y-1">
              <div className="bg-gradient-to-r from-purple-600 to-blue-500 rounded-md p-0.5">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded bg-gray-900 text-white">
                  <BarChart2 size={18} />
                  <span>Dashboard</span>
                </button>
              </div>
              
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-gray-300 hover:bg-gray-800/50">
                <Send size={18} />
                <span>Send</span>
              </button>
              
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-gray-300 hover:bg-gray-800/50">
                <Layers size={18} />
                <span>Tokens</span>
              </button>
              
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-gray-300 hover:bg-gray-800/50">
                <PlusCircle size={18} />
                <span>Create Token</span>
              </button>
            </div>
          </nav>
          
          {/* Wallet Info */}
          <div className="mt-auto p-4 border-t border-gray-800/40">
            <div className="p-3 rounded-lg bg-gray-900/70 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm text-green-400">Connected</span>
                </div>
                <Settings size={14} className="text-gray-400" />
              </div>
              
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-400">Wallet Address</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={copyAddress}
                    className="p-1 rounded hover:bg-gray-800 text-gray-400"
                  >
                    {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                  </button>
                  <a
                    href={`https://explorer.solana.com/address/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded hover:bg-gray-800 text-gray-400"
                  >
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
              
              <div className="bg-gray-800/50 rounded px-3 py-2 mt-2 border border-gray-800/50">
                <p className="text-sm font-mono truncate text-purple-400">
                  {displayAddress}
                </p>
              </div>
              
              <div className="mt-3">
                <div className="text-xs text-gray-400 mb-1">Balance</div>
                <div className="text-lg font-medium bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400">
                  0.0000 SOL
                </div>
              </div>
            </div>
          </div>
        </aside>
        
        {/* Main content area */}
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
              <p className="text-gray-400">Overview of your wallet and assets</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Balance Card */}
              <div className="col-span-1 relative overflow-hidden rounded-xl border border-gray-800/40 bg-gradient-to-br from-gray-900 to-black">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(101,39,190,0.2),transparent_50%)] pointer-events-none"></div>
                <div className="p-6 relative z-10">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">SOL Balance</h3>
                    <div className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded text-xs border border-blue-800/50">
                      Devnet
                    </div>
                  </div>
                  
                  <div className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-purple-300">
                    $ 0.0000 SOL
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:from-purple-700 hover:to-blue-700 transition-all">
                      <Send size={16} />
                      Send
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-800 text-white font-medium hover:bg-gray-700 transition-all border border-gray-700">
                      <ArrowDown size={16} />
                      Receive
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Recent Activity */}
              <div className="col-span-2 rounded-xl border border-gray-800/40 bg-gradient-to-br from-gray-900 to-black">
                <div className="p-6">
                  <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
                  
                  <div className="space-y-1">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-800/30 transition-colors border border-gray-800/30">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                            activity.type === 'sent' 
                              ? 'bg-red-900/20 text-red-400 border border-red-900/30' 
                              : 'bg-green-900/20 text-green-400 border border-green-900/30'
                          }`}>
                            {activity.type === 'sent' ? (
                              <Send size={16} />
                            ) : (
                              <ArrowDown size={16} />
                            )}
                          </div>
                          <div>
                            <p className="text-sm text-white">{activity.type === 'sent' ? 'Sent SOL' : 'Received SOL'}</p>
                            <p className="text-xs text-gray-400">{activity.time}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm ${
                            activity.type === 'sent' ? 'text-red-400' : 'text-green-400'
                          }`}>
                            {activity.amount} SOL
                          </p>
                          <p className="text-xs text-gray-400">{activity.dollarAmount}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 text-center">
                    <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                      View All Transactions
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Assets Section */}
            <div className="rounded-xl border border-gray-800/40 bg-gradient-to-br from-gray-900 to-black">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium">Your Assets</h3>
                  
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search tokens..."
                        className="w-64 py-2 pl-9 pr-3 bg-gray-800/70 rounded-lg border border-gray-700 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                      />
                      <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    
                    <button className="p-2 bg-gray-800 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-700 transition-colors">
                      <RefreshCw size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full overflow-hidden mr-3 bg-gradient-to-br from-purple-500 to-blue-500 p-0.5">
                        <div className="w-full h-full bg-gray-900 rounded-full flex items-center justify-center">
                          <img
                            src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
                            alt="SOL"
                            className="w-7 h-7"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center">
                          <h3 className="font-medium">Solana</h3>
                          <span className="ml-2 px-1.5 py-0.5 bg-blue-900/30 text-blue-400 rounded text-xs border border-blue-800/50">
                            Native
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">SOL</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-medium">0.000000 SOL</p>
                      <p className="text-xs text-gray-400">$0.00</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-400">No other tokens found in this wallet</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}