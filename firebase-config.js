// Firebase configuration
// Replace with your own Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyDPS5xd1Dtej7_9if4UN4bap10CWr_ODyM",
  authDomain: "id-card-generator-f9346.firebaseapp.com",
  projectId: "id-card-generator-f9346",
  storageBucket: "id-card-generator-f9346.firebasestorage.app",
  messagingSenderId: "132712368157",
  appId: "1:132712368157:web:3d8f36607ed78665bd1ef4"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

// Collection references
const idCardsCollection = db.collection('idCards');
const counterDoc = db.collection('counters').doc('registrationCounter');

// Initialize counter if it doesn't exist
async function initializeCounter() {
  try {
    const doc = await counterDoc.get();
    if (!doc.exists) {
      await counterDoc.set({ count: 0 });
      console.log('Counter initialized');
    }
  } catch (error) {
    console.error('Error initializing counter:', error);
  }
}

// Call the function to initialize the counter
initializeCounter();

// Function to get the next registration number
async function getNextRegistrationNumber() {
  try {
    // Use a transaction to ensure atomic updates
    return db.runTransaction(async (transaction) => {
      const counterSnapshot = await transaction.get(counterDoc);
      
      if (!counterSnapshot.exists) {
        transaction.set(counterDoc, { count: 1 });
        return 1;
      }
      
      const newCount = counterSnapshot.data().count + 1;
      transaction.update(counterDoc, { count: newCount });
      return newCount;
    });
  } catch (error) {
    console.error('Error getting next registration number:', error);
    // Fallback to timestamp-based number if transaction fails
    return Math.floor(Date.now() / 1000) % 10000;
  }
}

// Function to reset the counter to 0
async function resetCounter() {
  try {
    await counterDoc.set({ count: 0 });
    console.log('Counter reset to 0');
    return true;
  } catch (error) {
    console.error('Error resetting counter:', error);
    return false;
  }
}

// To reset the counter, uncomment the line below, refresh the page once, then comment it again
// resetCounter();
