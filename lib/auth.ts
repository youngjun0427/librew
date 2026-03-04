import { signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "./firebase";

export async function signOut() {
  return firebaseSignOut(auth);
}
