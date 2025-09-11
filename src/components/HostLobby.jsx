export default function HostLobby({ gameId, stage, players, onStart }) {
  return (
    <div style={{ marginTop: 40, textAlign: 'center' }}>
      <p style={{ color: 'black', fontSize: '24px', fontWeight: 'bold', marginBottom: 8 }}>
        Game ID: <span style={{ color: '#F1641D' }}>{gameId}</span>
      </p>
      {stage && (
        <p style={{ color: 'black', fontSize: '16px', marginBottom: 20 }}>
          Stage: <strong>{stage}</strong>
        </p>
      )}
      <h3 style={{ color: 'black', fontSize: '20px', fontWeight: 'bold', marginBottom: 16 }}>
        Players joined
      </h3>
      {players.length === 0 ? (
        <p style={{ color: 'black', fontSize: '16px', marginBottom: 20 }}>No players yet</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, marginBottom: 20 }}>
          {players.map((p) => (
            <li 
              key={p.id} 
              style={{ 
                marginBottom: 8,
                color: 'black',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              {p.name}
            </li>
          ))}
        </ul>
      )}
      <button 
        onClick={onStart} 
        disabled={players.length === 0 || stage !== 'lobby'}
        style={{
          backgroundColor: players.length === 0 || stage !== 'lobby' ? '#ccc' : '#F1641D',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: players.length === 0 || stage !== 'lobby' ? 'not-allowed' : 'pointer'
        }}
      >
        Start Game
      </button>
    </div>
  );
}


