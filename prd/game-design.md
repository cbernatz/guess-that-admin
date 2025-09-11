Guess that admin is a game where:

1. A host creates a game
2. Team members join that game
3. Team members join the lobby and submit a fun fact about themselves
4. Host starts the game
5. A fun fact is displayed
6. Everyone, excluding the host, votes on who they think it is
7. Answer is revealed by the host, players accrue a point for the right answer
8. Move onto the next team member
9. Game completes after all members are voted on, results displayed

Technical specifications include:

1. Firestore for database needs (see firebase.js shell below):

```javascript
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  // hidden, my config
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };

```

2. The app will be hosted at github pages at https://cbernatz.github.io/guess-that-admin/

Design specifications include:

1. Modern, clean interfaces
2. Only blacks, whites, and hex code F1641d
3. No animations
4. No loading indicators
5. No imagery