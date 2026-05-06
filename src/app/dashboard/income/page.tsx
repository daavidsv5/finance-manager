'use client';

import { useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import { formatCzk } from '@/lib/format';
import { SummaryCard } from '@/components/widgets/SummaryCard';
import { Wallet, Plus, Trash2, Pencil, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell,
} from 'recharts';

const MONTHS = ['Leden','Únor','Březen','Duben','Květen','Červen','Červenec','Srpen','Září','Říjen','Listopad','Prosinec'];
const MONTHS_SHORT = ['Led','Úno','Bře','Dub','Kvě','Čvn','Čvc','Srp','Zář','Říj','Lis','Pro'];
const YEARS = Array.from({ length: 8 }, (_, i) => 2020 + i);
const monthIdx = (m: string) => MONTHS.indexOf(m);

const ChartTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#dde5f4] rounded-xl shadow-lg px-4 py-3 min-w-[160px]">
      <p className="text-[13px] font-bold text-[#0f1d3a] mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <span className="text-[12px] text-slate-500">{p.name}</span>
          <span className="text-[13px] font-bold tabular-nums" style={{ color: p.color }}>{formatCzk(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

const ToggleCheckbox = ({ value, onChange, color }: { value?: boolean; onChange: () => void; color: 'blue' | 'emerald' }) => {
  const on = color === 'blue'
    ? 'bg-blue-600 border-blue-600'
    : 'bg-emerald-500 border-emerald-500';
  const hover = color === 'blue' ? 'hover:border-blue-400' : 'hover:border-emerald-400';
  return (
    <button
      type="button"
      onClick={onChange}
      className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 mx-auto ${value ? on : `border-slate-300 bg-white ${hover}`}`}
      aria-checked={!!value}
      role="checkbox"
    >
      {value && <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
    </button>
  );
};

export default function IncomePage() {
  const { state, addIncome, deleteIncome, updateIncome } = useStore();

  const [fYear, setFYear] = useState('all');
  const [fMonth, setFMonth] = useState('all');
  const [fClient, setFClient] = useState('all');
  const [fType, setFType] = useState('all');
  const [sortKey, setSortKey] = useState('year');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    year: new Date().getFullYear(),
    month: 'Leden',
    client: '',
    amount: '',
    type: 'Příjem',
    invoiceSent: false,
    paid: false,
  });

  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ year: new Date().getFullYear(), month: 'Leden', client: '', amount: '', type: 'Příjem', invoiceSent: false, paid: false });

  const [chartYear, setChartYear] = useState(String(new Date().getFullYear()));

  const clients = useMemo(() => Array.from(new Set(state.incomes.map(i => i.client))).sort(), [state.incomes]);

  const chartData = useMemo(() => {
    const byMonth: Record<string, { month: string; 'Čistý příjem': number }> = {};
    MONTHS.forEach((m, idx) => { byMonth[m] = { month: MONTHS_SHORT[idx], 'Čistý příjem': 0 }; });
    const source = chartYear === 'all' ? state.incomes : state.incomes.filter(i => i.year === parseInt(chartYear));
    source.forEach(inc => {
      if (!byMonth[inc.month]) return;
      if (inc.type === 'Příjem') byMonth[inc.month]['Čistý příjem'] += inc.amount;
      else byMonth[inc.month]['Čistý příjem'] -= Math.abs(inc.amount);
    });
    return MONTHS.map(m => byMonth[m]);
  }, [state.incomes, chartYear]);

  const chartYears = useMemo(() => Array.from(new Set(state.incomes.map(i => i.year))).sort((a, b) => b - a), [state.incomes]);

  const yearlyChartData = useMemo(() => {
    const byYear: Record<number, number> = {};
    state.incomes.forEach(inc => {
      if (!byYear[inc.year]) byYear[inc.year] = 0;
      if (inc.type === 'Příjem') byYear[inc.year] += inc.amount;
      else byYear[inc.year] -= Math.abs(inc.amount);
    });
    return Object.keys(byYear)
      .map(Number)
      .sort((a, b) => a - b)
      .map(year => ({ year: String(year), 'Čistý příjem': byYear[year] }));
  }, [state.incomes]);

  const filtered = useMemo(() => {
    let d = [...state.incomes];
    if (fYear !== 'all') d = d.filter(i => i.year === parseInt(fYear));
    if (fMonth !== 'all') d = d.filter(i => i.month === fMonth);
    if (fClient !== 'all') d = d.filter(i => i.client === fClient);
    if (fType !== 'all') d = d.filter(i => i.type === fType);
    d.sort((a, b) => {
      let av: string|number = sortKey === 'month' ? monthIdx(a.month) : (a as unknown as Record<string,unknown>)[sortKey] as string|number;
      let bv: string|number = sortKey === 'month' ? monthIdx(b.month) : (b as unknown as Record<string,unknown>)[sortKey] as string|number;
      if (typeof av === 'string') { av = av.toLowerCase(); bv = (bv as string).toLowerCase(); }
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return d;
  }, [state.incomes, fYear, fMonth, fClient, fType, sortKey, sortDir]);

  const totalIncome = useMemo(() => filtered.reduce((s, i) => i.type === 'Příjem' ? s + i.amount : s - Math.abs(i.amount), 0), [filtered]);
  const totalExpense = useMemo(() => filtered.filter(i => i.type === 'Výdej').reduce((s, i) => s + Math.abs(i.amount), 0), [filtered]);

  const kpiSource = useMemo(() =>
    chartYear === 'all' ? state.incomes : state.incomes.filter(i => i.year === parseInt(chartYear)),
    [state.incomes, chartYear]
  );
  const kpiIncome = useMemo(() => kpiSource.reduce((s, i) => i.type === 'Příjem' ? s + i.amount : s - Math.abs(i.amount), 0), [kpiSource]);
  const kpiExpense = useMemo(() => kpiSource.filter(i => i.type === 'Výdej').reduce((s, i) => s + Math.abs(i.amount), 0), [kpiSource]);

  const toggleSort = (k: string) => {
    if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(k); setSortDir('asc'); }
  };
  const SortIcon = ({ k }: { k: string }) => sortKey === k
    ? (sortDir === 'asc' ? <ChevronUp className="h-3.5 w-3.5 ml-1 text-white" /> : <ChevronDown className="h-3.5 w-3.5 ml-1 text-white" />)
    : <ChevronUp className="h-3.5 w-3.5 ml-1 opacity-30 text-white" />;

  const openEdit = (inc: { id: string; year: number; month: string; client: string; amount: number; type: string; invoiceSent?: boolean; paid?: boolean }) => {
    setEditId(inc.id);
    setEditForm({ year: inc.year, month: inc.month, client: inc.client, amount: String(inc.amount), type: inc.type, invoiceSent: !!inc.invoiceSent, paid: !!inc.paid });
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    updateIncome(editId, { year: editForm.year, month: editForm.month, client: editForm.client, amount: parseInt(editForm.amount), type: editForm.type as 'Příjem'|'Výdej', invoiceSent: editForm.invoiceSent, paid: editForm.paid });
    setEditId(null);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addIncome({
      year: form.year,
      month: form.month,
      client: form.client,
      amount: parseInt(form.amount),
      type: form.type as 'Příjem'|'Výdej',
      invoiceSent: form.invoiceSent,
      paid: form.paid,
    });
    setForm({ year: new Date().getFullYear(), month: 'Leden', client: '', amount: '', type: 'Příjem', invoiceSent: false, paid: false });
    setOpen(false);
  };

  const formatYAxis = (v: number) => v >= 1000 ? `${Math.round(v / 1000)}k` : String(v);

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Finance</p>
          <h1 className="text-[28px] font-bold text-[#0f1d3a]">Příjmy</h1>
        </div>
        <Button onClick={() => setOpen(true)} className="h-10 px-5 text-[15px] font-semibold rounded-xl shadow-md" style={{ background: '#2563eb' }}>
          <Plus className="h-4 w-4 mr-2" /> Přidat příjem
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard title={`Čistý příjem (${chartYear === 'all' ? 'vše' : chartYear})`} value={formatCzk(kpiIncome)} icon={Wallet} variant="green" />
        <SummaryCard title={`Daně / výdeje (${chartYear === 'all' ? 'vše' : chartYear})`} value={formatCzk(kpiExpense)} icon={Wallet} variant="red" />
        <SummaryCard title="Čistý příjem (filtr tabulky)" value={formatCzk(totalIncome)} icon={Wallet} variant="default" />
      </div>

      {/* Yearly chart */}
      <div className="rounded-xl border border-[#dde5f4] bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#eef2fb]">
          <p className="text-[16px] font-bold text-[#0f1d3a]">Přehled po letech</p>
          <p className="text-[13px] text-slate-400 mt-0.5">Čistý příjem za každý rok — kliknutím filtruj měsíční graf</p>
        </div>
        <div className="px-4 py-5">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={yearlyChartData}
              barCategoryGap="32%"
              onClick={e => {
                if (e?.activeLabel) {
                  const label = String(e.activeLabel);
                  setChartYear(prev => prev === label ? 'all' : label);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2fb" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 13, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={48} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f4f7fc' }} />
              <Bar dataKey="Čistý příjem" radius={[6, 6, 0, 0]} maxBarSize={56} className="cursor-pointer">
                {yearlyChartData.map(entry => (
                  <Cell key={entry.year} fill={chartYear === entry.year ? '#14532d' : '#16a34a'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly chart */}
      <div className="rounded-xl border border-[#dde5f4] bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eef2fb]">
          <div>
            <p className="text-[16px] font-bold text-[#0f1d3a]">Graf příjmů</p>
            <p className="text-[13px] text-slate-400 mt-0.5">Měsíční čistý příjem (příjmy − daně)</p>
          </div>
          <Select value={chartYear} onValueChange={v => setChartYear(v ?? chartYear)}>
            <SelectTrigger className="h-9 w-28 text-[14px] border-[#dde5f4] bg-white text-[#0f1d3a] font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Všechny roky</SelectItem>
              {chartYears.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="px-4 py-5">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} barGap={4} barCategoryGap="28%">
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2fb" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={48} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f4f7fc' }} />
              <Legend wrapperStyle={{ fontSize: 13, paddingTop: 12, color: '#64748b', fontWeight: 600 }} iconType="circle" iconSize={8} />
              <Bar dataKey="Čistý příjem" fill="#1e3a8a" radius={[5, 5, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#dde5f4] bg-white shadow-sm overflow-hidden">
        {/* Filters with labels */}
        <div className="px-6 py-4 border-b border-[#eef2fb]">
          <p className="text-[16px] font-bold text-[#0f1d3a] mb-4">Přehled příjmů</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Rok', val: fYear, set: setFYear, items: YEARS.slice().reverse().map(y => ({ v: String(y), l: String(y) })), placeholder: 'Všechny roky' },
              { label: 'Měsíc', val: fMonth, set: setFMonth, items: MONTHS.map(m => ({ v: m, l: m })), placeholder: 'Všechny měsíce' },
              { label: 'Klient / Firma', val: fClient, set: setFClient, items: clients.map(c => ({ v: c, l: c })), placeholder: 'Všichni klienti' },
              { label: 'Typ záznamu', val: fType, set: setFType, items: [{ v: 'Příjem', l: 'Pouze příjmy' }, { v: 'Výdej', l: 'Pouze výdeje' }], placeholder: 'Příjem i Výdej' },
            ].map(({ label, val, set, items, placeholder }) => (
              <div key={label} className="space-y-1.5">
                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                <Select value={val} onValueChange={v => set(v ?? 'all')}>
                  <SelectTrigger className="h-9 w-full text-[14px] border-[#dde5f4] bg-white text-[#0f1d3a] font-medium">
                    <SelectValue placeholder={placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{placeholder}</SelectItem>
                    {items.map(({ v, l }) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#152347' }}>
                {[
                  ['year','Rok',false],
                  ['month','Měsíc',false],
                  ['client','Firma / Klient',false],
                  ['type','Typ',false],
                  ['amount','Částka',true],
                  ['invoiceSent','Faktura poslána',true],
                  ['paid','Zaplaceno',true],
                ].map(([k,lbl,r]) => (
                  <th key={k as string} className={`px-5 py-3.5 text-[12px] font-bold uppercase tracking-widest text-white/70 ${r ? 'text-center' : 'text-left'} ${k === 'amount' ? 'text-right' : ''}`}>
                    <button className={`inline-flex items-center hover:text-white transition-colors ${r && k !== 'invoiceSent' && k !== 'paid' ? 'ml-auto' : ''}`} onClick={() => toggleSort(k as string)}>
                      {lbl as string}<SortIcon k={k as string} />
                    </button>
                  </th>
                ))}
                <th className="w-12" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((inc, i) => (
                <tr key={inc.id} className={`group border-b border-[#eef2fb] hover:bg-blue-50/50 transition-colors ${i % 2 === 1 ? 'bg-[#f8fafd]' : 'bg-white'}`}>
                  <td className="px-5 py-3.5 text-[15px] tabular-nums font-medium text-slate-500">{inc.year}</td>
                  <td className="px-5 py-3.5 text-[15px] text-slate-500 font-medium">{inc.month}</td>
                  <td className="px-5 py-3.5 text-[15px] font-semibold text-[#0f1d3a]">{inc.client}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[12px] font-bold ring-1 ring-inset ${inc.type === 'Příjem' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-red-50 text-red-700 ring-red-200'}`}>
                      {inc.type}
                    </span>
                  </td>
                  <td className={`px-5 py-3.5 text-right text-[15px] font-bold tabular-nums ${inc.type === 'Příjem' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {inc.type === 'Výdej' ? '' : '+'}{formatCzk(inc.amount)}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    {inc.type === 'Příjem'
                      ? <ToggleCheckbox value={inc.invoiceSent} onChange={() => updateIncome(inc.id, { invoiceSent: !inc.invoiceSent })} color="blue" />
                      : <span className="text-slate-200">—</span>}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    {inc.type === 'Příjem'
                      ? <ToggleCheckbox value={inc.paid} onChange={() => updateIncome(inc.id, { paid: !inc.paid })} color="emerald" />
                      : <span className="text-slate-200">—</span>}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => openEdit(inc)} className="text-slate-300 hover:text-blue-500 transition-colors">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => deleteIncome(inc.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[#dde5f4] bg-[#f4f7fc]">
                <td colSpan={4} className="px-5 py-4 text-[14px] font-bold text-slate-500 uppercase tracking-wide">Čistý příjem (filtr)</td>
                <td className="px-5 py-4 text-right text-[18px] font-bold tabular-nums text-emerald-600">{formatCzk(totalIncome)}</td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Edit dialog */}
      <Dialog open={editId !== null} onOpenChange={v => { if (!v) setEditId(null); }}>
        <DialogContent className="sm:max-w-sm bg-white border-[#dde5f4]">
          <DialogHeader><DialogTitle className="text-[18px] font-bold text-[#0f1d3a]">Upravit záznam</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label className="text-[14px] font-semibold text-slate-600">Rok</Label>
                <Select value={String(editForm.year)} onValueChange={v => setEditForm(f => ({ ...f, year: parseInt(v ?? String(f.year)) }))}>
                  <SelectTrigger className="h-10 text-[15px]"><SelectValue /></SelectTrigger>
                  <SelectContent>{YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label className="text-[14px] font-semibold text-slate-600">Měsíc</Label>
                <Select value={editForm.month} onValueChange={v => setEditForm(f => ({ ...f, month: v ?? f.month }))}>
                  <SelectTrigger className="h-10 text-[15px]"><SelectValue /></SelectTrigger>
                  <SelectContent>{MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label className="text-[14px] font-semibold text-slate-600">Firma / Klient</Label>
              <Input value={editForm.client} onChange={e => setEditForm(f => ({ ...f, client: e.target.value }))} className="h-10 text-[15px]" required />
            </div>
            <div className="space-y-2"><Label className="text-[14px] font-semibold text-slate-600">Typ</Label>
              <Select value={editForm.type} onValueChange={v => setEditForm(f => ({ ...f, type: v ?? f.type }))}>
                <SelectTrigger className="h-10 text-[15px]"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Příjem">Příjem</SelectItem><SelectItem value="Výdej">Výdej</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label className="text-[14px] font-semibold text-slate-600">Částka (Kč)</Label>
              <Input type="number" value={editForm.amount} onChange={e => setEditForm(f => ({ ...f, amount: e.target.value }))} className="h-10 text-[15px]" required />
            </div>
            <Button type="submit" className="w-full h-10 text-[15px] font-bold rounded-xl" style={{ background: '#2563eb' }}>Uložit změny</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm bg-white border-[#dde5f4]">
          <DialogHeader><DialogTitle className="text-[18px] font-bold text-[#0f1d3a]">Nový příjem / výdaj</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-[14px] font-semibold text-slate-600">Rok</Label>
                <Select value={String(form.year)} onValueChange={v => setForm(f => ({ ...f, year: parseInt(v ?? String(f.year)) }))}>
                  <SelectTrigger className="h-10 text-[15px]"><SelectValue /></SelectTrigger>
                  <SelectContent>{YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[14px] font-semibold text-slate-600">Měsíc</Label>
                <Select value={form.month} onValueChange={v => setForm(f => ({ ...f, month: v ?? f.month }))}>
                  <SelectTrigger className="h-10 text-[15px]"><SelectValue /></SelectTrigger>
                  <SelectContent>{MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[14px] font-semibold text-slate-600">Firma / Klient</Label>
              <Input value={form.client} onChange={e => setForm(f => ({ ...f, client: e.target.value }))} placeholder="Název firmy" className="h-10 text-[15px]" required />
            </div>
            <div className="space-y-2">
              <Label className="text-[14px] font-semibold text-slate-600">Typ</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v ?? f.type }))}>
                <SelectTrigger className="h-10 text-[15px]"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Příjem">Příjem</SelectItem><SelectItem value="Výdej">Výdej</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[14px] font-semibold text-slate-600">Částka (Kč)</Label>
              <Input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" className="h-10 text-[15px]" required />
            </div>

            {/* Checkboxes */}
            <div className="rounded-xl border border-[#dde5f4] bg-[#f8fafd] p-4 space-y-3">
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-1">Stav faktury</p>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${form.invoiceSent ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white group-hover:border-blue-400'}`}
                  onClick={() => setForm(f => ({ ...f, invoiceSent: !f.invoiceSent }))}
                >
                  {form.invoiceSent && <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <input type="checkbox" className="sr-only" checked={form.invoiceSent} onChange={e => setForm(f => ({ ...f, invoiceSent: e.target.checked }))} />
                <span className="text-[15px] font-medium text-[#0f1d3a]">Faktura poslána</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${form.paid ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 bg-white group-hover:border-emerald-400'}`}
                  onClick={() => setForm(f => ({ ...f, paid: !f.paid }))}
                >
                  {form.paid && <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <input type="checkbox" className="sr-only" checked={form.paid} onChange={e => setForm(f => ({ ...f, paid: e.target.checked }))} />
                <span className="text-[15px] font-medium text-[#0f1d3a]">Zaplaceno</span>
              </label>
            </div>

            <Button type="submit" className="w-full h-10 text-[15px] font-bold rounded-xl" style={{ background: '#2563eb' }}>Přidat</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
