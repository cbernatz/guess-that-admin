export default function JoinEnterId({ code, onChange, onContinue, onBack }) {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'center', marginTop: 40 }}>
      <input
        placeholder="Enter code"
        value={code}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: '12px 16px',
          fontSize: '16px',
          border: '2px solid black',
          backgroundColor: 'white',
          color: 'black',
          textAlign: 'center',
          textTransform: 'uppercase',
          fontWeight: 'bold'
        }}
        maxLength={4}
      />
      <button 
        onClick={onContinue}
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
        Continue
      </button>
    </div>
  );
}


