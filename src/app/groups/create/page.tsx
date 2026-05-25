'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/config';

const FREQUENCIES = [
  { value: 'weekly', label: 'Hebdomadaire' },
  { value: 'biweekly', label: 'Bimensuel' },
  { value: 'monthly', label: 'Mensuel' },
];

export default function CreateGroupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    frequency: 'monthly',
    amount: '',
    maxMembers: '',
    startDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(API_URL + '/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({
          ...form,
          amount: parseFloat(form.amount),
          maxMembers: parseInt(form.maxMembers),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur creation groupe');
      router.push('/groups/' + data.code);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
        <button onClick={() => router.back()} className="text-gray-400 text-sm mb-6">
          Retour
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Creer un groupe</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du groupe</label>
            <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Frequence</label>
            <select value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm">
              {FREQUENCIES.map(f => (<option key={f.value} value={f.value}>{f.label}</option>))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant (CAD)</label>
              <input type="number" required min="25" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Membres</label>
              <input type="number" required min="2" max="20" value={form.maxMembers} onChange={e => setForm({ ...form, maxMembers: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de depart</label>
            <input type="date" required value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" />
          </div>
          {error && (<div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>)}
          <button type="submit" disabled={loading} className="w-full bg-emerald-500 text-white font-semibold py-3 rounded-xl">
            {loading ? 'Creation...' : 'Creer le groupe'}
          </button>
        </form>
      </div>
    </div>
  );
}
