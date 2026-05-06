'use client';

import { useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import { formatCzk, formatDate } from '@/lib/format';
import { SummaryCard } from '@/components/widgets/SummaryCard';
import { TrendingUp, Plus, Trash2, Pencil, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const INV_TYPES = ['Etoro', 'XTB', 'ETF', 'Akcie', 'Kryptoměny', 'Nemovitosti', 'Dluhopisy', 'Ostatní'];
const YEARS = Array.from({ length: 8 }, (_, i) => 2020 + i);

const TYPE_STYLE: Record<string, string> = {
  Etoro:        'bg-teal-50 text-teal-700 ring-teal-200',
  XTB:          'bg-blue-50 text-blue-700 ring-blue-200',
  ETF:          'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Akcie:        'bg-indigo-50 text-indigo-700 ring-indigo-200',
  Kryptoměny:   'bg-orange-50 text-orange-700 ring-orange-200',
  Nemovitosti:  'bg-amber-50 text-amber-700 ring-amber-200',
  Dluhopisy:    'bg-violet-50 text-violet-700 ring-violet-200',
  Ostatní:      'bg-slate-100 text-slate-600 ring-slate-200',
};

export default function InvestmentsPage() {
  const { state, addInvestment, deleteInvestment, updateInvestment } = useStore();
  const [fYear, setFYear] = useState('all');
  const [fType, setFType] = useState('all');
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ year: new Date().getFullYear(), date: new Date().toISOString().split('T')[0], amount: '', description: '', type: 'ETF' });
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ year: new Date().getFullYear(), date: new Date().toISOString().split('T')[0], amount: '', type: 'ETF' });

  const filtered = useMemo(() => {
    let d = [...state.investments];
    if (fYear !== 'all') d = d.filter(i => i.year === parseInt(fYear));
    if (fType !== 'all') d = d.filter(i => i.type === fType);
    d.sort((a, b) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let av: any = (a as any)[sortKey]; let bv: any = (b as any)[sortKey];
      if (typeof av === 'string') { av = av.toLowerCase(); bv = bv.toLowerCase(); }
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return d;
  }, [state.investments, fYear, fType, sortKey, sortDir]);

  const total = useMemo(() => filtered.reduce((s, i) => s + i.amount, 0), [filtered]);
  const grandTotal = useMemo(() => state.investments.reduce((s, i) => s + i.amount, 0), [state.investments]);

  const toggleSort = (k: string) => {
    if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(k); setSortDir('asc'); }
  };
  const SortIcon = ({ k }: { k: string }) => sortKey === k
    ? (sortDir === 'asc' ? <ChevronUp className="h-3.5 w-3.5 ml-1 text-white" /> : <ChevronDown className="h-3.5 w-3.5 ml-1 text-white" />)
    : <ChevronUp className="h-3.5 w-3.5 ml-1 opacity-30 text-white" />;

  const openEdit = (inv: { id: string; year: number; date: string; amount: number; type: string }) => {
    setEditId(inv.id);
    setEditForm({ year: inv.year, date: inv.date, amount: String(inv.amount), type: inv.type });
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    updateInvestment(editId, { year: editForm.year, date: editForm.date, amount: parseInt(editForm.amount), type: editForm.type });
    setEditId(null);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addInvestment({ year: form.year, date: form.date, amount: parseInt(form.amount), description: form.description, type: form.type });
    setForm({ year: new Date().getFullYear(), date: new Date().toISOString().split('T')[0], amount: '', description: '', type: 'ETF' });
    setOpen(false);
  };

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Finance</p>
          <h1 className="text-[28px] font-bold text-[#0f1d3a]">David investice</h1>
        </div>
        <Button onClick={() => setOpen(true)} className="h-10 px-5 text-[15px] font-semibold rounded-xl shadow-md" style={{ background: '#2563eb' }}>
          <Plus className="h-4 w-4 mr-2" /> Přidat investici
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-1">
        <SummaryCard title="Celkové investice" value={formatCzk(grandTotal)} icon={TrendingUp} variant="default" description={`${state.investments.length} položek celkem`} />
      </div>

      <div className="rounded-xl border border-[#dde5f4] bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-[#eef2fb]">
          <p className="text-[16px] font-bold text-[#0f1d3a]">Přehled investic</p>
          <div className="flex gap-2">
            <Select value={fYear} onValueChange={v => setFYear(v ?? 'all')}>
              <SelectTrigger className="h-9 w-24 text-[14px] border-[#dde5f4] bg-white text-[#0f1d3a] font-medium"><SelectValue placeholder="Rok" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Vše</SelectItem>
                {YEARS.slice().reverse().map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={fType} onValueChange={v => setFType(v ?? 'all')}>
              <SelectTrigger className="h-9 w-36 text-[14px] border-[#dde5f4] bg-white text-[#0f1d3a] font-medium"><SelectValue placeholder="Typ" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Všechny typy</SelectItem>
                {INV_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {state.investments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 mb-4">
              <TrendingUp className="h-8 w-8 text-blue-400" />
            </div>
            <p className="text-[17px] font-bold text-[#0f1d3a]">Zatím žádné investice</p>
            <p className="text-[14px] text-slate-400 mt-2">Přidejte první investici pomocí tlačítka výše.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: '#152347' }}>
                  {[['year','Rok',false],['date','Datum',false],['type','Broker',false],['amount','Částka',true]].map(([k,lbl,r]) => (
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
                {filtered.map((inv, i) => (
                  <tr key={inv.id} className={`group border-b border-[#eef2fb] hover:bg-blue-50/50 transition-colors ${i % 2 === 1 ? 'bg-[#f8fafd]' : 'bg-white'}`}>
                    <td className="px-6 py-3.5 text-[15px] tabular-nums font-medium text-slate-500">{inv.year}</td>
                    <td className="px-6 py-3.5 text-[15px] text-slate-400 tabular-nums">{formatDate(inv.date)}</td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[12px] font-bold ring-1 ring-inset ${TYPE_STYLE[inv.type] ?? 'bg-slate-100 text-slate-600 ring-slate-200'}`}>{inv.type}</span>
                    </td>
                    <td className="px-6 py-3.5 text-right text-[15px] font-bold tabular-nums text-[#0f1d3a]">{formatCzk(inv.amount)}</td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="inline-flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => openEdit(inv)} className="text-slate-300 hover:text-blue-500 transition-colors">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => deleteInvestment(inv.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[#dde5f4] bg-[#f4f7fc]">
                  <td colSpan={3} className="px-6 py-4 text-[14px] font-bold text-slate-500 uppercase tracking-wide">Celkem</td>
                  <td className="px-6 py-4 text-right text-[18px] font-bold tabular-nums text-[#0f1d3a]">{formatCzk(total)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <Dialog open={editId !== null} onOpenChange={v => { if (!v) setEditId(null); }}>
        <DialogContent className="sm:max-w-sm bg-white border-[#dde5f4]">
          <DialogHeader><DialogTitle className="text-[18px] font-bold text-[#0f1d3a]">Upravit investici</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label className="text-[14px] font-semibold text-slate-600">Rok</Label>
                <Select value={String(editForm.year)} onValueChange={v => setEditForm(f => ({ ...f, year: parseInt(v ?? String(f.year)) }))}>
                  <SelectTrigger className="h-10 text-[15px]"><SelectValue /></SelectTrigger>
                  <SelectContent>{YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label className="text-[14px] font-semibold text-slate-600">Datum</Label><Input type="date" value={editForm.date} onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))} className="h-10 text-[15px]" required /></div>
            </div>
            <div className="space-y-2"><Label className="text-[14px] font-semibold text-slate-600">Broker</Label>
              <Select value={editForm.type} onValueChange={v => setEditForm(f => ({ ...f, type: v ?? f.type }))}>
                <SelectTrigger className="h-10 text-[15px]"><SelectValue /></SelectTrigger>
                <SelectContent>{INV_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label className="text-[14px] font-semibold text-slate-600">Částka (Kč)</Label><Input type="number" value={editForm.amount} onChange={e => setEditForm(f => ({ ...f, amount: e.target.value }))} className="h-10 text-[15px]" required /></div>
            <Button type="submit" className="w-full h-10 text-[15px] font-bold rounded-xl" style={{ background: '#2563eb' }}>Uložit změny</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm bg-white border-[#dde5f4]">
          <DialogHeader><DialogTitle className="text-[18px] font-bold text-[#0f1d3a]">Nová investice</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label className="text-[14px] font-semibold text-slate-600">Rok</Label>
                <Select value={String(form.year)} onValueChange={v => setForm(f => ({ ...f, year: parseInt(v ?? String(f.year)) }))}>
                  <SelectTrigger className="h-10 text-[15px]"><SelectValue /></SelectTrigger>
                  <SelectContent>{YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label className="text-[14px] font-semibold text-slate-600">Datum</Label><Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="h-10 text-[15px]" required /></div>
            </div>
            <div className="space-y-2"><Label className="text-[14px] font-semibold text-slate-600">Broker</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v ?? f.type }))}>
                <SelectTrigger className="h-10 text-[15px]"><SelectValue /></SelectTrigger>
                <SelectContent>{INV_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label className="text-[14px] font-semibold text-slate-600">Popis</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Popis investice" className="h-10 text-[15px]" required /></div>
            <div className="space-y-2"><Label className="text-[14px] font-semibold text-slate-600">Částka (Kč)</Label><Input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" className="h-10 text-[15px]" required /></div>
            <Button type="submit" className="w-full h-10 text-[15px] font-bold rounded-xl" style={{ background: '#2563eb' }}>Přidat</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
