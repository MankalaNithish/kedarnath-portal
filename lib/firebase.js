/**
 * Firebase client config.
 *
 * These values are NOT secrets. A Firebase web config is a public identifier —
 * it ships in the JS bundle by design, and Google documents it as safe to
 * expose. What actually protects the data is firestore.rules, which allows
 * anyone to read and create a review but denies every update and delete.
 */
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** True once the six env vars are present. */
export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId);

let cached = null;

/**
 * Loads the Firebase SDK on demand and returns a Firestore handle plus the
 * query helpers. The import is dynamic so ~130 kB of SDK stays out of the
 * page's initial bundle — the reviews shell paints immediately and the data
 * layer arrives in a separate chunk.
 *
 * Resolves to null when the project has not been configured yet, so the rest
 * of the site keeps working before the keys are filled in.
 */
export async function loadFirestore() {
  if (!isFirebaseConfigured) return null;
  if (cached) return cached;

  const [{ initializeApp, getApps, getApp }, firestore] = await Promise.all([
    import('firebase/app'),
    import('firebase/firestore'),
  ]);

  const app = getApps().length ? getApp() : initializeApp(config);
  const db = firestore.getFirestore(app);

  // Local development against the Firestore emulator:
  //   NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
  // Leave unset in production and the SDK talks to the real project.
  const emulator = process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST;
  if (emulator) {
    const [host, port] = emulator.split(':');
    firestore.connectFirestoreEmulator(db, host, Number(port));
  }

  cached = {
    db,
    collection: firestore.collection,
    onSnapshot: firestore.onSnapshot,
    orderBy: firestore.orderBy,
    query: firestore.query,
    addDoc: firestore.addDoc,
  };
  return cached;
}
