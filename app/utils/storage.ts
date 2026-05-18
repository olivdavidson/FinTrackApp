import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_KEY = "@fintrack:user";
const ACCESS_TOKEN_KEY = "@fintrack:accessToken";
const REFRESH_TOKEN_KEY = "@fintrack:refreshToken";

export async function saveAuthData(
  user: string,
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  await AsyncStorage.multiSet([
    [USER_KEY, user],
    [ACCESS_TOKEN_KEY, accessToken],
    [REFRESH_TOKEN_KEY, refreshToken],
  ]);
}

export async function loadAuthData(): Promise<{
  user: string | null;
  accessToken: string | null;
  refreshToken: string | null;
}> {
  const values = await AsyncStorage.multiGet([
    USER_KEY,
    ACCESS_TOKEN_KEY,
    REFRESH_TOKEN_KEY,
  ]);

  return values.reduce(
    (acc, [key, value]) => {
      if (key === USER_KEY) acc.user = value;
      if (key === ACCESS_TOKEN_KEY) acc.accessToken = value;
      if (key === REFRESH_TOKEN_KEY) acc.refreshToken = value;
      return acc;
    },
    {
      user: null,
      accessToken: null,
      refreshToken: null,
    } as {
      user: string | null;
      accessToken: string | null;
      refreshToken: string | null;
    },
  );
}

export async function clearAuthData(): Promise<void> {
  await AsyncStorage.multiRemove([
    USER_KEY,
    ACCESS_TOKEN_KEY,
    REFRESH_TOKEN_KEY,
  ]);
}
