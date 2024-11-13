import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { PlusCircle, MinusCircle, Wallet as WalletIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface WalletData {
  balance: number;
  transactions: {
    id: string;
    amount: number;
    type: 'deposit' | 'withdrawal';
    date: string;
    description: string;
  }[];
}

export function Wallet() {
  const [walletData, setWalletData] = useState<WalletData>({ balance: 0, transactions: [] });
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const unsubscribe = onSnapshot(
      doc(db, 'wallets', auth.currentUser.uid),
      (doc) => {
        if (doc.exists()) {
          setWalletData(doc.data() as WalletData);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleTransaction = async (type: 'deposit' | 'withdrawal') => {
    if (!auth.currentUser || !amount || parseFloat(amount) <= 0) return;

    const walletRef = doc(db, 'wallets', auth.currentUser.uid);
    const walletSnap = await getDoc(walletRef);
    const currentData = walletSnap.exists() ? walletSnap.data() as WalletData : { balance: 0, transactions: [] };

    if (type === 'withdrawal' && currentData.balance < parseFloat(amount)) {
      alert('Insufficient funds!');
      return;
    }

    const newTransaction = {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      type,
      date: new Date().toISOString(),
      description: description || `${type === 'deposit' ? 'Added' : 'Withdrawn'} funds`,
    };

    const newBalance = type === 'deposit' 
      ? currentData.balance + parseFloat(amount)
      : currentData.balance - parseFloat(amount);

    await setDoc(walletRef, {
      balance: newBalance,
      transactions: [newTransaction, ...currentData.transactions],
    });

    setAmount('');
    setDescription('');
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <WalletIcon size={24} />
            <h2 className="text-xl font-semibold">My Wallet</h2>
          </div>
          <div className="text-3xl font-bold mb-2">
            ${walletData.balance.toFixed(2)}
          </div>
          <div className="text-blue-100">Available Balance</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Add/Withdraw Funds</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-field"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field"
                placeholder="Enter description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleTransaction('deposit')}
                className="btn-success"
              >
                <PlusCircle size={20} />
                Add Funds
              </button>
              <button
                onClick={() => handleTransaction('withdrawal')}
                className="btn-primary"
              >
                <MinusCircle size={20} />
                Withdraw
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
        <div className="space-y-4">
          {walletData.transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No transactions yet
            </div>
          ) : (
            walletData.transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {transaction.type === 'deposit' ? (
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <ArrowUpRight className="text-green-600" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <ArrowDownRight className="text-blue-600" />
                    </div>
                  )}
                  <div>
                    <div className="font-medium">
                      {transaction.description}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className={`font-semibold ${
                  transaction.type === 'deposit' ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {transaction.type === 'deposit' ? '+' : '-'}
                  ${transaction.amount.toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}