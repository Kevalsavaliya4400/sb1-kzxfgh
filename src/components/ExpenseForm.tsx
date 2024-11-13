import React, { useState } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { PlusCircle, AlertCircle } from 'lucide-react';

export function ExpenseForm() {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('other');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!auth.currentUser) return;

    try {
      const walletRef = doc(db, 'wallets', auth.currentUser.uid);
      const walletSnap = await getDoc(walletRef);
      const walletData = walletSnap.exists() ? walletSnap.data() : { balance: 0 };

      if (walletData.balance < parseFloat(amount)) {
        setError('Insufficient funds in wallet');
        return;
      }

      await addDoc(collection(db, 'expenses'), {
        userId: auth.currentUser.uid,
        description,
        amount: parseFloat(amount),
        category,
        date: new Date().toISOString(),
      });

      // Update wallet balance
      await fetch(walletRef, {
        balance: walletData.balance - parseFloat(amount),
      });

      setDescription('');
      setAmount('');
      setCategory('other');
    } catch (error) {
      console.error('Error adding expense:', error);
      setError('Failed to add expense');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Add New Expense</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            min="0"
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-field"
          >
            <option value="food">Food</option>
            <option value="transport">Transport</option>
            <option value="utilities">Utilities</option>
            <option value="entertainment">Entertainment</option>
            <option value="shopping">Shopping</option>
            <option value="health">Health</option>
            <option value="education">Education</option>
            <option value="other">Other</option>
          </select>
        </div>

        <button type="submit" className="btn-primary w-full">
          <PlusCircle size={20} />
          Add Expense
        </button>
      </div>
    </form>
  );
}