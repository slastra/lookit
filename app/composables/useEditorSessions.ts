import type { EditorSession, EditorState } from '~/types';

const SESSIONS_KEY = 'lookit-sessions';
const ACTIVE_KEY = 'lookit-active-session';

/**
 * Sessions carry their logomarks as inline SVG, so a handful can run to
 * megabytes. Enough to get back to recent work without crowding the quota.
 */
const MAX_SESSIONS = 12;

export function emptyEditorState(): EditorState {
  return {
    logomarks: [{ label: 'Option A', svg: null }],
    wordmark: null,
    taglineSvg: null,
    brandName: '',
    taglineText: '',
    selectedFonts: ['Inter'],
    wordmarkFont: 'Inter',
    wordmarkFontWeight: 700,
    taglineFont: 'Inter',
    taglineFontWeight: 400,
    primaryColor: '#18181b',
    accentColor: '#3b82f6',
    bgColor: '#ffffff',
    layout: 'stacked',
    logoScale: 1,
    wordmarkScale: 1,
    taglineScale: 1,
    logoGap: 1,
    taglineGap: 1,
    logoOffsetX: 0,
    logoOffsetY: 0,
    wordmarkLetterSpacing: 0,
    taglineLetterSpacing: 0,
  };
}

/** A session is worth keeping once it holds anything the user actually made. */
function hasContent(state: EditorState): boolean {
  return state.logomarks.some(mark => !!mark.svg)
    || !!state.wordmark
    || !!state.taglineSvg
    || !!state.brandName.trim()
    || !!state.taglineText.trim();
}

function sessionName(state: EditorState): string {
  return state.brandName.trim() || 'Untitled';
}

// Module scope so every caller shares one view of storage. The app is
// client-rendered, so there is no request to leak between.
const sessions = ref<EditorSession[]>([]);
const activeId = ref<string | null>(null);

function persist() {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.value));
    if (activeId.value) localStorage.setItem(ACTIVE_KEY, activeId.value);
  }
  catch {
    // Out of quota: drop the oldest and try once more rather than lose the
    // session in front of the user.
    sessions.value = sessions.value.slice(0, Math.max(1, Math.ceil(sessions.value.length / 2)));
    try {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.value));
    }
    catch {
      // Still too big — the in-memory session keeps working, it just won't survive a reload.
    }
  }
}

export function useEditorSessions() {
  function load() {
    try {
      const raw = localStorage.getItem(SESSIONS_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      sessions.value = Array.isArray(parsed) ? (parsed as EditorSession[]) : [];
      activeId.value = localStorage.getItem(ACTIVE_KEY);
    }
    catch {
      sessions.value = [];
      activeId.value = null;
    }
    return sessions.value.find(session => session.id === activeId.value) ?? null;
  }

  /** Writes the active session, creating it the moment there's content to keep. */
  function save(state: EditorState) {
    const existing = sessions.value.find(session => session.id === activeId.value);
    if (!existing && !hasContent(state)) return;

    const id = activeId.value ?? crypto.randomUUID();
    activeId.value = id;

    const session: EditorSession = { id, name: sessionName(state), updatedAt: Date.now(), state };
    sessions.value = [session, ...sessions.value.filter(s => s.id !== id)].slice(0, MAX_SESSIONS);
    persist();
  }

  /** Leaves the current session on disk and hands back a blank slate. */
  function startNew(): EditorState {
    activeId.value = null;
    localStorage.removeItem(ACTIVE_KEY);
    return emptyEditorState();
  }

  function open(id: string): EditorState | null {
    const session = sessions.value.find(s => s.id === id);
    if (!session) return null;
    activeId.value = id;
    persist();
    return session.state;
  }

  function remove(id: string) {
    sessions.value = sessions.value.filter(s => s.id !== id);
    if (activeId.value === id) {
      activeId.value = null;
      localStorage.removeItem(ACTIVE_KEY);
    }
    persist();
  }

  return { sessions, activeId, load, save, startNew, open, remove };
}
