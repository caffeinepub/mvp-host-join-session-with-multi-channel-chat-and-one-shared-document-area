import type { SessionContext } from '../App';

const SESSION_STORAGE_KEY = 'rpg_session_context';

export function setSessionStorage(context: SessionContext): void {
  try {
    localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({
        sessionId: context.sessionId.toString(),
        nickname: context.nickname,
        isHost: context.isHost,
      })
    );
  } catch (error) {
    console.error('Failed to save session to storage:', error);
  }
}

export function getSessionStorage(): SessionContext | null {
  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    return {
      sessionId: BigInt(parsed.sessionId),
      nickname: parsed.nickname,
      isHost: parsed.isHost,
    };
  } catch (error) {
    console.error('Failed to load session from storage:', error);
    return null;
  }
}

export function clearSessionStorage(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear session storage:', error);
  }
}
