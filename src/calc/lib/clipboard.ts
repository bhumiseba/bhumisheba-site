/**
 * Universal clipboard copy with fallback for non-secure contexts.
 * navigator.clipboard is undefined on HTTP (only works on HTTPS/localhost).
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // 1. Modern Clipboard API (HTTPS / localhost only)
  if (
    typeof navigator !== 'undefined' &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === 'function'
  ) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('[clipboard] writeText failed, trying fallback:', err);
    }
  }

  // 2. Fallback: legacy execCommand('copy')
  try {
    if (typeof document === 'undefined') return false;

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.width = '2em';
    textarea.style.height = '2em';
    textarea.style.padding = '0';
    textarea.style.border = 'none';
    textarea.style.outline = 'none';
    textarea.style.boxShadow = 'none';
    textarea.style.background = 'transparent';
    textarea.style.opacity = '0';
    textarea.setAttribute('readonly', '');

    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, text.length);

    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch (err) {
    console.warn('[clipboard] fallback copy failed:', err);
    return false;
  }
}