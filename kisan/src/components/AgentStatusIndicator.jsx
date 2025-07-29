import React from 'react';

const statusStyles = {
  idle: { background: '#e5e7eb', color: '#374151' },
  listening: { background: '#16a34a', color: 'white', animation: 'pulse 1s infinite' },
  thinking: { background: '#f59e42', color: 'white', animation: 'pulse 1s infinite' },
  speaking: { background: '#2563eb', color: 'white', animation: 'pulse 1s infinite' },
};

const statusText = {
  idle: 'Idle',
  listening: 'Listening...',
  thinking: 'Thinking...',
  speaking: 'Speaking...'
};

export default function AgentStatusIndicator({ status }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 88, // 64px mic button + 24px margin
      right: 32,
      zIndex: 9999,
      minWidth: 90,
      minHeight: 32,
      borderRadius: 18,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 500,
      fontSize: 14,
      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
      padding: '0 16px',
      transition: 'background 0.2s',
      ...statusStyles[status] || statusStyles.idle
    }}>
      <span style={{ marginRight: 6, fontSize: 16 }}>
        {status === 'listening' && '🎤'}
        {status === 'thinking' && '💡'}
        {status === 'speaking' && '🗣️'}
        {status === 'idle' && '🤖'}
      </span>
      {statusText[status] || 'Idle'}
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
          70% { box-shadow: 0 0 0 10px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
      `}</style>
    </div>
  );
} 