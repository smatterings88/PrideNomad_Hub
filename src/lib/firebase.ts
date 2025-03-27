import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  applyActionCode, 
  verifyPasswordResetCode, 
  confirmPasswordReset,
  onAuthStateChanged
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, enableIndexedDbPersistence, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { ADMIN_EMAILS } from '../utils/constants';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
  } else if (err.code === 'unimplemented') {
    console.warn('The current browser does not support offline persistence.');
  }
});

// Keep admin list synchronized with Firestore
let adminListenerUnsubscribe: (() => void) | null = null;

function setupAdminListener() {
  if (adminListenerUnsubscribe) {
    adminListenerUnsubscribe();
  }

  const adminsRef = collection(db, 'admins');
  adminListenerUnsubscribe = onSnapshot(adminsRef, (snapshot) => {
    // Reset to default admins
    ADMIN_EMAILS.length = 0;
    ADMIN_EMAILS.push('mgzobel@icloud.com', 'kenergizer@mac.com');

    // Add all admins from Firestore
    snapshot.docs.forEach(doc => {
      const email = doc.data().email;
      if (email && !ADMIN_EMAILS.includes(email)) {
        ADMIN_EMAILS.push(email);
      }
    });
  }, (error) => {
    console.error('Error in admin listener:', error);
  });
}

// Set up auth state listener to manage admin synchronization
onAuthStateChanged(auth, (user) => {
  if (user) {
    setupAdminListener();
  } else if (adminListenerUnsubscribe) {
    adminListenerUnsubscribe();
    adminListenerUnsubscribe = null;
    // Reset to default admins when logged out
    ADMIN_EMAILS.length = 0;
    ADMIN_EMAILS.push('mgzobel@icloud.com', 'kenergizer@mac.com');
  }
});

// User role management functions
export async function setUserRole(userId: string, role: string) {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, { role }, { merge: true });
}

export async function getUserRole(userId: string): Promise<string> {
  try {
    const user = auth.currentUser;
    if (!user?.email) return 'Regular User';

    // Check if user's email is in ADMIN_EMAILS
    if (ADMIN_EMAILS.includes(user.email)) {
      return 'Admin';
    }

    // Check admins collection using email as document ID
    const adminDoc = await getDoc(doc(db, 'admins', user.email));
    if (adminDoc.exists()) {
      return 'Admin';
    }

    // Check user document for role
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    return userDoc.exists() ? (userDoc.data().role || 'Regular User') : 'Regular User';
  } catch (error) {
    console.error('Error getting user role:', error);
    return 'Regular User';
  }
}

export { 
  app, 
  auth, 
  db,
  storage,
  applyActionCode,
  verifyPasswordResetCode,
  confirmPasswordReset
};