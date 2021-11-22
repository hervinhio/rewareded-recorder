import { GoogleAuthProvider, getAuth, signInWithPopup, connectAuthEmulator } from "firebase/auth";
import { environment } from "../../environments/environment";

const provider = new GoogleAuthProvider();
const auth = getAuth();

(() => {
  if (!environment.production) {
    connectAuthEmulator(auth, "http://localhost:9099")
  }
})();

export const authenticate = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return true;
  } catch (error: any) {
    console.warn(error?.message);
    return false;
  }
}
