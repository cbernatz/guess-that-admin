export default function CompleteScreen({ winners, scoreboard }) {
  return (
    <div style={{ marginTop: 40, textAlign: 'center' }}>
      <h3 style={{ color: 'black', fontSize: '24px', fontWeight: 'bold', marginBottom: 20 }}>
        Game Complete
      </h3>
      {winners.length > 0 ? (
        <p style={{ color: 'black', fontSize: '20px', fontWeight: 'bold', marginBottom: 30 }}>
          Winner{winners.length > 1 ? 's' : ''}: 
          <span style={{ color: '#F1641D' }}> {winners.join(', ')}</span>
        </p>
      ) : (
        <p style={{ color: 'black', fontSize: '18px', marginBottom: 30 }}>
          No winner determined
        </p>
      )}
      <div style={{ maxWidth: 420, margin: '20px auto', textAlign: 'left' }}>
        <h4 style={{ color: 'black', fontSize: '20px', fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>
          Scoreboard
        </h4>
        {scoreboard.length === 0 ? (
          <p style={{ color: 'black', fontSize: '16px', textAlign: 'center' }}>No scores</p>
        ) : (
          <ol style={{ padding: 0, listStyle: 'none' }}>
            {scoreboard.map((entry, index) => (
              <li 
                key={entry.name} 
                style={{ 
                  marginBottom: 8,
                  padding: '12px 16px',
                  border: index === 0 ? '2px solid #F1641D' : '1px solid black',
                  backgroundColor: 'white',
                  color: 'black',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>{index + 1}. {entry.name}</span>
                <span style={{ color: '#F1641D' }}>{entry.score}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}


