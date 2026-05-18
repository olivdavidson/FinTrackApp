import { Platform } from "react-native";
import { Account, Category, Transaction } from "./mockData";

export const API_BASE_URL =
  Platform.OS === "android" ? "http://10.0.2.2:4000" : "http://localhost:4000";

export type LoginResponse = {
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
  accessToken: string;
  refreshToken: string;
};

const parseJson = async (response: Response) => {
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || "Erro ao conectar com o servidor.");
  }
  return json.data;
};

export async function loginWithEmail(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  return parseJson(response);
}

export type RegisterResponse = LoginResponse;

export async function registerWithEmail(
  name: string,
  email: string,
  password: string,
): Promise<RegisterResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });

  return parseJson(response);
}

export async function logout(
  accessToken: string | null,
  refreshToken: string,
): Promise<void> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    headers,
    body: JSON.stringify({ refreshToken }),
  });
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  return parseJson(response);
}

export async function getCurrentUser(accessToken: string): Promise<{
  user: { _id: string; name: string; email: string; avatar?: string | null };
}> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  return parseJson(response);
}

export async function getTransactions(
  accessToken: string,
  refreshToken: string,
  onTokenRefreshed: (
    accessToken: string,
    refreshToken: string,
  ) => Promise<void>,
): Promise<Transaction[]> {
  return authFetch(
    `${API_BASE_URL}/data/transactions`,
    { method: "GET" },
    accessToken,
    refreshToken,
    onTokenRefreshed,
  );
}

export async function createTransaction(
  transaction: Omit<Transaction, "id" | "date" | "iconColor" | "iconBg">,
  accessToken: string,
  refreshToken: string,
  onTokenRefreshed: (
    accessToken: string,
    refreshToken: string,
  ) => Promise<void>,
): Promise<Transaction> {
  return authFetch(
    `${API_BASE_URL}/data/transactions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transaction),
    },
    accessToken,
    refreshToken,
    onTokenRefreshed,
  );
}

export async function getAccounts(
  accessToken: string,
  refreshToken: string,
  onTokenRefreshed: (
    accessToken: string,
    refreshToken: string,
  ) => Promise<void>,
): Promise<Account[]> {
  return authFetch(
    `${API_BASE_URL}/data/accounts`,
    { method: "GET" },
    accessToken,
    refreshToken,
    onTokenRefreshed,
  );
}

export async function getCategories(
  accessToken: string,
  refreshToken: string,
  onTokenRefreshed: (
    accessToken: string,
    refreshToken: string,
  ) => Promise<void>,
): Promise<Category[]> {
  return authFetch(
    `${API_BASE_URL}/data/categories`,
    { method: "GET" },
    accessToken,
    refreshToken,
    onTokenRefreshed,
  );
}

export async function authFetch(
  input: string,
  init: RequestInit,
  accessToken: string,
  refreshToken: string,
  onTokenRefreshed: (
    accessToken: string,
    refreshToken: string,
  ) => Promise<void>,
  hasRefreshed = false,
): Promise<any> {
  const requestWithToken = async (token: string) =>
    fetch(input, {
      ...init,
      headers: {
        ...(init.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });

  let response = await requestWithToken(accessToken);
  let json = await response.json();

  if (response.status === 401 && !hasRefreshed && refreshToken) {
    const tokenData = await refreshAccessToken(refreshToken);
    await onTokenRefreshed(tokenData.accessToken, tokenData.refreshToken);
    response = await requestWithToken(tokenData.accessToken);
    json = await response.json();
  }

  if (!response.ok) {
    throw new Error(json.message || "Erro na requisição autenticada.");
  }

  return json.data;
}
