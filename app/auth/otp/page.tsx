'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Otp() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phone, setPhone] = useState('');
  const router = useRouter();

  useEffect(() => {
    const p = sessionStorage.getItem('phone');
    if (!p) router.push('/auth/login');
    else setPhone(p);
  }, [router]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById('otp-' + (index + 1))?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('${process.env.NEXT_PUBLIC_API_URL}/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '+1' + phone, code }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        if (data.is_new_user) {
          router.push('/auth/profile');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(data.message || 'Code incorrect.');
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
          <button onClick={() => router.push('/auth/login')} className="text-gray-400 text-sm">← Retour</button>
          <span className="text-xs text-gray-400">2/3</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Code de vérification</h1>
        <p className="text-sm text-gray-500 mb-6">Envoyé au +1 {phone}</p>
        <div className="flex gap-2 justify-center mb-4">
          {otp.map((digit, i) => (
            <input
              key={i}
              id={'otp-' + i}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              className={'w-11 h-12 text-center text-lg font-semibold border rounded-xl focus:outline-none focus:border-green-500 bg-gray-50 text-gray-900 ' + (digit ? 'border-green-500' : 'border-gray-200')}
            />
          ))}
        </div>
        {error && <p className="text-red-500 text-xs mb-4 text-center">{error}</p>}
        <button
          onClick={handleVerify}
          disabled={loading || otp.join('').length !== 6}
          className="w-full bg-green-500 text-white py-3 rounded-xl text-sm font-medium hover:bg-green-600 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Vérification...' : 'Vérifier'}
        </button>
        <button className="w-full text-gray-400 text-sm mt-3 py-2">
          Renvoyer le code
        </button>
      </div>
    </div>
  );
}