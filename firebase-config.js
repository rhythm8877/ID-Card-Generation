// Firebase configuration
// Replace with your own Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyAcNSreHrjn_2oD_J0qSobV3QGgco92O5E",
  authDomain: "id-card-generator-30b5e.firebaseapp.com",
  projectId: "id-card-generator-30b5e",
  storageBucket: "id-card-generator-30b5e.firebasestorage.app",
  messagingSenderId: "415880752391",
  appId: "1:415880752391:web:4fefc9f2e98028ae7d29a2"
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