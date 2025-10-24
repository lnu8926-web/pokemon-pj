import { createContext, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../config/firebase";
import { Box, Spinner, VStack } from "@chakra-ui/react"; // ✅ 추가

export const AuthContext = createContext();

function serializeUser(firebaseUser) {
  if (!firebaseUser) return null;
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    emailVerified: firebaseUser.emailVerified,
    metadata: firebaseUser.metadata,
    providerData: firebaseUser.providerData,
  };
}

// eslint-disable-next-line react-refresh/only-export-components
export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      const serializedUser = serializeUser(currentUser);
      setUser(serializedUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ✅ 더 예쁜 로딩 UI
  if (loading) {
    return (
      <VStack
        minH="100vh"
        justify="center"
        align="center"
        bg={{ base: "white", _dark: "gray.900" }}
      >
        <Spinner size="xl" color="blue.500" thickness="4px" />
        <Box mt={4} fontSize="lg" color="gray.500">
          로딩 중...
        </Box>
      </VStack>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
