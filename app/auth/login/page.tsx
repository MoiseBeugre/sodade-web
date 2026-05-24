'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSendOtp = async () => {
    if (!phone) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '+1' + phone, country_code: 'CA' }),
      });
      if (res.ok) {
        sessionStorage.setItem('phone', phone);
        router.push('/auth/otp');
      } else {
        setError('Numéro invalide. Vérifiez et réessayez.');
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
          <span className="text-xs text-gray-400">1/3</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Votre numéro</h1>
        <p className="text-sm text-gray-500 mb-6">Pour recevoir un code de vérification</p>
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200 mb-4">
          <span>🇨🇦</span>
          <span className="text-sm text-gray-700">+1</span>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
            placeholder="514 555 1234"
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
          />
        </div>
        {error && <p className="text-red-500 text-xs mb-4">{error}</p>}
        <button
          onClick={handleSendOtp}
          disabled={loading || !phone}
          className="w-full bg-green-500 text-white py-3 rounded-xl text-sm font-medium hover:bg-green-600 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Envoi...' : 'Recevoir le code'}
        </button>
        <p className="text-xs text-gray-400 text-center mt-4">
          En continuant, vous acceptez nos CGU
        </p>
      </div>
    </div>
  );
}