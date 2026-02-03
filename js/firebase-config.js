// Configuração do seu projeto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDp9bA5SDrIbcMRU5RP8pFMDpEHVyy2cYk",
  authDomain: "trello-4a099.firebaseapp.com",
  projectId: "trello-4a099",
  storageBucket: "trello-4a099.firebasestorage.app",
  messagingSenderId: "261260246938",
  appId: "1:261260246938:web:3f9747f5f22a18a679c423",
  measurementId: "G-NN2XV21WSK"
};

// Inicializa o Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = typeof firebase.firestore === 'function' ? firebase.firestore() : null;
const storage = typeof firebase.storage === 'function' ? firebase.storage() : null;
const auth = typeof firebase.auth === 'function' ? firebase.auth() : null;

if (!auth) {
    console.error("Firebase Auth não foi carregado corretamente.");
}