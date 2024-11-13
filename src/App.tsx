import React, { useEffect, useState } from 'react';
import { auth } from './lib/firebase';
import { User } from 'firebase/auth';
import { Auth } from './components/Auth';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { Profile } from './components/Profile';
import { CalendarView } from './components/CalendarView';
import { Wallet } from './components/Wallet';
import { LogOut, CreditCard, Calendar, User as UserIcon, PieChart, Wallet as WalletIcon, Menu, X } from 'lucide-react';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'expenses' | 'calendar' | 'profile' | 'wallet'>('expenses');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const NavButton = ({ tab, icon: Icon, label }: { tab: typeof activeTab; icon: typeof CreditCard; label: string }) => (
    <button
      onClick={() => {
        setActiveTab(tab);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
        activeTab === tab
          ? 'bg-blue-50 text-blue-700'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-blue-200 rounded-full"></div>
          <div className="h-4 w-24 bg-blue-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Auth />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <header className="bg-white shadow-sm backdrop-blur-lg bg-white/80 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">
                Expense Tracker
              </h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-4">
              <NavButton tab="expenses" icon={PieChart} label="Expenses" />
              <NavButton tab="calendar" icon={Calendar} label="Calendar" />
              <NavButton tab="wallet" icon={WalletIcon} label="Wallet" />
              <NavButton tab="profile" icon={UserIcon} label="Profile" />
              <button
                onClick={() => auth.signOut()}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors ml-4"
              >
                <LogOut size={20} />
                <span>Sign Out</span>
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-2 space-y-2">
              <NavButton tab="expenses" icon={PieChart} label="Expenses" />
              <NavButton tab="calendar" icon={Calendar} label="Calendar" />
              <NavButton tab="wallet" icon={WalletIcon} label="Wallet" />
              <NavButton tab="profile" icon={UserIcon} label="Profile" />
              <button
                onClick={() => auth.signOut()}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors w-full px-3 py-2"
              >
                <LogOut size={20} />
                <span>Sign Out</span>
              </button>
            </nav>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'expenses' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="lg:sticky lg:top-28">
              <ExpenseForm />
            </div>
            <ExpenseList />
          </div>
        )}
        {activeTab === 'calendar' && <CalendarView />}
        {activeTab === 'wallet' && <Wallet />}
        {activeTab === 'profile' && <Profile user={user} />}
      </main>
    </div>
  );
}

export default App;