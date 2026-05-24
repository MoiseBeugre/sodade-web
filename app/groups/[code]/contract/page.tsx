'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ContractPage() {
  const { code } = useParams();
  const router = useRouter();
  const [group, setGroup] = useState<any>(null);
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');

        const groupRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/groups/${code}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const groupData = await groupRes.json();
        if (!groupRes.ok) throw new Error(groupData.message);
        setGroup(groupData);

        const contractRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/groups/${groupData.id}/contract`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const contractData = await contractRes.json();
        if (!contractRes.ok) throw new Error(contractData.message);
        setContract(contractData);

        const payload = JSON.parse(atob(token!.split('.')[1]));
        setUserId(payload.sub);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [code]);

  const handleSign = async () => {
    setSigning(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/groups/${group.id}/contract/sign`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const contractRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/groups/${group.id}/contract`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const contractData = await contractRes.json();
      setContract(contractData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSigning(false);
    }
  };

  const hasSigned = contract?.signatures?.some((s: any) => s.userId === userId);
  const totalMembers = group?.memberships?.filter((m: any) => m.status === 'ACTIVE').length || 0;
  const totalSigned = contract?.signatures?.length || 0;

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">Chargement...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">

        <div className="flex items-center gap-3 mb-6 mt-4">
          <button
            onClick={() => router.push(`/groups/${code}`)}
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            ← Retour
          </button>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-1">Contrat du groupe</h1>
        <p className="text-gray-500 text-sm mb-6">
          {totalSigned}/{totalMembers} membres ont signé
        </p>

        {/* Barre de progression */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Signatures</span>
            <span>{totalSigned}/{totalMembers}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all"
              style={{ width: `${totalMembers > 0 ? (totalSigned / totalMembers) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Contenu du contrat */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
          <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
            {contract?.content}
          </pre>
        </div>

        {/* Signatures */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Signatures ({totalSigned})</h2>
          <div className="space-y-2">
            {group?.memberships?.filter((m: any) => m.status === 'ACTIVE').map((m: any) => {
              const signed = contract?.signatures?.find((s: any) => s.userId === m.user.id);
              return (
                <div key={m.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-emerald-700 text-xs font-bold">
                        {m.user?.firstName?.[0] || m.user?.phone?.slice(-2)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-700">
                      {m.user?.firstName ? `${m.user.firstName} ${m.user.lastName || ''}` : m.user?.phone}
                    </span>
                  </div>
                  {signed ? (
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">✓ Signé</span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">En attente</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>
        )}

        {!hasSigned && (
          <button
            onClick={handleSign}
            disabled={signing}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
          >
            {signing ? 'Signature en cours...' : 'Signer le contrat'}
          </button>
        )}

        {hasSigned && contract?.status !== 'SIGNED' && (
          <div className="bg-emerald-50 text-emerald-700 text-sm rounded-xl px-4 py-3 text-center">
            ✓ Tu as signé — en attente des autres membres
          </div>
        )}

        {contract?.status === 'SIGNED' && (
          <div className="bg-emerald-500 text-white text-sm rounded-xl px-4 py-3 text-center font-semibold">
            🎉 Contrat signé par tous — groupe actif !
          </div>
        )}

      </div>
    </div>
  );
}