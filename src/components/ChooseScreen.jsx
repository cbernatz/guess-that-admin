export default function ChooseScreen({ onCreate, onJoin }) {
  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'center', justifyContent: 'center', marginTop: 40 }}>
      <button 
        onClick={onCreate}
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
        Create Game
      </button>
      <span style={{ color: 'black', fontSize: '16px' }}>or</span>
      <button 
        onClick={onJoin}
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
        Join Game
      </button>
    </div>
  );
}


