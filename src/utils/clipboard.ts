import { toast } from 'sonner@2.0.3';

/**
 * Robust clipboard utility that works even when Clipboard API is blocked
 */

export async function copyToClipboard(text: string): Promise<boolean> {
  // Method 1: Try document.execCommand (most reliable for blocked environments)
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Make it invisible but accessible
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    // For iOS
    textArea.setSelectionRange(0, text.length);
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    if (successful) {
      return true;
    }
  } catch (err) {
    console.log('execCommand failed:', err);
  }

  // Method 2: Try modern Clipboard API (may be blocked)
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.log('Clipboard API failed:', err);
    }
  }

  // All methods failed
  return false;
}

/**
 * Select text in an input element for manual copy
 */
export function selectInputText(inputId: string): void {
  const input = document.getElementById(inputId) as HTMLInputElement | null;
  if (input) {
    input.focus();
    input.select();
    
    // For iOS
    if (input.setSelectionRange) {
      input.setSelectionRange(0, input.value.length);
    }
  }
}

/**
 * Show copy dialog with toast notification (for wallet components)
 */
export async function showCopyDialog(text: string, label: string = 'Text'): Promise<void> {
  const success = await copyToClipboard(text);
  
  if (success) {
    toast.success(`✅ ${label} copied to clipboard!`);
  } else {
    toast.error(`Failed to copy ${label}. Please copy manually.`);
  }
}
