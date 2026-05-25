'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/config';

export default function Dashboard() {
  const router = useRouter();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) { router.push('/auth/login'); return; }

        const profileRes = await fetch(`${API_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUserName(profileData.user?.first_name || '');
        }

        const res = await fetch(`${API_URL}/groups`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setGroups(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  const FREQUENCY_LABELS: any = {
    weekly: 'Hebdo',
    biweekly: 'Bimensuel',
    monthly: 'Mensuel',
  };

  const STATUS_CONFIG: any = {
    PENDING: { label: 'En attente', bg: 'bg-yellow-100', text: 'text-yellow-700' },
    ACTIVE: { label: 'Actif', bg: 'bg-emerald-100', text: 'text-emerald-700' },
    COMPLETED: { label: 'Terminé', bg: 'bg-gray-100', text: 'text-gray-600' },
    CANCELLED: { label: 'Annulé', bg: 'bg-red-100', text: 'text-red-600' },
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">Chargement...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mt-6 mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {userName ? `Bonjour, ${userName} 👋` : 'Bonjour 👋'}
            </h1>
            <p className="text-sm text-gray-500">Vos groupes d'épargne rotative</p>
          </div>
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
            <span className="text-emerald-700 font-bold">{userName?.[0]?.toUpperCase() || 'S'}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button onClick={() => router.push('/groups/create')} className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-xl text-sm transition">+ Créer un groupe</button>
          <button onClick={() => router.push('/groups/join')} className="bg-white border border-emerald-500 text-emerald-600 hover:bg-emerald-50 font-medium py-3 rounded-xl text-sm transition">Rejoindre</button>
        </div>

        {groups.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🤝</span>
            </div>
            <p className="text-gray-700 font-medium mb-1">Aucun groupe pour l'instant</p>
            <p className="text-gray-400 text-sm">Créez ou rejoignez un groupe pour commencer</p>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map((group: any) => {
              const status = STATUS_CONFIG[group.status] || STATUS_CONFIG.PENDING;
              const myRole = group.memberships?.[0]?.role;
              const memberCount = group._count?.memberships || 0;
              return (
                <div key={group.id} onClick={() => router.push(`/groups/${group.code}`)} className="bg-white rounded-2xl shadow-sm p-5 cursor-pointer hover:shadow-md transition border border-transparent hover:border-emerald-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h2 className="font-bold text-gray-900">{group.name}</h2>
                      {group.description && <p className="text-xs text-gray-400 mt-0.5">{group.description}</p>}
                      <div className="flex justify-end mt-3">
                        <span className="text-xs text-emerald-600 font-medium">Voir le groupe →</span>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${status.bg} ${status.text}`}>{status.label}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-50 rounded-xl p-2 text-center">
                      <p className="text-xs text-gray-400">Montant</p>
                      <p className="text-sm font-bold text-gray-900">{group.amount} $</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-2 text-center">
                      <p className="text-xs text-gray-400">Fréquence</p>
                      <p className="text-sm font-bold text-gray-900">{FREQUENCY_LABELS[group.frequency] || group.frequency}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-2 text-center">
                      <p className="text-xs text-gray-400">Membres</p>
                      <p className="text-sm font-bold text-gray-900">{memberCount}/{group.maxMembers}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-400">{myRole === 'ADMIN' ? '👑 Admin' : '👤 Membre'}</span>
                    <span className="text-xs text-gray-400">Départ : {new Date(group.startDate).toLocaleDateString('fr-CA')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}