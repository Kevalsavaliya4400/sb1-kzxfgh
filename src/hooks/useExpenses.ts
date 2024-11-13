import { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirebaseError | null>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'expenses'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const expenseData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Expense[];
        
        setExpenses(expenseData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err as FirebaseError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const deleteExpense = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'expenses', id));
    } catch (err) {
      if (err instanceof FirebaseError) {
        throw err;
      }
      throw err;
    }
  };

  return { expenses, loading, error, deleteExpense };
}