import './App.css';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { db } from './firebase';
import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, runTransaction, setDoc, updateDoc, where } from 'firebase/firestore';
import ChooseScreen from './components/ChooseScreen';
import JoinEnterId from './components/JoinEnterId';
import JoinEnterFact from './components/JoinEnterFact';
import HostLobby from './components/HostLobby';
import VotingScreen from './components/VotingScreen';
import RevealScreen from './components/RevealScreen';
import CompleteScreen from './components/CompleteScreen';

// Constants and helpers
const GAME_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/1/0
const GAME_CODE_LENGTH = 4;

function generateGameCode() {
  return Array.from({ length: GAME_CODE_LENGTH }, () => (
    GAME_CODE_ALPHABET[Math.floor(Math.random() * GAME_CODE_ALPHABET.length)]
  )).join('');
}

function normalizeGameCode(input) {
  return (input || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, GAME_CODE_LENGTH);
}

function createStableClientId() {
  try {
    let id = localStorage.getItem('gta_client_id') || '';
    if (!id) {
      const maybeUUID = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : '';
      id = maybeUUID || `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem('gta_client_id', id);
    }
    return id;
  } catch (_) {
    return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
}

function computeScoreboardEntries(allVotes, players) {
  const nameToScore = new Map();
  for (const v of allVotes) {
    const correctPlayer = players[v.roundIndex];
    if (!correctPlayer) continue;
    const isCorrect = v.guessPlayerId === correctPlayer.id;
    if (!v.voterName) continue;
    if (!nameToScore.has(v.voterName)) nameToScore.set(v.voterName, 0);
    if (isCorrect) nameToScore.set(v.voterName, nameToScore.get(v.voterName) + 1);
  }
  const entries = Array.from(nameToScore.entries()).map(([name, score]) => ({ name, score }));
  entries.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  const top = entries.length ? entries[0].score : 0;
  const winners = entries.filter((e) => e.score === top).map((e) => e.name);
  return { entries, winners };
}

function App() {
  const [gameIdInput, setGameIdInput] = useState('');
  const [displayGameId, setDisplayGameId] = useState('');
  const [status, setStatus] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [factInput, setFactInput] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState([]);
  const [stage, setStage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [flowStep, setFlowStep] = useState('choose'); // choose | join-enter-id | join-enter-fact | host-lobby
  const [roundIndex, setRoundIndex] = useState(0);
  const [currentFact, setCurrentFact] = useState('');
  const [currentPlayerId, setCurrentPlayerId] = useState('');
  const [votesThisRound, setVotesThisRound] = useState([]);
  const [scoreboard, setScoreboard] = useState([]);
  const [winnerNames, setWinnerNames] = useState([]);
  const [clientId, setClientId] = useState('');
  const hasVotedThisRound = useMemo(() => {
    if (!clientId) return false;
    return votesThisRound.some((v) => v.voterId === clientId);
  }, [votesThisRound, clientId]);
  const gamesCollection = useMemo(() => collection(db, 'games'), []);
  

  const createGame = useCallback(async () => {
    try {
      setStatus('Creating game...');
      // Generate 4-char uppercase code and ensure no collision
      let code = '';
      // Try a few times to avoid rare collisions
      for (let i = 0; i < 10; i++) {
        const candidate = generateGameCode();
        const candidateRef = doc(db, 'games', candidate);
        const snap = await getDoc(candidateRef);
        if (!snap.exists()) {
          code = candidate;
          break;
        }
      }
      if (!code) {
        setStatus('Failed to allocate code, try again');
        return;
      }
      const gameRef = doc(db, 'games', code);
      await setDoc(gameRef, {
        createdAt: Date.now(),
        stage: 'lobby',
      });
      setDisplayGameId(code);
      setIsHost(true);
      setSubmitted(false);
      setStatus('Game created');
      setFlowStep('host-lobby');
    } catch (error) {
      console.error(error);
      setStatus('Failed to create game');
    }
  }, [gamesCollection]);

  const proceedToJoinFact = useCallback(async () => {
    try {
      const code = normalizeGameCode(gameIdInput);
      if (code.length !== GAME_CODE_LENGTH) {
        setStatus('Enter 4-letter game code');
        return;
      }
      if (!/^[A-Z0-9]{4}$/.test(code)) {
        setStatus('Enter a game ID to join');
        return;
      }
      setStatus('Checking game...');
      const gameRef = doc(db, 'games', code);
      const snap = await getDoc(gameRef);
      if (!snap.exists()) {
        setStatus('Game not found');
        return;
      }
      setDisplayGameId(code);
      setIsHost(false);
      setSubmitted(false);
      setFlowStep('join-enter-fact');
      setStatus('');
    } catch (error) {
      console.error(error);
      setStatus('Failed to find game');
    }
  }, [gameIdInput]);

  const submitJoin = useCallback(async () => {
    try {
      if (!displayGameId) return;
      if (!nameInput.trim() || !factInput.trim()) {
        setStatus('Enter your name and fun fact');
        return;
      }
      setStatus('Joining game...');
      await addDoc(collection(db, 'games', displayGameId, 'players'), {
        name: nameInput.trim(),
        fact: factInput.trim(),
        joinedAt: Date.now(),
      });
      setSubmitted(true);
      setStatus('Joined game');
    } catch (error) {
      console.error(error);
      setStatus('Failed to join game');
    }
  }, [displayGameId, nameInput, factInput]);

  const startGame = useCallback(async () => {
    try {
      if (!displayGameId) return;
      setStatus('Starting game...');
      // Fetch players in order of join time to determine first round
      const snap = await getDocs(query(collection(db, 'games', displayGameId, 'players'), orderBy('joinedAt', 'asc')));
      const joined = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      if (joined.length === 0) {
        setStatus('No players have joined yet');
        return;
      }
      const first = joined[0];
      await updateDoc(doc(db, 'games', displayGameId), {
        stage: 'voting',
        roundIndex: 0,
        currentFact: first.fact || '',
        currentPlayerId: first.id,
      });
      setFlowStep('voting');
      setStatus('Game started');
    } catch (error) {
      console.error(error);
      setStatus('Failed to start game');
    }
  }, [displayGameId]);

  useEffect(() => {
    if (!displayGameId) {
      setPlayers([]);
      setStage('');
      return;
    }
    const gameRef = doc(db, 'games', displayGameId);
    const unsubGame = onSnapshot(gameRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setStage(data.stage || '');
        if (typeof data.roundIndex === 'number') setRoundIndex(data.roundIndex);
        if (typeof data.currentFact === 'string') setCurrentFact(data.currentFact);
        if (typeof data.currentPlayerId === 'string') setCurrentPlayerId(data.currentPlayerId);
        if (data.stage === 'voting') setFlowStep('voting');
        if (data.stage === 'reveal') setFlowStep('reveal');
        if (data.stage === 'complete') setFlowStep('complete');
      }
    });
    const playersQueryRef = query(collection(db, 'games', displayGameId, 'players'), orderBy('joinedAt', 'asc'));
    const unsubPlayers = onSnapshot(playersQueryRef, (qs) => {
      const joined = qs.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPlayers(joined);
    });
    // Live votes for current round
    const votesQueryRef = query(
      collection(db, 'games', displayGameId, 'votes'),
      where('roundIndex', '==', roundIndex)
    );
    const unsubVotes = onSnapshot(votesQueryRef, (qs) => {
      const votes = qs.docs.map((d) => ({ id: d.id, ...d.data() }));
      setVotesThisRound(votes);
    });
    return () => {
      unsubGame();
      unsubPlayers();
      unsubVotes();
    };
  }, [displayGameId, roundIndex]);

  // Initialize a stable client id to prevent duplicate votes per round on this device
  useEffect(() => {
    setClientId(createStableClientId());
  }, []);

  const castVote = useCallback(async (guessPlayerId) => {
    try {
      if (!displayGameId) return;
      if (isHost) return;
      if (!clientId) return;
      if (hasVotedThisRound) {
        setStatus('You already voted this round');
        return;
      }
      setStatus('Submitting vote...');
      const voteDocId = `${roundIndex}_${clientId}`;
      await runTransaction(db, async (tx) => {
        const voteRef = doc(db, 'games', displayGameId, 'votes', voteDocId);
        const existing = await tx.get(voteRef);
        if (existing.exists()) {
          throw new Error('ALREADY_VOTED');
        }
        tx.set(voteRef, {
          voterId: clientId,
          voterName: nameInput || (isHost ? 'Host' : ''),
          guessPlayerId,
          roundIndex,
          createdAt: Date.now(),
        });
      });
      setStatus('Vote submitted');
    } catch (error) {
      console.error(error);
      if (error && error.message === 'ALREADY_VOTED') {
        setStatus('You already voted this round');
      } else {
        setStatus('Failed to submit vote');
      }
    }
  }, [displayGameId, nameInput, isHost, roundIndex, clientId, hasVotedThisRound]);

  const revealRound = useCallback(async () => {
    try {
      if (!displayGameId) return;
      await updateDoc(doc(db, 'games', displayGameId), { stage: 'reveal' });
    } catch (error) {
      console.error(error);
      setStatus('Failed to reveal');
    }
  }, [displayGameId]);

  const advanceRound = useCallback(async () => {
    try {
      if (!displayGameId) return;
      // Determine next player based on current order
      const indexOfCurrent = players.findIndex((p) => p.id === currentPlayerId);
      const nextIndex = indexOfCurrent >= 0 ? indexOfCurrent + 1 : roundIndex + 1;
      if (nextIndex >= players.length) {
        await updateDoc(doc(db, 'games', displayGameId), { stage: 'complete' });
        return;
      }
      const nextPlayer = players[nextIndex];
      await updateDoc(doc(db, 'games', displayGameId), {
        stage: 'voting',
        roundIndex: nextIndex,
        currentPlayerId: nextPlayer.id,
        currentFact: nextPlayer.fact || '',
      });
    } catch (error) {
      console.error(error);
      setStatus('Failed to advance');
    }
  }, [displayGameId, players, currentPlayerId, roundIndex]);

  // Build final scoreboard at completion
  useEffect(() => {
    const buildScores = async () => {
      if (!displayGameId || stage !== 'complete') return;
      try {
        const votesSnap = await getDocs(collection(db, 'games', displayGameId, 'votes'));
        const allVotes = votesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const { entries, winners } = computeScoreboardEntries(allVotes, players);
        setScoreboard(entries);
        setWinnerNames(winners);
      } catch (e) {
        console.error(e);
      }
    };
    buildScores();
  }, [displayGameId, stage, players]);

  return (
    <div className="App" style={{ backgroundColor: 'white', minHeight: '100vh', padding: '20px' }}>
      <h1 style={{ color: 'black', fontSize: '32px', fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>
        Guess that admin
      </h1>
      <p style={{ color: 'black', fontSize: '18px', textAlign: 'center', marginBottom: 20 }}>
        Guess the admin based on a fun fact about them
      </p>

      {/* Step: Choose create or join */}
      {flowStep === 'choose' && (
        <ChooseScreen
          onCreate={createGame}
          onJoin={() => { setStatus(''); setGameIdInput(''); setFlowStep('join-enter-id'); }}
        />
      )}

      {/* Step: Join - enter game id */}
      {flowStep === 'join-enter-id' && (
        <JoinEnterId
          code={gameIdInput}
          onChange={(val) => setGameIdInput(normalizeGameCode(val))}
          onContinue={proceedToJoinFact}
          onBack={() => { setFlowStep('choose'); setStatus(''); }}
        />
      )}

      {/* Step: Join - enter name and fun fact */}
      {flowStep === 'join-enter-fact' && (
        <JoinEnterFact
          gameId={displayGameId}
          name={nameInput}
          fact={factInput}
          onChangeName={setNameInput}
          onChangeFact={setFactInput}
          onSubmit={submitJoin}
          onBack={() => { setFlowStep('join-enter-id'); setStatus(''); }}
          submitted={submitted}
        />
      )}

      {/* Host lobby */}
      {flowStep === 'host-lobby' && isHost && displayGameId && (
        <HostLobby
          gameId={displayGameId}
          stage={stage}
          players={players}
          onStart={startGame}
        />
      )}

      {/* Voting screen */}
      {flowStep === 'voting' && displayGameId && (
        <VotingScreen
          roundIndex={roundIndex}
          fact={currentFact}
          players={players}
          isHost={isHost}
          hasVoted={hasVotedThisRound}
          onVote={castVote}
          onReveal={revealRound}
        />
      )}

      {/* Reveal screen */}
      {flowStep === 'reveal' && displayGameId && (
        <RevealScreen
          roundIndex={roundIndex}
          fact={currentFact}
          players={players}
          currentPlayerId={currentPlayerId}
          votesThisRound={votesThisRound}
          isHost={isHost}
          onNextRound={advanceRound}
        />
      )}

      {/* Complete */}
      {flowStep === 'complete' && displayGameId && (
        <CompleteScreen winners={winnerNames} scoreboard={scoreboard} />
      )}

      {status && (
        <p style={{ 
          marginTop: 20, 
          textAlign: 'center', 
          color: 'black', 
          fontSize: '16px', 
          fontWeight: 'bold' 
        }}>
          {status}
        </p>
      )}
    </div>
  );
}

export default App;
