export interface PreviewConfig {
  logomarks: { label: string; svg: string }[];
  wordmark?: string;
  tagline?: string;
  fonts: string[];
  accentColor: string;
  primaryColor: string;
  layout: 'horizontal' | 'stacked' | 'mark-only';
  logoScale: number;
  wordmarkScale: number;
  taglineScale: number;
  backgroundColor: string;
  brandName?: string;
  taglineText?: string;
  defaultWordmarkFont?: string;
  defaultTaglineFont?: string;
  defaultWordmarkWeight?: number;
  defaultTaglineWeight?: number;
  logoGap: number;
  taglineGap: number;
  wordmarkLetterSpacing: number;
  taglineLetterSpacing: number;
  logoOffsetX: number;
  logoOffsetY: number;
}

export interface SelectionLockup {
  logomarkIndex: number;
  wordmarkFont: string;
  wordmarkFontWeight: number;
  taglineFont: string;
  taglineFontWeight: number;
  primaryColor: string;
  accentColor: string;
  layout: 'horizontal' | 'stacked' | 'mark-only';
  logoScale: number;
  wordmarkScale: number;
  taglineScale: number;
  backgroundColor: string;
  logoGap: number;
  taglineGap: number;
  wordmarkLetterSpacing: number;
  taglineLetterSpacing: number;
  logoOffsetX: number;
  logoOffsetY: number;
}

export interface Selection {
  id: string;
  preview_id: string;
  name: string;
  lockup: SelectionLockup;
  message: string | null;
  created_at: number;
}

/** Everything the editor holds, as saved to a session. */
export interface EditorState {
  logomarks: { label: string; svg: string | null }[];
  wordmark: string | null;
  taglineSvg: string | null;
  brandName: string;
  taglineText: string;
  selectedFonts: string[];
  wordmarkFont: string;
  wordmarkFontWeight: number;
  taglineFont: string;
  taglineFontWeight: number;
  primaryColor: string;
  accentColor: string;
  bgColor: string;
  layout: 'horizontal' | 'stacked' | 'mark-only';
  logoScale: number;
  wordmarkScale: number;
  taglineScale: number;
  logoGap: number;
  taglineGap: number;
  logoOffsetX: number;
  logoOffsetY: number;
  wordmarkLetterSpacing: number;
  taglineLetterSpacing: number;
}

export interface EditorSession {
  id: string;
  name: string;
  updatedAt: number;
  state: EditorState;
}
