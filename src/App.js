import logo from './logo.svg';
import './App.css';

function App() {
  const startGame = () => {
    console.log('Start Game');
  }
  return (
    <div className="App">
      <h1>Guess that admin</h1>
      <p>Guess the admin based on a fun fact about them</p>
      <button onClick={() => {startGame()}}>Start Game</button>
    </div>
  );
}

export default App;
