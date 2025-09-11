export default function JoinEnterFact({ gameId, name, fact, onChangeName, onChangeFact, onSubmit, onBack, submitted }) {
  return (
    <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      <p style={{ color: 'black', fontSize: '18px', fontWeight: 'bold' }}>
        Joining game: <span style={{ color: '#F1641D' }}>{gameId}</span>
      </p>
      {!submitted ? (
        <>
          <input
            placeholder="Your name"
            value={name}
            onChange={(e) => onChangeName(e.target.value)}
            style={{
              padding: '12px 16px',
              fontSize: '16px',
              border: '2px solid black',
              backgroundColor: 'white',
              color: 'black',
              width: '280px',
              fontWeight: 'bold'
            }}
          />
          <input
            placeholder="Your fun fact"
            value={fact}
            onChange={(e) => onChangeFact(e.target.value)}
            style={{
              padding: '12px 16px',
              fontSize: '16px',
              border: '2px solid black',
              backgroundColor: 'white',
              color: 'black',
              width: '280px',
              fontWeight: 'bold'
            }}
          />
          <div style={{ display: 'flex', gap: 16 }}>
            <button 
              onClick={onSubmit}
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
              Join Game
            </button>
            <button 
              onClick={onBack}
              style={{
                backgroundColor: 'white',
                color: 'black',
                border: '2px solid black',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Back
            </button>
          </div>
        </>
      ) : (
        <p style={{ color: 'black', fontSize: '18px', fontWeight: 'bold' }}>
          Submission received. Waiting for host to start...
        </p>
      )}
    </div>
  );
}


