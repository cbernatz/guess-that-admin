export default function VotingScreen({ roundIndex, fact, players, isHost, hasVoted, onVote, onReveal }) {
  return (
    <div style={{ marginTop: 40, textAlign: 'center' }}>
      <p style={{ color: '#F1641D', fontSize: '20px', fontWeight: 'bold', marginBottom: 16 }}>
        Round {roundIndex + 1}
      </p>
      <h3 style={{ color: 'black', fontSize: '22px', fontWeight: 'bold', marginBottom: 20 }}>
        Whose fun fact is this?
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
      {!isHost ? (
        <div>
          {hasVoted ? (
            <p style={{ color: '#F1641D', fontSize: '18px', fontWeight: 'bold', marginTop: 20 }}>
              Vote submitted! Waiting for other players...
            </p>
          ) : (
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 20 }}>
              {players.map((p) => (
                <button 
                  key={p.id} 
                  onClick={() => onVote(p.id)} 
                  style={{
                    backgroundColor: 'white',
                    color: 'black',
                    border: '2px solid black',
                    padding: '12px 20px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <p style={{ color: 'black', fontSize: '18px', fontWeight: 'bold', marginBottom: 16 }}>
            Waiting for votes...
          </p>
          <button 
            onClick={onReveal}
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
            Reveal
          </button>
        </div>
      )}
    </div>
  );
}


