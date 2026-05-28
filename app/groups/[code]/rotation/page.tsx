'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

const ROTATION_MODES = [
  { value: 'FIRST_COME', label: 'Premier arrivé premier servi', description: 'Chaque membre choisit sa position' },
  { value: 'MANUAL', label: 'Attribution manuelle', description: "L'admin assigne les positions" },
  { value: 'RANDOM', label: 'Aléatoire', description: 'Le système tire au sort' },
];

export default function RotationPage() {
  const { code } = useParams();
  const router = useRouter();
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [selectedMode, setSelectedMode] = useState('FIRST_COME');

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch(`https://sodade-api-production.up.railway.app/groups/${code}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setGroup(data);
          setSelectedMode(data.rotationMode || 'FIRST_COME');
        }
        const payload = JSON.parse(atob(token!.split('.')[1]));
        setCurrentUserId(payload.sub);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroup();
  }, [code]);

  const isAdmin = group?.memberships?.some((m: any) => m.user?.id === currentUserId && m.role === 'ADMIN');

  const handleSetMode = async (mode: string) => {
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`https://sodade-api-production.up.railway.app/groups/${code}/rotation-mode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setGroup(data);
      setSelectedMode(mode);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSetPosition = async (targetUserId: string, position: number) => {
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`https://sodade-api-production.up.railway.app/groups/${code}/position`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ targetUserId, position }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setGroup(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLock = async () => {
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`https://sodade-api-production.up.railway.app/groups/${code}/lock-rotation`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setGroup(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const activeMembers = group?.memberships?.filter((m: any) => m.status === 'ACTIVE') || [];
  const allPositioned = activeMembers.every((m: any) => m.position !== null);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">Chargement...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">

        <div className="flex items-center gap-3 mb-6 mt-4">
          <button onClick={() => router.push(`/groups/${code}`)} className="text-gray-400 hover:text-gray-600 text-sm">
            ← Retour
          </button>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-1">Ordre de rotation</h1>
        <p className="text-gray-500 text-sm mb-6">Qui reçoit en premier ?</p>

        {/* Statut */}
        {group?.rotationLocked && (
          <div className="bg-emerald-50 text-emerald-700 text-sm rounded-xl px-4 py-3 mb-4 text-center font-medium">
            🔒 Ordre de rotation verrouillé
          </div>
        )}

        {/* Mode de rotation — admin seulement */}
        {isAdmin && !group?.rotationLocked && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Mode de rotation</h2>
            <div className="space-y-3">
              {ROTATION_MODES.map(m => (
                <button
                  key={m.value}
                  onClick={() => handleSetMode(m.value)}
                  disabled={saving}
                  className={`w-full text-left p-4 rounded-xl border-2 transition ${
                    selectedMode === m.value
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <p className={`text-sm font-medium ${selectedMode === m.value ? 'text-emerald-700' : 'text-gray-800'}`}>
                    {m.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{m.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Liste des membres avec positions */}
        {selectedMode !== 'RANDOM' && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
              Positions ({activeMembers.filter((m: any) => m.position).length}/{activeMembers.length})
            </h2>
            <div className="space-y-3">
              {activeMembers
                .sort((a: any, b: any) => (a.position || 999) - (b.position || 999))
                .map((m: any) => {
                  const isSelf = m.user?.id === currentUserId;
                  const canChoose = !group?.rotationLocked && (
                    (selectedMode === 'FIRST_COME' && isSelf && !m.position) ||
                    (selectedMode === 'MANUAL' && isAdmin)
                  );

                  return (
                    <div key={m.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          m.position ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {m.position || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {m.user?.firstName ? `${m.user.firstName} ${m.user.lastName || ''}` : m.user?.phone}
                            {isSelf && <span className="text-xs text-emerald-600 ml-1">(moi)</span>}
                          </p>
                          <p className="text-xs text-gray-400">{m.role === 'ADMIN' ? 'Admin' : 'Membre'}</p>
                        </div>
                      </div>

                      {canChoose && (
                        <select
                          onChange={e => handleSetPosition(m.user.id, parseInt(e.target.value))}
                          defaultValue=""
                          className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-500"
                        >
                          <option value="" disabled>Choisir</option>
                          {Array.from({ length: activeMembers.length }, (_, i) => i + 1)
                            .filter(pos => !activeMembers.find((mm: any) => mm.position === pos && mm.user?.id !== m.user?.id))
                            .map(pos => (
                              <option key={pos} value={pos}>Position {pos}</option>
                            ))}
                        </select>
                      )}

                      {m.position && !canChoose && (
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                          #{m.position}
                        </span>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Mode aléatoire — résultat */}
        {selectedMode === 'RANDOM' && group?.rotationLocked && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Ordre tiré au sort</h2>
            <div className="space-y-3">
              {activeMembers
                .sort((a: any, b: any) => (a.position || 999) - (b.position || 999))
                .map((m: any) => (
                  <div key={m.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm">
                      {m.position}
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {m.user?.firstName ? `${m.user.firstName} ${m.user.lastName || ''}` : m.user?.phone}
                      {m.user?.id === currentUserId && <span className="text-xs text-emerald-600 ml-1">(moi)</span>}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>
        )}

        {/* Bouton verrouiller — admin seulement */}
        {isAdmin && !group?.rotationLocked && allPositioned && selectedMode !== 'RANDOM' && (
          <button
            onClick={handleLock}
            disabled={saving}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
          >
            {saving ? 'Verrouillage...' : '🔒 Verrouiller l\'ordre'}
          </button>
        )}

        {/* Bouton déverrouiller — admin seulement, si cycles pas encore démarrés */}
        {isAdmin && group?.rotationLocked && group?.status === 'PENDING' && selectedMode !== 'RANDOM' && (
          <button
            onClick={async () => {
              setSaving(true);
              setError('');
              try {
                const token = localStorage.getItem('access_token');
                const res = await fetch(`https://sodade-api-production.up.railway.app/groups/${code}/unlock-rotation`, {
                  method: 'POST',
                  headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message);
                setGroup(data);
              } catch (err: any) {
                setError(err.message);
              } finally {
                setSaving(false);
              }
            }}
            disabled={saving}
            className="w-full mb-3 border border-red-300 text-red-500 hover:bg-red-50 font-medium py-3 rounded-xl text-sm transition disabled:opacity-50"
          >
            {saving ? 'Déverrouillage...' : '🔓 Déverrouiller l\'ordre'}
          </button>
        )}


{isAdmin && group?.rotationLocked && (
          <button
            onClick={async () => {
              setSaving(true);
              try {
                const token = localStorage.getItem('access_token');
                const res = await fetch(`https://sodade-api-production.up.railway.app/groups/${code}/cycles/initialize`, {
                  method: 'POST',
                  headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message);
                router.push(`/groups/${code}/dashboard`);
              } catch (err: any) {
                setError(err.message);
              } finally {
                setSaving(false);
              }
            }}
            disabled={saving}
            className="w-full mt-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
          >
            {saving ? 'Démarrage...' : '🚀 Démarrer les cycles'}
          </button>
        )}


      </div>
    </div>
  );
}