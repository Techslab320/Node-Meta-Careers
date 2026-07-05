export function insertTextAtSelection(
  currentValue: string,
  text: string,
  selectionStart: number,
  selectionEnd: number,
): { value: string; cursor: number } {
  const before = currentValue.slice(0, selectionStart);
  const after = currentValue.slice(selectionEnd);
  const value = before + text + after;
  return { value, cursor: selectionStart + text.length };
}

export function restoreInputSelection(
  element: HTMLInputElement | HTMLTextAreaElement,
  cursor: number,
) {
  element.focus();
  element.setSelectionRange(cursor, cursor);
}
