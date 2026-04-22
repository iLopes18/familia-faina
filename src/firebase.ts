import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
export const db = (firebaseConfig as any).firestoreDatabaseId 
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(app);
export const auth = getAuth(app);

// Connection test
async function testConnection() {
  try {
    // Try to fetch a non-existent doc just to check connectivity
    await getDocFromServer(doc(db, 'familia', 'connection-test'));
    console.log("Firebase connection successful");
  } catch (error: any) {
    if (error?.code === 'failed-precondition' || error?.message?.includes('the client is offline')) {
      console.warn("⚠️ Firebase está offline ou a base de dados ainda não foi criada.");
      console.info("Por favor, verifique se criou a base de dados Firestore no projeto 'gen-lang-client-0374004622' na consola do Firebase.");
    } else {
      console.error("Erro na ligação ao Firebase:", error);
    }
  }
}
testConnection();
