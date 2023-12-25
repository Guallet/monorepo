import Session from "supertokens-auth-react/recipe/session";

export async function getCurrentUserToken(): Promise<string | null> {
  if (await Session.doesSessionExist()) {
    const jwt = await Session.getAccessToken();
    return jwt ?? null;
  }

  return null;
}

export async function getCurrentUserId(): Promise<string | null> {
  if (await Session.doesSessionExist()) {
    const userId = await Session.getUserId();
    return userId ?? null;
  }

  return null;
}

export async function signOut() {
  await Session.signOut();
}
