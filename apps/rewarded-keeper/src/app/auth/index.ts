import { GoogleAuthProvider, getAuth, signInWithPopup, connectAuthEmulator } from "firebase/auth";

const provider = new GoogleAuthProvider();
const auth = getAuth();
connectAuthEmulator(auth, "http://localhost:9099");

export const authenticate = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    console.log(result);
    return true;
  } catch (error: any) {
    console.warn(error?.message);
    return false;
  }
}
