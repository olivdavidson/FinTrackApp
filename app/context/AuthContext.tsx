import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    LoginResponse,
    getCurrentUser,
    loginWithEmail,
    logout as logoutRequest,
    refreshAccessToken,
    registerWithEmail,
} from "../utils/api";
import { clearAuthData, loadAuthData, saveAuthData } from "../utils/storage";

export type User = {
  _id: string;
  name: string;
  email: string;
  avatar?: string | null;
};

type AuthContextData = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<LoginResponse>;
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<LoginResponse>;
  signOut: () => Promise<void>;
  updateTokens: (accessToken: string, refreshToken: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restoreAuth() {
      try {
        const stored = await loadAuthData();

        if (!stored.accessToken || !stored.refreshToken) {
          return;
        }

        try {
          const data = await getCurrentUser(stored.accessToken);
          setUser(data.user);
          setAccessToken(stored.accessToken);
          setRefreshToken(stored.refreshToken);
        } catch (error) {
          const refreshed = await refreshAccessToken(stored.refreshToken);
          const data = await getCurrentUser(refreshed.accessToken);
          setUser(data.user);
          setAccessToken(refreshed.accessToken);
          setRefreshToken(refreshed.refreshToken);
          await saveAuthData(
            JSON.stringify(data.user),
            refreshed.accessToken,
            refreshed.refreshToken,
          );
        }
      } catch (error) {
        console.warn("Falha ao restaurar dados de autenticação:", error);
        await clearAuthData();
      } finally {
        setLoading(false);
      }
    }

    restoreAuth();
  }, []);

  const persistAuth = async (authData: LoginResponse) => {
    setUser(authData.user);
    setAccessToken(authData.accessToken);
    setRefreshToken(authData.refreshToken);

    await saveAuthData(
      JSON.stringify(authData.user),
      authData.accessToken,
      authData.refreshToken,
    );
  };

  const signIn = async (email: string, password: string) => {
    const authData = await loginWithEmail(email, password);
    await persistAuth(authData);
    return authData;
  };

  const register = async (name: string, email: string, password: string) => {
    const authData = await registerWithEmail(name, email, password);
    await persistAuth(authData);
    return authData;
  };

  const updateTokens = async (
    newAccessToken: string,
    newRefreshToken: string,
  ) => {
    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);
    if (user) {
      await saveAuthData(JSON.stringify(user), newAccessToken, newRefreshToken);
    }
  };

  const signOut = async () => {
    try {
      if (refreshToken) {
        await logoutRequest(accessToken, refreshToken);
      }
    } catch (error) {
      console.warn("Erro ao fazer logout no servidor:", error);
    } finally {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      await clearAuthData();
    }
  };

  const value = useMemo(
    () => ({
      user,
      accessToken,
      refreshToken,
      loading,
      signIn,
      register,
      signOut,
      updateTokens,
    }),
    [user, accessToken, refreshToken, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextData => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
