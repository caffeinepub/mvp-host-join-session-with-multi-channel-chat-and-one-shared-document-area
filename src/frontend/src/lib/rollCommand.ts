export type RollValidation = {
  valid: boolean;
  error?: string;
};

export function parseRollCommand(pattern: string): RollValidation {
  if (!pattern || !pattern.trim()) {
    return { valid: false, error: 'Roll pattern cannot be empty' };
  }

  const trimmed = pattern.trim();

  // Basic pattern validation: should contain 'd' or 'D'
  if (!trimmed.toLowerCase().includes('d')) {
    return { valid: false, error: 'Roll pattern must contain "d" (e.g., d20, 2d6+3)' };
  }

  // Check for valid characters (numbers, d/D, +, -, spaces)
  if (!/^[\dd\sD+\-]+$/.test(trimmed)) {
    return { valid: false, error: 'Invalid characters in roll pattern' };
  }

  // More specific validation could be added here
  // For now, let the backend handle detailed parsing

  return { valid: true };
}
