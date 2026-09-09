

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';

import type { User, UserRole } from '@/types';
import { authService } from '@/services/dataService';

const STORAGE_KEY = 'skilltrack_user_v2';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<User | null>;
  register: (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ) => Promise<User | null>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

function getStoredUser(): User | null {
  try {
    const storedUser =
      localStorage.getItem(STORAGE_KEY);

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser) as User;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  // Restore the user immediately when the app starts
  const [user, setUser] = useState<User | null>(
    getStoredUser
  );

  // There is no async restoration step anymore
  const [loading] = useState(false);

  const login = async (
    email: string,
    password: string
  ): Promise<User | null> => {
    const loggedInUser =
      await authService.login(
        email,
        password
      );

    if (!loggedInUser) {
      return null;
    }

    setUser(loggedInUser);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(loggedInUser)
    );

    return loggedInUser;
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<User | null> => {
    // Admin registration is not allowed here
    if (role === 'admin') {
      return null;
    }

    const newUser =
      await authService.register(
        name,
        email,
        password,
        role
      );

    if (!newUser) {
      return null;
    }

    setUser(newUser);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(newUser)
    );

    return newUser;
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem(
      STORAGE_KEY
    );
  };

  const updateUser = (
    updates: Partial<User>
  ) => {
    setUser((currentUser) => {
      if (!currentUser) {
        return currentUser;
      }

      const updatedUser: User = {
        ...currentUser,
        ...updates,
      };

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedUser)
      );

      return updatedUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
}