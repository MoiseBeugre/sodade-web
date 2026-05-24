'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Profile() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [otherPhone, setOtherPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleCreate = async () => {
    if (!firstName || !lastName) return;
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('${process.env.NEXT_PUBLIC_API_URL}/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          country_code: 'CA',
          interac_email: email || null,
          interac_phone: otherPhone || null,
        }),
      });
      if (res.ok) {
        router.push('/dashboard');
      } else {
        setError('Erreur lors de la création du profil.');
      }
    } catch {
      setError('Impossible de contacter le serveur.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-8">
          <span className="text-green-600 font-semibold text-sm">sodade</span>
          <span className="text-xs text-gray-400">3/3</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Votre profil</h1>
        <p className="text-sm text-gray-500 mb-6">Quelques infos pour commencer</p>

        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
            <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-xs text-gray-400 mb-1 block">Prénom *</label>
          <input
            type="text"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            placeholder="Votre prénom"
            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-green-500"
          />
        </div>

        <div className="mb-4">
          <label className="text-xs text-gray-400 mb-1 block">Nom *</label>
          <input
            type="text"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            placeholder="Votre nom"
            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-green-500"
          />
        </div>

        <div className="mb-4">
          <label className="text-xs text-gray-400 mb-1 block">
            Courriel <span className="text-gray-300">(optionnel)</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="exemple@courriel.com"
            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-green-500"
          />
        </div>

        <div className="mb-6">
          <label className="text-xs text-gray-400 mb-1 block">
            Autre téléphone <span className="text-gray-300">(optionnel)</span>
          </label>
          <input
            type="tel"
            value={otherPhone}
            onChange={e => setOtherPhone(e.target.value)}
            placeholder="+1 514 000 0000"
            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-green-500"
          />
          <p className="text-xs text-gray-300 mt-1">
            Peut être utilisé comme identifiant Interac
          </p>
        </div>

        {error && <p className="text-red-500 text-xs mb-4">{error}</p>}

        <button
          onClick={handleCreate}
          disabled={loading || !firstName || !lastName}
          className="w-full bg-green-500 text-white py-3 rounded-xl text-sm font-medium hover:bg-green-600 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Création...' : 'Commencer'}
        </button>
      </div>
    </div>
  );
}