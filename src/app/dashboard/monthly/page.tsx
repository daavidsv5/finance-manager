'use client';

import { useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import { formatCzk } from '@/lib/format';
import { SummaryCard } from '@/components/widgets/SummaryCard';
import { CreditCard, Plus, Trash2, Pencil, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const CATEGORIES = ['Rodina', 'Auto', 'Investice', 'Práce', 'Předplatné', 'Daně'] as const;
type Cat = typeof CATEGORIES[number];

const CAT_STYLE: Record<string, string> = {
  Rodina:     'bg-blue-50 text-blue-700 ring-blue-200',
  Auto:       'bg-orange-50 text-orange-700 ring-orange-200',
  Investice:  'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Práce:      'bg-violet-50 text-violet-700 ring-violet-200',
  Předplatné: 'bg-slate-100 text-slate-600 ring-slate-200',
  Daně:       'bg-red-50 text-red-700 ring-red-200',
};

export default function MonthlyPage() {
  const { state, addMonthlyExpense, deleteMonthlyExpense, updateMonthlyExpense } = useStore();
  const [filter, setFilter] = useState('all');
  const [sortKey, setSortKey] = useState('category');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('asc');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'Rodina' as Cat, amount: '', date: new Date().toISOString().split('T')[0] });
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', category: 'Rodina' as Cat, amount: '', date: '' });

  const filtered = useMemo(() => {
    let d = [...state.monthlyExpenses];
    if (filter !== 'all') d = d.filter(e => e.category === filter);
    d.sort((a, b) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let av: any = (a as any)[sortKey]; let bv: any = (b as any)[sortKey];
      if (typeof av === 'string') { av = av.toLowerCase(); bv = bv.toLowerCase(); }
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return d;
  }, [state.monthlyExpenses, filter, sortKey, sortDir]);

  const total = useMemo(() => filtered.reduce((s, e) => s + e.amount, 0), [filtered]);
  const grandTotal = useMemo(() => state.monthlyExpenses.reduce((s, e) => s + e.amount, 0), [state.monthlyExpenses]);

  const toggleSort = (k: string) => {
    if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(k); setSortDir('asc'); }
  };

  const SortIcon = ({ k }: { k: string }) => sortKey === k
    ? (sortDir === 'asc' ? <ChevronUp className="h-3.5 w-3.5 ml-1 text-white" /> : <ChevronDown className="h-3.5 w-3.5 ml-1 text-white" />)
    : <ChevronUp className="h-3.5 w-3.5 ml-1 opacity-30 text-white" />;

  const openEdit = (expense: { id: string; name: string; category: Cat; amount: number; date: string }) => {
    setEditId(expense.id);
    setEditForm({ name: expense.name, category: expense.category, amount: String(expense.amount), date: expense.date });
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    updateMonthlyExpense(editId, { name: editForm.name, category: editForm.category, amount: parseInt(editForm.amount), date: editForm.date });
    setEditId(null);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addMonthlyExpense({ name: form.name, category: form.category, amount: parseInt(form.amount), date: form.date });
    setForm({ name: '', category: 'Rodina', amount: '', date: new Date().toISOString().split('T')[0] });
    setOpen(false);
  };

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Finance</p>
          <h1 className="text-[28px] font-bold text-[#0f1d3a]">Měsíční výdaje</h1>
        </div>
        <Button
          onClick={() => setOpen(true)}
          className="h-10 px-5 text-[15px] font-semibold rounded-xl shadow-md"
          style={{ background: '#2563eb' }}
        >
          <Plus className="h-4 w-4 mr-2" /> Přidat výdaj
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-1">
        <SummaryCard title="Celkem / měsíc" value={formatCzk(grandTotal)} icon={CreditCard} variant="default" description={`${state.monthlyExpenses.length} položek celkem`} />
      </div>

      {/* Table card */}
      <div className="rounded-xl border border-[#dde5f4] bg-white shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eef2fb]">
          <p className="text-[16px] font-bold text-[#0f1d3a]">Přehled výdajů</p>
          <Select value={filter} onValueChange={v => setFilter(v ?? 'all')}>
            <SelectTrigger className="h-9 w-44 text-[14px] border-[#dde5f4] bg-white text-[#0f1d3a] font-medium">
              <SelectValue placeholder="Kategorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Všechny kategorie</SelectItem>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#152347' }}>
                {[['name','Výdaj',false],['category','Kategorie',false],['amount','Částka',true]].map(([k,lbl,r]) => (
                  <th key={k as string} className={`px-6 py-3.5 text-[12px] font-bold uppercase tracking-widest text-white/70 ${r ? 'text-right' : 'text-left'}`}>
                    <button className={`inline-flex items-center hover:text-white transition-colors ${r ? 'ml-auto' : ''}`} onClick={() => toggleSort(k as string)}>
                      {lbl as string}<SortIcon k={k as string} />
                    </button>
                  </th>
                ))}
                <th className="w-12" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((e, i) => (
                <tr key={e.id} className={`group border-b border-[#eef2fb] hover:bg-blue-50/50 transition-colors ${i % 2 === 1 ? 'bg-[#f8fafd]' : 'bg-white'}`}>
                  <td className="px-6 py-3.5 text-[15px] font-semibold text-[#0f1d3a]">{e.name}</td>
                  <td className="px-6 py-3.5">
                    <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[12px] font-bold ring-1 ring-inset ${CAT_STYLE[e.category] ?? 'bg-slate-100 text-slate-600 ring-slate-200'}`}>
                      {e.category}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right text-[15px] font-bold tabular-nums text-[#0f1d3a]">{formatCzk(e.amount)}</td>
                  <td className="px-6 py-3.5 text-right">
                    <div className="inline-flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => openEdit(e)} className="text-slate-300 hover:text-blue-500 transition-colors">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => deleteMonthlyExpense(e.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[#dde5f4] bg-[#f4f7fc]">
                <td colSpan={2} className="px-6 py-4 text-[14px] font-bold text-slate-500 uppercase tracking-wide">Celkem</td>
                <td className="px-6 py-4 text-right text-[18px] font-bold tabular-nums text-[#0f1d3a]">{formatCzk(total)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <Dialog open={editId !== null} onOpenChange={v => { if (!v) setEditId(null); }}>
        <DialogContent className="sm:max-w-sm bg-white border-[#dde5f4]">
          <DialogHeader><DialogTitle className="text-[18px] font-bold text-[#0f1d3a]">Upravit výdaj</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-[14px] font-semibold text-slate-600">Název</Label>
              <Input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} placeholder="Název výdaje" className="h-10 text-[15px]" required />
            </div>
            <div className="space-y-2">
              <Label className="text-[14px] font-semibold text-slate-600">Kategorie</Label>
              <Select value={editForm.category} onValueChange={v => setEditForm(f => ({ ...f, category: (v ?? f.category) as Cat }))}>
                <SelectTrigger className="h-10 text-[15px]"><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[14px] font-semibold text-slate-600">Částka (Kč)</Label>
              <Input type="number" value={editForm.amount} onChange={e => setEditForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" className="h-10 text-[15px]" required />
            </div>
            <div className="space-y-2">
              <Label className="text-[14px] font-semibold text-slate-600">Datum</Label>
              <Input type="date" value={editForm.date} onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))} className="h-10 text-[15px]" required />
            </div>
            <Button type="submit" className="w-full h-10 text-[15px] font-bold rounded-xl" style={{ background: '#2563eb' }}>Uložit změny</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm bg-white border-[#dde5f4]">
          <DialogHeader><DialogTitle className="text-[18px] font-bold text-[#0f1d3a]">Nový měsíční výdaj</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-[14px] font-semibold text-slate-600">Název</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Název výdaje" className="h-10 text-[15px]" required />
            </div>
            <div className="space-y-2">
              <Label className="text-[14px] font-semibold text-slate-600">Kategorie</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: (v ?? f.category) as Cat }))}>
                <SelectTrigger className="h-10 text-[15px]"><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[14px] font-semibold text-slate-600">Částka (Kč)</Label>
              <Input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" className="h-10 text-[15px]" required />
            </div>
            <div className="space-y-2">
              <Label className="text-[14px] font-semibold text-slate-600">Datum</Label>
              <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="h-10 text-[15px]" required />
            </div>
            <Button type="submit" className="w-full h-10 text-[15px] font-bold rounded-xl" style={{ background: '#2563eb' }}>Přidat výdaj</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
