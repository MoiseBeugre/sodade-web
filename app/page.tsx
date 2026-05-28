'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0d1f0f 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Georgia', serif",
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Cercles décoratifs */}
      <div style={{
        position: 'absolute', top: '-100px', right: '-100px',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-80px', left: '-80px',
        width: '300px', height: '300px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Logo */}
      <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
        <span style={{
          fontSize: '2.8rem',
          fontWeight: '700',
          color: '#22c55e',
          letterSpacing: '-1px',
        }}>sodade</span>
        <p style={{
          color: '#6b7280',
          fontSize: '0.95rem',
          marginTop: '0.3rem',
          letterSpacing: '0.05em',
        }}>L'épargne rotative, réinventée</p>
      </div>

      {/* Card */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '1.5rem',
        padding: '2.5rem 2rem',
        width: '100%',
        maxWidth: '380px',
        textAlign: 'center',
        backdropFilter: 'blur(10px)',
      }}>
        <h1 style={{
          color: '#f9fafb',
          fontSize: '1.5rem',
          fontWeight: '600',
          marginBottom: '0.5rem',
        }}>Bienvenue 👋</h1>
        <p style={{
          color: '#9ca3af',
          fontSize: '0.9rem',
          marginBottom: '2rem',
          lineHeight: '1.6',
        }}>
          Gérez vos épargnes rotative en toute confiance, où que vous soyez.
        </p>

        <button
          onClick={() => router.push('/auth/login')}
          style={{
            width: '100%',
            padding: '0.85rem',
            background: '#22c55e',
            color: '#000',
            border: 'none',
            borderRadius: '0.75rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '0.75rem',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#16a34a')}
          onMouseLeave={e => (e.currentTarget.style.background = '#22c55e')}
        >
          Connexion
        </button>

        <button
          onClick={() => router.push('/auth/login')}
          style={{
            width: '100%',
            padding: '0.85rem',
            background: 'transparent',
            color: '#22c55e',
            border: '1px solid #22c55e',
            borderRadius: '0.75rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(34,197,94,0.08)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          S'inscrire
        </button>
      </div>

      <p style={{ color: '#374151', fontSize: '0.75rem', marginTop: '2rem' }}>
        100% gratuit · Sécurisé · pour toutes les communautés
      </p>
    </main>
  );
}