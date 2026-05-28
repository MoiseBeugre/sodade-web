'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function GroupDashboard() {
  const { code } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const payload = JSON.parse(atob(token!.split('.')[1]));
        setCurrentUserId(payload.sub);

        const groupRes = await fetch(`https://sodade-api-production.up.railway.app/groups/${code}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const groupData = await groupRes.json();

        const res = await fetch(`https://sodade-api-production.up.railway.app/groups/${code}/cycles/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dashboard = await res.json();
        if (res.ok) setData(dashboard);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [code]);

  const FREQUENCY_LABELS: any = {
    weekly: 'Hebdomadaire',
    biweekly: 'Bimensuel',
    monthly: 'Mensuel',
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">Chargement...</p>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-red-400">Erreur de chargement</p>
    </div>
  );

  const { group, members, activeCycle, myPayment, allCycles } = data;
  const isAdmin = members?.some((m: any) => m.user?.id === currentUserId && m.role === 'ADMIN');
  const totalAmount = Number(group.amount) * members?.length;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mt-4 mb-6">
          <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-gray-600 text-sm">
            ← Retour
          </button>
          {isAdmin && (
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">👑 Admin</span>
          )}
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-1">{group.name}</h1>
        <p className="text-gray-500 text-sm mb-6">{FREQUENCY_LABELS[group.frequency]} · {group.amount} CAD/membre</p>

        {/* Pas encore de cycles — guider vers la rotation */}
        {!activeCycle && allCycles?.length === 0 && isAdmin && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-4">
            <p className="text-sm font-medium text-yellow-800 mb-1">Le groupe n'a pas encore démarré</p>
            <p className="text-xs text-yellow-600 mb-3">Configure l'ordre de rotation puis lance les cycles.</p>
            <button
              onClick={() => router.push(`/groups/${code}/rotation`)}
              className="text-xs px-4 py-2 rounded-xl bg-yellow-500 text-white font-medium hover:bg-yellow-600 transition"
            >
              Configurer la rotation →
            </button>
          </div>
        )}

        {/* Cycle actif */}
        {activeCycle && (
          <div className="bg-emerald-500 rounded-2xl p-6 mb-4 text-white">
            <p className="text-emerald-100 text-xs mb-1">Cycle {activeCycle.cycleNumber} en cours</p>
            <h2 className="text-lg font-bold mb-1">
              {activeCycle.recipient?.firstName
                ? `${activeCycle.recipient.firstName} ${activeCycle.recipient.lastName || ''}`
                : activeCycle.recipient?.phone} reçoit
            </h2>
            <p className="text-2xl font-bold mb-3">{totalAmount} CAD</p>
            <div className="flex justify-between text-xs text-emerald-100">
              <span>Du {new Date(activeCycle.startDate).toLocaleDateString('fr-CA')}</span>
              <span>Au {new Date(activeCycle.endDate).toLocaleDateString('fr-CA')}</span>
            </div>
          </div>
        )}

        {/* Mon statut de paiement */}
        {myPayment && myPayment.status !== 'EXEMPT' && (
          <div className={`rounded-2xl p-4 mb-4 ${
            myPayment.status === 'PAID' ? 'bg-emerald-50 border border-emerald-200' : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">Mon paiement</p>
                <p className="text-xs text-gray-500">{group.amount} CAD à verser via Interac</p>
              </div>
              {myPayment.status === 'PAID' ? (
                <span className="text-xs px-3 py-1 rounded-full font-medium bg-emerald-100 text-emerald-700">
                  ✓ Payé
                </span>
              ) : (
                <button
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem('access_token');
                      const res = await fetch(`https://sodade-api-production.up.railway.app/groups/${code}/cycles/pay`, {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      const updated = await res.json();
                      if (res.ok) setData(updated);
                      else alert(updated.message);
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  className="text-xs px-3 py-2 rounded-xl font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition"
                >
                  Confirmer paiement
                </button>
              )}
            </div>
          </div>
        )}

       {myPayment?.status === 'EXEMPT' && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">🎉 C'est ton tour de recevoir !</p>
                <p className="text-xs text-blue-500 mt-1">Tu reçois {totalAmount} CAD ce cycle</p>
              </div>
              {activeCycle?.payments?.filter((p: any) => p.status !== 'EXEMPT').every((p: any) => p.status === 'PAID') && (
                <button
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem('access_token');
                      const res = await fetch(`https://sodade-api-production.up.railway.app/groups/${code}/cycles/received`, {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      const updated = await res.json();
                      if (res.ok) setData(updated);
                      else alert(updated.message);
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  className="text-xs px-3 py-2 rounded-xl font-medium bg-blue-500 text-white hover:bg-blue-600 transition"
                >
                  Confirmer réception
                </button>
              )}
            </div>
          </div>
        )}

        {/* Statut des paiements du cycle actif */}
        {activeCycle && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
              Paiements ({activeCycle.payments?.filter((p: any) => p.status === 'PAID').length}/{activeCycle.payments?.filter((p: any) => p.status !== 'EXEMPT').length})
            </h2>
            <div className="space-y-3">
              {activeCycle.payments?.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-600">
                        {p.payer?.firstName?.[0] || p.payer?.phone?.slice(-2)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-700">
                      {p.payer?.firstName ? `${p.payer.firstName} ${p.payer.lastName || ''}` : p.payer?.phone}
                      {p.payerId === currentUserId && <span className="text-xs text-gray-400 ml-1">(moi)</span>}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    p.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                    p.status === 'EXEMPT' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {p.status === 'PAID' ? '✓ Payé' : p.status === 'EXEMPT' ? 'Bénéficiaire' : 'En attente'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ordre de rotation complet */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Ordre de rotation</h2>
          <div className="space-y-3">
            {allCycles?.map((cycle: any) => (
              <div key={cycle.id} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  cycle.status === 'ACTIVE' ? 'bg-emerald-500 text-white' :
                  cycle.status === 'COMPLETED' ? 'bg-gray-300 text-gray-600' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {cycle.cycleNumber}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {cycle.recipient?.firstName
                      ? `${cycle.recipient.firstName} ${cycle.recipient.lastName || ''}`
                      : cycle.recipient?.phone}
                    {cycle.recipientId === currentUserId && <span className="text-xs text-emerald-600 ml-1">(moi)</span>}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(cycle.startDate).toLocaleDateString('fr-CA')}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  cycle.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                  cycle.status === 'COMPLETED' ? 'bg-gray-100 text-gray-500' :
                  'bg-gray-50 text-gray-400'
                }`}>
                  {cycle.status === 'ACTIVE' ? 'En cours' :
                   cycle.status === 'COMPLETED' ? 'Terminé' : 'À venir'}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}