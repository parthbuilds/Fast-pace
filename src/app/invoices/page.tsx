'use client';

import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Printer,
  Calendar,
  Plus,
  Loader2,
  Trash2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export default function InvoiceGeneratorPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Invoice parameters state
  const [invoiceNumber, setInvoiceNumber] = useState('FP-2026-001');
  const [invoiceDate, setInvoiceDate] = useState('2026-08-20');
  const [dueDate, setDueDate] = useState('2026-09-04');
  const [gstPercentage, setGstPercentage] = useState<number>(18); // Default 18% GST standard in India
  const [includeGst, setIncludeGst] = useState(true);

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: 'Modern Business Website Development (NextJS)', quantity: 1, rate: 45000 },
    { id: '2', description: 'WhatsApp Business API Integration & Booking Reminders', quantity: 1, rate: 35000 },
  ]);

  const [newItemText, setNewItemText] = useState('');
  const [newItemRate, setNewItemRate] = useState<number>(0);

  // Bank details settings
  const [upiId, setUpiId] = useState('parth@upi');
  const [bankAccount, setBankAccount] = useState('Account: 50100412345678');
  const [ifscCode, setIfscCode] = useState('HDFC0000140');
  const [bankName, setBankName] = useState('HDFC Bank, HSR Layout Sector 1');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/leads');
        const data = await res.json();
        if (data.success && data.leads.length > 0) {
          setLeads(data.leads);
          setSelectedLeadId(data.leads[0].id);
          
          // Seed invoice items based on first lead's opportunities if available
          const firstLead = data.leads[0];
          if (firstLead.estimatedValue) {
            setItems([
              { 
                id: '1', 
                description: `Custom Software Solution Suite for ${firstLead.business.name}`, 
                quantity: 1, 
                rate: firstLead.estimatedValue 
              }
            ]);
          }
        }
      } catch (err) {
        console.error('Fetch leads for invoices error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleLeadChange = (id: string) => {
    setSelectedLeadId(id);
    const l = leads.find((item) => item.id === id);
    if (l) {
      const defaultRate = l.estimatedValue || 45000;
      setItems([
        {
          id: '1',
          description: `Custom Web & Operations Platform for ${l.business.name}`,
          quantity: 1,
          rate: defaultRate,
        },
      ]);
      // Increment invoice number suffix based on lead ID slice
      setInvoiceNumber(`FP-2026-${l.id.slice(0, 3).toUpperCase()}`);
    }
  };

  const handleAddItem = () => {
    if (newItemText.trim() && newItemRate > 0) {
      setItems([
        ...items,
        {
          id: Date.now().toString(),
          description: newItemText.trim(),
          quantity: 1,
          rate: newItemRate,
        },
      ]);
      setNewItemText('');
      setNewItemRate(0);
    }
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedLead = leads.find((l) => l.id === selectedLeadId);

  // Financial computations
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const gstAmount = includeGst ? Math.round(subtotal * (gstPercentage / 100)) : 0;
  const totalAmount = subtotal + gstAmount;

  return (
    <div className="space-y-6 mx-auto pb-16">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-500" />
            <span>Professional Invoice Generator</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Select a won lead or client and generate a clean, GST-compliant print-ready invoice in INR.
          </p>
        </div>

        <button
          onClick={handlePrint}
          disabled={items.length === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4 text-white" />
          <span>Print / Export PDF Invoice</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Panel */}
        <div className="lg:col-span-5 bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4 text-xs shadow-sm print:hidden">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Invoice Parameters
          </h2>

          <div className="space-y-1">
            <label className="text-slate-650 dark:text-slate-400 font-semibold">Bill To (Client Lead)</label>
            <select
              value={selectedLeadId}
              onChange={(e) => handleLeadChange(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg p-2 border border-slate-300 dark:border-slate-700 cursor-pointer"
            >
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.business.name} ({l.business.category})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1 col-span-2">
              <label className="text-slate-650 dark:text-slate-400 font-semibold">Invoice No</label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg p-2 border border-slate-300 dark:border-slate-700"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-655 dark:text-slate-400 font-semibold">GST Rate</label>
              <select
                value={gstPercentage}
                onChange={(e) => setGstPercentage(Number(e.target.value))}
                disabled={!includeGst}
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg p-2 border border-slate-300 dark:border-slate-700 disabled:opacity-50"
              >
                <option value={18}>18% GST</option>
                <option value={12}>12% GST</option>
                <option value={5}>5% GST</option>
                <option value={0}>0% GST</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-650 dark:text-slate-400 font-semibold">Invoice Date</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg p-2 border border-slate-300 dark:border-slate-700"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-650 dark:text-slate-400 font-semibold">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg p-2 border border-slate-300 dark:border-slate-700"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 py-1.5">
            <input
              type="checkbox"
              id="includeGst"
              checked={includeGst}
              onChange={(e) => setIncludeGst(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded bg-slate-950 border-slate-800 focus:outline-none cursor-pointer"
            />
            <label htmlFor="includeGst" className="text-slate-650 dark:text-slate-400 font-semibold cursor-pointer select-none">
              Include standard Indian GST calculation
            </label>
          </div>

          {/* Line Items builder */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-slate-650 dark:text-slate-400 font-semibold">Invoice Items ({items.length})</label>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px]">
                  <div className="truncate flex-1">
                    <span className="text-slate-800 dark:text-slate-200 font-medium block truncate">{item.description}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{formatCurrency(item.rate)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-rose-500 hover:text-rose-600 ml-2 font-bold cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder="Item description..."
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs rounded-lg px-2.5 py-1.5 border border-slate-300 dark:border-slate-700"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  value={newItemRate || ''}
                  onChange={(e) => setNewItemRate(Number(e.target.value))}
                  placeholder="Rate (₹ INR)"
                  className="flex-1 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs rounded-lg px-2.5 py-1.5 border border-slate-300 dark:border-slate-700"
                />
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-lg font-semibold text-xs border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>

          {/* Payment coordinates settings */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-slate-650 dark:text-slate-400 font-semibold">Your Settlement Details</label>
            <div className="space-y-2">
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="UPI ID"
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs rounded-lg p-2 border border-slate-300 dark:border-slate-700"
              />
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Bank Name & Branch"
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs rounded-lg p-2 border border-slate-300 dark:border-slate-700"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  placeholder="Account Number"
                  className="flex-1 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs rounded-lg p-2 border border-slate-300 dark:border-slate-700"
                />
                <input
                  type="text"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value)}
                  placeholder="IFSC Code"
                  className="w-24 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs rounded-lg p-2 border border-slate-300 dark:border-slate-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Formal Print-Ready Invoice Document */}
        <div className="lg:col-span-7 bg-white text-slate-900 rounded-2xl p-8 shadow-xl border border-slate-200 space-y-6 font-sans select-text">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-6">
            <div>
              <div className="text-lg font-black text-emerald-700 tracking-tight">
                VELOCITY SOFTWARE STUDIO
              </div>
              <p className="text-xs text-slate-500">Custom Software & Web Engineering</p>
              <p className="text-xs text-slate-500">HSR Layout, Bangalore • parth@velocitystudio.io</p>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                TAX INVOICE
              </div>
              <div className="text-xs text-slate-600 mt-1">Invoice No: <strong className="text-slate-900 font-bold">{invoiceNumber}</strong></div>
              <div className="text-[11px] text-slate-500">Date: {formatDate(invoiceDate)}</div>
              <div className="text-[11px] text-slate-500">Due Date: {formatDate(dueDate)}</div>
            </div>
          </div>

          {/* Client Target & Billing Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                Billed To
              </span>
              <div className="font-bold text-xs text-slate-900">{selectedLead?.business?.name}</div>
              <p className="text-[11px] text-slate-600">{selectedLead?.business?.address || 'HSR Layout, Bangalore'}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                Payee
              </span>
              <div className="font-bold text-xs text-slate-900">Parth (Velocity Software)</div>
              <p className="text-[11px] text-slate-600">UPI ID: {upiId}</p>
            </div>
          </div>

          {/* Table Items */}
          <div className="space-y-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-300 text-slate-500 font-bold">
                  <th className="py-2.5">Service Description</th>
                  <th className="py-2.5 text-right w-16">Qty</th>
                  <th className="py-2.5 text-right w-24">Rate</th>
                  <th className="py-2.5 text-right w-28">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400 italic">No invoice items. Add items on the left form.</td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="text-slate-700">
                      <td className="py-3 pr-4 font-medium text-slate-950">{item.description}</td>
                      <td className="py-3 text-right">{item.quantity}</td>
                      <td className="py-3 text-right">{formatCurrency(item.rate)}</td>
                      <td className="py-3 text-right font-semibold text-slate-950">{formatCurrency(item.quantity * item.rate)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Total Breakdown */}
          <div className="border-t border-slate-350 pt-4 flex flex-col items-end gap-1.5 text-xs text-slate-600">
            <div className="flex justify-between w-64">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-950">{formatCurrency(subtotal)}</span>
            </div>
            {includeGst && (
              <div className="flex justify-between w-64 text-[11px] text-slate-500">
                <span>GST ({gstPercentage}%):</span>
                <span>{formatCurrency(gstAmount)}</span>
              </div>
            )}
            <div className="flex justify-between w-64 text-sm font-bold text-slate-950 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-1">
              <span>Total Amount Due:</span>
              <span className="text-emerald-700">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          {/* Payment Terms and Bank Coordinates */}
          <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>How To Pay (Settlement Details)</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <div><span className="text-slate-400">UPI Address:</span> <strong className="font-semibold text-slate-800">{upiId}</strong></div>
              <div><span className="text-slate-400">Bank Name:</span> <span className="text-slate-800">{bankName}</span></div>
              <div><span className="text-slate-400">Account No:</span> <strong className="font-semibold text-slate-800">{bankAccount.replace('Account: ', '')}</strong></div>
              <div><span className="text-slate-400">IFSC Code:</span> <strong className="font-semibold text-slate-800">{ifscCode}</strong></div>
            </div>
            <div className="pt-2 text-[10px] text-slate-400 border-t border-slate-200 italic leading-tight">
              Please include Invoice Reference No. in transfer descriptions. Cheques are not accepted. Payment is due within 15 days of invoice date.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
