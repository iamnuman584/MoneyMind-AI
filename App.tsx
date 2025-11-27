
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Transaction, Goal, Budget, Category, TransactionType } from './types';
import { loadData, saveData } from './services/storageService';
import { formatCurrency } from './utils/formatting';
import { fileToBase64 } from './utils/file';
import { parseVoiceTransaction, analyzeReceipt } from './services/geminiService';
import Header from './services/components/Header';
import Dashboard from './services/components/Dashboard';
import TransactionList from './services/components/TransactionList';
import AddTransactionModal from './services/components/AddTransactionModal';
import Insights from './services/components/Insights';
import BudgetTracker from './services/components/BudgetTracker';
import SavingsGoals from './services/components/SavingsGoals';
import VoiceInputModal from './services/components/VoiceInputModal';
import MoneyCoachModal from './services/components/MoneyCoachModal';

type Theme = 'light' | 'dark';

const App: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [budget, setBudget] = useState<Budget>({ amount: 50000, month: new Date().getMonth() });
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [theme, setTheme] = useState<Theme>('light');

    // Premium Features State
    const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
    const [isCoachOpen, setIsCoachOpen] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const receiptFileRef = useRef<HTMLInputElement>(null);
    const recognitionRef = useRef<any>(null);


    // Load data and theme from local storage
    useEffect(() => {
        const data = loadData();
        setTransactions(data.transactions);
        setGoals(data.goals);
        if (data.budget && data.budget.month === new Date().getMonth()) {
            setBudget(data.budget);
        } else {
            setBudget({ amount: 50000, month: new Date().getMonth() });
        }

        const savedTheme = localStorage.getItem('theme') as Theme;
        if (savedTheme) {
            setTheme(savedTheme);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
        }
    }, []);

    // Save data and theme to local storage
    useEffect(() => {
        saveData({ transactions, goals, budget });
    }, [transactions, goals, budget]);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);
    
    // Setup Speech Recognition
    useEffect(() => {
        // Fix: Cast window to any to access non-standard SpeechRecognition APIs
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.lang = 'en-IN';
            recognition.interimResults = true;

            recognition.onresult = (event: any) => {
                setTranscript(event.results[0][0].transcript);
            };

            recognition.onend = () => {
                setIsVoiceModalOpen(false);
                if (transcript.trim()) {
                    handleVoiceCommand(transcript);
                }
            };
            recognitionRef.current = recognition;
        } else {
            console.warn("Speech Recognition not supported in this browser.");
        }
    }, [transcript]); // re-create if transcript changes

    const handleVoiceCommand = async (command: string) => {
        const parsed = await parseVoiceTransaction(command);
        if (parsed && !parsed.error) {
            setEditingTransaction({
                id: 0, // temporary id
                description: parsed.description,
                amount: parsed.amount,
                type: parsed.type,
                date: new Date().toISOString().split('T')[0],
                category: 'Uncategorized',
            });
            setIsAddModalOpen(true);
        } else {
            alert("Sorry, I couldn't understand that. Please try again.");
        }
        setTranscript('');
    };

    const startListening = () => {
        if (recognitionRef.current) {
            setTranscript('');
            setIsVoiceModalOpen(true);
            recognitionRef.current.start();
        } else {
            alert("Voice input is not supported on your browser.");
        }
    };

    const handleScanReceiptClick = () => {
        receiptFileRef.current?.click();
    };

    const handleReceiptFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setIsScanning(true);
            setIsAddModalOpen(true);
            try {
                const base64Image = await fileToBase64(file);
                const parsed = await analyzeReceipt(base64Image);
                if (parsed) {
                    setEditingTransaction({
                        id: 0,
                        description: parsed.description || 'Scanned Receipt',
                        amount: parsed.amount || 0,
                        type: 'expense',
                        date: parsed.date || new Date().toISOString().split('T')[0],
                        category: 'Uncategorized'
                    });
                }
            } catch (error) {
                console.error("Error scanning receipt:", error);
                alert("Failed to scan the receipt. Please try again.");
            } finally {
                setIsScanning(false);
            }
        }
        // Reset file input
        if(event.target) event.target.value = '';
    };

    const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'category'>, category: Category) => {
        setTransactions(prev => [{ ...transaction, id: Date.now(), category }, ...prev]);
        setIsAddModalOpen(false);
        setEditingTransaction(null);
    }, []);
    
    const updateTransaction = useCallback((updatedTransaction: Transaction) => {
        setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
        setIsAddModalOpen(false);
        setEditingTransaction(null);
    }, []);

    const deleteTransaction = useCallback((id: number) => {
        setTransactions(prev => prev.filter(t => t.id !== id));
    }, []);
    
    const handleEditTransaction = useCallback((transaction: Transaction) => {
        setEditingTransaction(transaction);
        setIsAddModalOpen(true);
    }, []);
    
    const openAddModal = () => {
        setEditingTransaction(null);
        setIsAddModalOpen(true);
    }

    const { totalIncome, totalExpenses, balance } = useMemo(() => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const monthlyTransactions = transactions.filter(t => {
            const date = new Date(t.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        const income = monthlyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = monthlyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

        return { totalIncome: income, totalExpenses: expenses, balance: income - expenses };
    }, [transactions]);

    const addGoal = (goal: Omit<Goal, 'id' | 'savedAmount'>) => {
        setGoals(prev => [...prev, { ...goal, id: Date.now(), savedAmount: 0 }]);
    };

    const updateGoal = (id: number, amount: number) => {
        setGoals(prev => prev.map(g => g.id === id ? { ...g, savedAmount: g.savedAmount + amount } : g));
    };

    const deleteGoal = (id: number) => {
        setGoals(prev => prev.filter(g => g.id !== id));
    };

    return (
        <div className="bg-background dark:bg-dark-background min-h-screen font-sans text-text-primary dark:text-dark-text-primary transition-colors duration-300">
            <input type="file" ref={receiptFileRef} onChange={handleReceiptFileChange} className="hidden" accept="image/*" />
            <Header 
                onAddTransaction={openAddModal} 
                theme={theme}
                setTheme={setTheme}
                onVoiceInput={startListening}
                onScanReceipt={handleScanReceiptClick}
            />
            <main className="p-4 md:p-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <Dashboard 
                            totalIncome={totalIncome}
                            totalExpenses={totalExpenses}
                            balance={balance}
                            transactions={transactions}
                        />
                        <TransactionList 
                            transactions={transactions} 
                            onDelete={deleteTransaction}
                            onEdit={handleEditTransaction}
                        />
                    </div>
                    <div className="space-y-8">
                        <Insights transactions={transactions} />
                        <BudgetTracker 
                            budget={budget} 
                            setBudget={setBudget} 
                            totalExpenses={totalExpenses}
                        />
                        <SavingsGoals 
                            goals={goals} 
                            addGoal={addGoal}
                            updateGoal={updateGoal}
                            deleteGoal={deleteGoal}
                            balance={balance}
                        />
                    </div>
                </div>
            </main>
            {isAddModalOpen && (
                <AddTransactionModal
                    isOpen={isAddModalOpen}
                    onClose={() => { setIsAddModalOpen(false); setEditingTransaction(null); }}
                    onAddTransaction={addTransaction}
                    onUpdateTransaction={updateTransaction}
                    existingTransaction={editingTransaction}
                    isProcessing={isScanning}
                />
            )}
            <VoiceInputModal 
                isOpen={isVoiceModalOpen}
                onClose={() => {
                    if (recognitionRef.current) recognitionRef.current.stop();
                    setIsVoiceModalOpen(false);
                }}
                transcript={transcript}
            />
             <button
                onClick={() => setIsCoachOpen(true)}
                className="fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-110 focus:outline-none z-20"
                aria-label="Open AI Money Coach"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
            {isCoachOpen && (
                <MoneyCoachModal
                    isOpen={isCoachOpen}
                    onClose={() => setIsCoachOpen(false)}
                    transactions={transactions}
                />
            )}
        </div>
    );
};

export default App;
