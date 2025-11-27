import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction } from '../types';
import { formatCurrency } from './formatting';

export const exportTransactionsToPDF = (transactions: Transaction[]) => {
  if (transactions.length === 0) {
    alert("No transactions to export.");
    return;
  }

  const doc = new jsPDF();

  // 1. Title
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('MoneyMind AI Transaction Report', 105, 20, { align: 'center' });
  
  // 2. Generation Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 105, 28, { align: 'center' });

  // 3. Summary
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', 14, 45);

  autoTable(doc, {
    startY: 50,
    body: [
      ['Total Income', { content: formatCurrency(totalIncome), styles: { textColor: '#10B981' } }],
      ['Total Expenses', { content: formatCurrency(totalExpenses), styles: { textColor: '#EF4444' } }],
      ['Final Balance', formatCurrency(balance)],
    ],
    theme: 'grid',
    styles: { fontStyle: 'bold' },
    columnStyles: {
      0: { halign: 'left' },
      1: { halign: 'right' },
    },
  });

  // 4. Transactions Table
  const finalY = (doc as any).lastAutoTable.finalY || 80;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('All Transactions', 14, finalY + 15);

  const tableColumn = ["Date", "Description", "Category", "Type", "Amount"];
  const tableRows: (string|number)[][] = [];

  // Sort transactions by date, most recent first
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  sortedTransactions.forEach(transaction => {
    const transactionData = [
      new Date(transaction.date).toLocaleDateString('en-IN'),
      transaction.description,
      transaction.category,
      transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1),
      formatCurrency(transaction.amount)
    ];
    tableRows.push(transactionData);
  });

  autoTable(doc, {
    startY: finalY + 20,
    head: [tableColumn],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] }, // primary color
    didParseCell: function (data) {
        // Align amount column to the right
        if (data.column.dataKey === 4 && data.row.section === 'body') {
            data.cell.styles.halign = 'right';
            // Color code amount based on transaction type
            const transactionType = tableRows[data.row.index][3];
            if (transactionType === 'Income') {
                 data.cell.styles.textColor = '#10B981';
            } else {
                 data.cell.styles.textColor = '#EF4444';
            }
        }
    }
  });


  // 5. Save the PDF
  doc.save('MoneyMind_Transactions.pdf');
};
