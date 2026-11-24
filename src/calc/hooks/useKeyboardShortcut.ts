import { useEffect } from 'react';

export interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  handler: () => void;
  enabled?: boolean;
  preventDefault?: boolean;
}

/**
 * Global keyboard shortcut hook.
 * Automatically cleans up on unmount.
 */
export function useKeyboardShortcut(config: ShortcutConfig): void {
  const {
    key,
    ctrl = false,
    shift = false,
    alt = false,
    meta = false,
    handler,
    enabled = true,
    preventDefault = true,
  } = config;

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const matches =
        e.key.toLowerCase() === key.toLowerCase() &&
        e.ctrlKey === ctrl &&
        e.shiftKey === shift &&
        e.altKey === alt &&
        e.metaKey === meta;

      if (matches) {
        if (preventDefault) e.preventDefault();
        handler();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [key, ctrl, shift, alt, meta, handler, enabled, preventDefault]);
}