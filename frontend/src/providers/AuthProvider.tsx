import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { auth } from "../firebase";
import { AuthContext } from "../context/AuthContext";

interface AuthProviderProps {
  children: React.ReactNode | React.ReactNode[] | string | number | boolean;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
    });

    return unsubscribe;
  }, []);

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
};