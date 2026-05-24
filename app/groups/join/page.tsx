'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function JoinGroupPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`http://localhost:3000/groups/${code.toUpperCase()}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur');

      router.push(`/groups/${code.toUpperCase()}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">

        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-gray-600 text-sm mb-6 flex items-center gap-1"
        >
          ← Retour
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Rejoindre un groupe</h1>
        <p className="text-gray-500 text-sm mb-8">Entre le code partagé par l'administrateur</p>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code du groupe
            </label>
            <input
              type="text"
              required
              maxLength={6}
              placeholder="Ex: SFCC8F"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-center text-2xl font-bold tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Rejoindre le groupe'}
          </button>

        </form>
      </div>
    </div>
  );
}