const __IMPORT_META: any = import.meta;
console.log("DEBUG: import.meta.env keys:", Object.keys(__IMPORT_META.env || {}));
console.log(
  "DEBUG: VITE_GEMINI_API_KEY =",
  __IMPORT_META.env?.VITE_GEMINI_API_KEY ? "SET" : "UNDEFINED"
);

const __GEMINI_KEY = __IMPORT_META.env?.VITE_GEMINI_API_KEY;

import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, Category, TransactionType } from '../types';
import { DEFAULT_CATEGORIES } from '../constants';

const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;

const ai = new GoogleGenAI({
  apiKey: apiKey
});


export const categorizeTransaction = async (description: string): Promise<Category> => {
  if (!description) return 'Uncategorized';
  try {
    const prompt = `You are an expert financial categorizer for an Indian audience. Given the transaction description, classify it into one of the following categories: ${DEFAULT_CATEGORIES.join(', ')}. Return only the category name and nothing else. If you cannot determine a category, return "Uncategorized".

    Transaction: "${description}"
    Category:`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    const category = response.text.trim() as Category;
    if (DEFAULT_CATEGORIES.includes(category)) {
        return category;
    }
    return 'Uncategorized';
  } catch (error) {
    console.error('Error categorizing transaction:', error);
    return 'Uncategorized';
  }
};

export const parseVoiceTransaction = async (text: string): Promise<{ amount: number; description: string; type: TransactionType; error?: string } | null> => {
    try {
        const prompt = `You are an expert financial transaction parser for an Indian user who might use Hinglish (e.g., "kharcha," "mil gaye"). Parse the following text to extract the amount (in numbers), a concise description, and the type ('income' or 'expense').
        - "Received," "mil gaye," "credited" imply 'income'.
        - "Spent," "kharcha," "paid" imply 'expense'.
        - If type is ambiguous, default to 'expense'.
        Respond ONLY with a JSON object like {"amount": 100, "description": "Groceries", "type": "expense"}. If you cannot parse it, respond with {"error": "Could not parse"}.
        
        Text: "${text}"`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        amount: { type: Type.NUMBER },
                        description: { type: Type.STRING },
                        type: { type: Type.STRING, enum: ['income', 'expense'] },
                        error: { type: Type.STRING, nullable: true }
                    }
                }
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error('Error parsing voice transaction:', error);
        return { error: 'API Error', amount: 0, description: '', type: 'expense' };
    }
};

export const analyzeReceipt = async (base64Image: string): Promise<{ amount: number; description: string; date: string } | null> => {
    try {
        const imagePart = {
            inlineData: { mimeType: 'image/jpeg', data: base64Image },
        };
        const textPart = {
            text: `You are an expert receipt scanner for Indian receipts. Extract the total amount, merchant name (for the description), and date (in YYYY-MM-DD format). Respond ONLY with a JSON object like {"amount": 125.50, "description": "Big Bazaar", "date": "2023-10-27"}. If data is missing, use null for that field.`
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        amount: { type: Type.NUMBER, nullable: true },
                        description: { type: Type.STRING, nullable: true },
                        date: { type: Type.STRING, nullable: true },
                    }
                }
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error('Error analyzing receipt:', error);
        return null;
    }
};

export const getChatInsight = async (prompt: string, transactions: Transaction[]): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                systemInstruction: `You are 'MoneyMind AI', a friendly and insightful financial coach for an Indian user. Your knowledge is strictly limited to the provided JSON transaction data that will be sent in the user prompt. Do not make up information or discuss external topics. Answer the user's questions clearly and concisely. All monetary values must be in Indian Rupees (₹) with Indian formatting (e.g., ₹1,23,456). Be helpful and encouraging. Analyze the transactions to answer the user's query.

                Here is the user's transaction history: ${JSON.stringify(transactions.slice(0, 50))}` // Limit to recent 50 to avoid large payload
            }
        });

        return response.text;
    } catch (error) {
        console.error('Error getting chat insight:', error);
        return "I'm sorry, I'm having trouble connecting to my brain right now. Please try again later.";
    }
};


export const generateFinancialInsights = async (currentMonthTransactions: Transaction[], previousMonthTransactions: Transaction[]): Promise<string[]> => {
    if (currentMonthTransactions.length === 0) {
        return ["Add some transactions for this month to get AI insights! 💡"];
    }

    try {
        const prompt = `You are "MoneyMind AI", a helpful financial assistant for an Indian user. Analyze the following transaction data. Provide actionable, personalized, and encouraging insights. All monetary values should be in Indian Rupees (₹) with Indian formatting (e.g., ₹12,34,567).

        Current Month Transactions:
        ${JSON.stringify(currentMonthTransactions.slice(0, 20))}

        Previous Month Transactions:
        ${JSON.stringify(previousMonthTransactions.slice(0, 20))}

        Based on this data, provide a JSON array of 4 unique, insightful strings following these rules:
        1. Start with a summary of the biggest spending category this month.
        2. Compare total spending this month vs. last month (calculate percentage change). If no previous data, just state current spending.
        3. Provide one specific, actionable money-saving tip based on spending habits.
        4. Identify one interesting spending pattern, anomaly, or potential recurring payment.
        
        Example output format:
        ["This month, your largest expense was Food, totaling ₹8,500.", "Your spending increased by 15% compared to last month.", "You can save around ₹2,000 this month by reducing your shopping expenses.", "It looks like you have a recurring bill of around ₹499 for a subscription." ]`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING
                    }
                }
            }
        });

        const insightsText = response.text.trim();
        const insightsArray = JSON.parse(insightsText);
        
        if (Array.isArray(insightsArray) && insightsArray.every(item => typeof item === 'string')) {
            return insightsArray;
        }
        return ["Could not generate insights at the moment."];

    } catch (error) {
        console.error('Error generating financial insights:', error);
        return ["AI insights are currently unavailable. Please try again later."];
    }
};