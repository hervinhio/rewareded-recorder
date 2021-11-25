import { GoogleAuthProvider, getAuth, connectAuthEmulator, setPersistence, browserLocalPersistence, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { environment } from "../../environments/environment";

const provider = new GoogleAuthProvider();
const auth = getAuth();

export const authenticate = async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
    await signInWithRedirect(auth, provider);
  } catch (error: any) {
    console.warn(error?.message);
  }
}

export const isAuthenticated = async () => {
  const result = await getRedirectResult(auth);

  if (result) return true;
  return false;
}

export const logout = () => {
  return auth.signOut();
}

(() => {
  if (!environment.production) {
    connectAuthEmulator(auth, "http://localhost:9099")
  }
})();
