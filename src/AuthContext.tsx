import * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { db } from "./firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { Member } from "./types";

interface AuthContextType {
  currentUser: string | null;
  userData: Member | null;
  loading: boolean;
  login: (userId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userData: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

import { handleFirestoreError, OperationType } from "./utils/firebaseErrors";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<string | null>(localStorage.getItem('userId'));
  const [userData, setUserData] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      const path = `familia/${currentUser}`;
      const unsubscribeDoc = onSnapshot(doc(db, 'familia', currentUser), (docSnap) => {
        if (docSnap.exists()) {
          setUserData({ ...docSnap.data(), id: docSnap.id } as Member);
        } else {
          setUserData(null);
          setCurrentUser(null);
          localStorage.removeItem('userId');
        }
        setLoading(false);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, path);
        setLoading(false);
      });
      return () => unsubscribeDoc();
    } else {
      setUserData(null);
      setLoading(false);
    }
  }, [currentUser]);

  const login = (userId: string) => {
    localStorage.setItem('userId', userId);
    setCurrentUser(userId);
  };

  const logout = () => {
    localStorage.removeItem('userId');
    setCurrentUser(null);
    setUserData(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, userData, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
