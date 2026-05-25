'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { API_URL } from '@/lib/config';

export default function GroupDetailPage() {
  const { code } = useParams();
  const router = useRouter();
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch(API_URL + '/groups/' + code, {
          headers: { 'Authorization': 'Bearer ' + token },
        });
        const data = await res.json();
        if (res.ok) {
          setGroup(data);
          setEditName(data.name);
          setEditDescription(data.description || '');
          if (data.status === 'ACTIVE') {
            router.push('/groups/' + code + '/dashboard');
            return;
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroup();
  }, [code]);

  const copyCode = () => {
    navigator.clipboard.writeText(code as string);
    setCopied(true);
    setShared(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareGroup = () => {
    const message = 'Rejoins mon groupe d epargne rotative sur Sodade ! Code : ' + code;
    setShared(true);
    if (navigator.share) {
      navigator.share({ title: 'Sodade', text: message });
    } else {
      navigator.clipboard.writeText(message);
      alert('Lien copié !');
    }
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(API_URL + '/groups/' + code, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({ name: editName, description: editDescription }),
      });
      if (res.ok) {
        const data = await res.json();
        setGroup(data);
        setEditing(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

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

  if (!group) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-red-400">Groupe introuvable</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">

        <div className="flex items-center gap-3 mb-6 mt-4">
          <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-gray-600 text-sm">
            ← Retour
          </button>
        </div>

        {/* Carte groupe */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 mr-3">
              {editing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full border border-emerald-300 rounded-lg px-3 py-2 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <input
                    type="text"
                    value={editDescription}
                    onChange={e => setEditDescription(e.target.value)}
                    placeholder="Description (optionnel)"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={saveEdit}
                      disabled={saving}
                      className="bg-emerald-500 text-white text-xs px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                    >
                      {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                    <button
                      onClick={() => { setEditing(false); setEditName(group.name); setEditDescription(group.description || ''); }}
                      className="bg-gray-100 text-gray-600 text-xs px-4 py-2 rounded-lg font-medium"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">{group.name}</h1>
                    {group.description && <p className="text-gray-500 text-sm mt-1">{group.description}</p>}
                  </div>
                  {!shared && (
                    <button
                      onClick={() => setEditing(true)}
                      className="text-gray-300 hover:text-emerald-500 transition mt-1"
                      title="Modifier"
                    >
                      ✏️
                    </button>
                  )}
                </div>
              )}
            </div>
            <span className={'text-xs px-3 py-1 rounded-full font-medium ' + (
              group.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
              group.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-600'
            )}>
              {group.status === 'ACTIVE' ? 'Actif' : group.status === 'PENDING' ? 'En attente' : group.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Montant</p>
              <p className="font-bold text-gray-900">{group.amount} CAD</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Fréquence</p>
              <p className="font-bold text-gray-900">{FREQUENCY_LABELS[group.frequency] || group.frequency}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Membres</p>
              <p className="font-bold text-gray-900">{group.memberships?.length} / {group.maxMembers}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Départ</p>
              <p className="font-bold text-gray-900">{new Date(group.startDate).toLocaleDateString('fr-CA')}</p>
            </div>
          </div>
        </div>

        {/* Code d'invitation */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-1">Code d'invitation</h2>
          <p className="text-xs text-gray-400 mb-4">Partage ce code pour inviter des membres</p>
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 text-center mb-4">
            <p className="text-3xl font-bold tracking-widest text-emerald-700 font-mono">{code}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={copyCode} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl text-sm transition">
              {copied ? '✓ Copié !' : 'Copier le code'}
            </button>
            <button onClick={shareGroup} className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-xl text-sm transition">
              Partager
            </button>
          </div>
          <button onClick={() => router.push('/groups/' + code + '/contract')} className="w-full mt-3 border border-emerald-500 text-emerald-600 hover:bg-emerald-50 font-medium py-3 rounded-xl text-sm transition">
            Voir le contrat
          </button>
        </div>

        <button onClick={() => router.push('/groups/' + code + '/rotation')} className="w-full mt-3 border border-emerald-500 text-emerald-600 hover:bg-emerald-50 font-medium py-3 rounded-xl text-sm transition bg-white rounded-2xl shadow-sm">
          Ordre de rotation
        </button>

        {/* Liste des membres */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mt-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Membres ({group.memberships?.length})</h2>
          <div className="space-y-3">
            {group.memberships?.map((m: any) => (
              <div key={m.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-700 font-bold text-sm">
                      {m.user?.firstName?.[0] || m.user?.phone?.slice(-2)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {m.user?.firstName ? m.user.firstName + ' ' + (m.user.lastName || '') : m.user?.phone}
                    </p>
                    <p className="text-xs text-gray-400">{m.role === 'ADMIN' ? 'Admin' : 'Membre'}</p>
                  </div>
                </div>
                <span className={'text-xs px-2 py-1 rounded-full ' + (m.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700')}>
                  {m.status === 'ACTIVE' ? 'Actif' : 'En attente'}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}