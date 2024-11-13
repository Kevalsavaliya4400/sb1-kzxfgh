import React from 'react';
import { format } from 'date-fns';
import { Trash2, AlertCircle, ExternalLink } from 'lucide-react';
import { useExpenses } from '../hooks/useExpenses';
import { FirebaseError } from 'firebase/app';

export function ExpenseList() {
  const { expenses, loading, error, deleteExpense } = useExpenses();

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-600">Loading expenses...</div>
      </div>
    );
  }

  if (error) {
    const isIndexError = error.code === 'failed-precondition' && error.message?.includes('index');
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="text-red-800 font-medium">Database Setup Required</h3>
              {isIndexError ? (
                <div className="mt-2 space-y-3">
                  <p className="text-red-700 text-sm">
                    One-time setup needed: Create a database index for better performance.
                  </p>
                  <a
                    href="https://console.firebase.google.com/project/expense-tracker-81a37/firestore/indexes"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Create Index in Firebase Console
                    <ExternalLink size={16} />
                  </a>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-1">Steps to create the index:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Click the link above to open Firebase Console</li>
                      <li>Click "Add Index" in the Composite Indexes section</li>
                      <li>Collection ID: "expenses"</li>
                      <li>Add fields: "userId" (Ascending) and "date" (Descending)</li>
                      <li>Click "Create Index" and wait a few minutes</li>
                      <li>Refresh this page</li>
                    </ol>
                  </div>
                </div>
              ) : (
                <p className="text-red-700 text-sm mt-1">{error.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Expenses</h3>
        
        {expenses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No expenses recorded yet.</p>
            <p className="text-sm mt-1">Add your first expense using the form.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-medium">{expense.description}</h4>
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <span>{format(new Date(expense.date), 'MMM d, yyyy')}</span>
                    <span>•</span>
                    <span className="capitalize">{expense.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">
                    ${expense.amount.toFixed(2)}
                  </span>
                  <button
                    onClick={() => deleteExpense(expense.id)}
                    className="text-red-600 hover:text-red-800 transition-colors p-1 rounded-full hover:bg-red-50"
                    aria-label="Delete expense"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}