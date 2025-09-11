export default function RevealScreen({ roundIndex, fact, players, currentPlayerId, votesThisRound, isHost, onNextRound }) {
  return (
    <div style={{ marginTop: 40, textAlign: 'center' }}>
      <p style={{ color: '#F1641D', fontSize: '20px', fontWeight: 'bold', marginBottom: 16 }}>
        Round {roundIndex + 1}
      </p>
      <h3 style={{ color: 'black', fontSize: '22px', fontWeight: 'bold', marginBottom: 20 }}>
        The fun fact was:
      </h3>
      <blockquote style={{ 
        maxWidth: 520, 
        margin: '20px auto', 
        padding: '20px',
        border: '2px solid black',
        backgroundColor: 'white',
        color: 'black',
        fontSize: '18px',
        fontStyle: 'italic'
      }}>
        {fact || '(No fact)'}
      </blockquote>
      <p style={{ color: 'black', fontSize: '20px', fontWeight: 'bold', marginBottom: 20 }}>
        It was <span style={{ color: '#F1641D' }}>
          {(players.find((p) => p.id === currentPlayerId)?.name) || 'Unknown'}
        </span>!
      </p>
      <div style={{ maxWidth: 480, margin: '20px auto' }}>
        <h4 style={{ color: 'black', fontSize: '18px', fontWeight: 'bold', marginBottom: 16 }}>
          Votes
        </h4>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {players.map((p) => {
            const count = votesThisRound.filter((v) => v.guessPlayerId === p.id).length;
            return (
              <li 
                key={p.id} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: 8,
                  padding: '8px 16px',
                  border: p.id === currentPlayerId ? '2px solid #F1641D' : '1px solid black',
                  backgroundColor: 'white',
                  color: 'black',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                <span>{p.name}</span>
                <span>{count}</span>
              </li>
            );
          })}
        </ul>
      </div>
      {isHost && (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button 
            onClick={onNextRound}
            style={{
              backgroundColor: '#F1641D',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Next Round
          </button>
        </div>
      )}
    </div>
  );
}


