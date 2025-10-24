// src/contexts/AuthContext.jsx
import { createContext, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../config/firebase";

export const AuthContext = createContext();

// ✅ 헬퍼 함수: Firebase User 객체를 평탄화
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

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("🔄 Auth 상태 변경:", currentUser?.email);

      // ✅ user 객체 직렬화
      const serializedUser = serializeUser(currentUser);
      console.log("📸 onAuthStateChanged photoURL:", serializedUser?.photoURL);

      setUser(serializedUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
