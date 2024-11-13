import React, { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { useExpenses } from '../hooks/useExpenses';
import 'react-day-picker/dist/style.css';

export function CalendarView() {
  const [selectedDay, setSelectedDay] = useState<Date>();
  const { expenses } = useExpenses();

  const expensesByDate = expenses.reduce((acc, expense) => {
    const date = format(new Date(expense.date), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(expense);
    return acc;
  }, {} as Record<string, typeof expenses>);

  const modifiers = {
    hasExpense: Object.keys(expensesByDate).map(date => new Date(date)),
  };

  const modifiersStyles = {
    hasExpense: {
      backgroundColor: '#93c5fd',
      color: 'white',
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Expense Calendar</h3>
        <div className="flex justify-center">
          <DayPicker
            mode="single"
            selected={selectedDay}
            onSelect={setSelectedDay}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            className="rdp-custom"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">
          {selectedDay
            ? `Expenses for ${format(selectedDay, 'MMMM d, yyyy')}`
            : 'Select a date to view expenses'}
        </h3>
        
        {selectedDay && (
          <div className="space-y-4">
            {expensesByDate[format(selectedDay, 'yyyy-MM-dd')]?.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <h4 className="font-medium">{expense.description}</h4>
                  <span className="text-sm text-gray-500 capitalize">
                    {expense.category}
                  </span>
                </div>
                <span className="font-semibold">${expense.amount.toFixed(2)}</span>
              </div>
            )) || (
              <div className="text-center py-8 text-gray-500">
                No expenses recorded for this date
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}