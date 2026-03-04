import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { GoogleAuthProvider, signInWithCredential, signInWithPopup } from "firebase/auth";
import { useEffect } from "react";
import { Platform } from "react-native";
import { auth } from "../lib/firebase";

WebBrowser.maybeCompleteAuthSession();

export function useGoogleSignIn() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      if (id_token) {
        const credential = GoogleAuthProvider.credential(id_token);
        signInWithCredential(auth, credential);
      }
    }
  }, [response]);

  const signIn = async () => {
    if (Platform.OS === "web") {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } else {
      promptAsync();
    }
  };

  return { request, signIn };
}
