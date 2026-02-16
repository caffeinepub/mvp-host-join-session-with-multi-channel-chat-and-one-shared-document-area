export type RollValidation = {
  valid: boolean;
  error?: string;
  numDice?: number;
  diceSize?: number;
  modifier?: number;
};

export function parseRollCommand(pattern: string): RollValidation {
  if (!pattern || !pattern.trim()) {
    return { valid: false, error: 'Invalid dice format. Use e.g. /roll d20+5' };
  }

  const trimmed = pattern.trim();
  
  // Exact regex as specified: /^(\d+)?d(\d+)([+-]\d+)?$/i
  const regex = /^(\d+)?d(\d+)([+-]\d+)?$/i;
  const match = trimmed.match(regex);

  if (!match) {
    return { valid: false, error: 'Invalid dice format. Use e.g. /roll d20+5' };
  }

  const numDice = match[1] ? parseInt(match[1], 10) : 1;
  const diceSize = parseInt(match[2], 10);
  const modifier = match[3] ? parseInt(match[3], 10) : 0;

  // Sanity checks
  if (numDice < 1 || numDice > 100) {
    return { valid: false, error: 'Number of dice must be between 1 and 100' };
  }

  if (diceSize < 1) {
    return { valid: false, error: 'Dice size must be at least 1' };
  }

  return { valid: true, numDice, diceSize, modifier };
}

export function rollDice(numDice: number, diceSize: number): number[] {
  const rolls: number[] = [];
  for (let i = 0; i < numDice; i++) {
    // Math.random() * sides | 0 + 1 for each die
    const roll = (Math.random() * diceSize | 0) + 1;
    rolls.push(roll);
  }
  return rolls;
}

export function formatRollResult(
  nickname: string,
  pattern: string,
  rolls: number[],
  modifier: number
): string {
  const sum = rolls.reduce((acc, roll) => acc + roll, 0);
  const total = sum + modifier;

  if (rolls.length === 1 && modifier === 0) {
    // Simple format: "Mooohlg rolls d20: 17"
    return `🎲 ${nickname} rolls ${pattern}: ${total}`;
  } else {
    // Detailed format: "Mooohlg rolls 2d6+3: [4, 5] +3 = 12"
    const rollsStr = `[${rolls.join(', ')}]`;
    const modifierStr = modifier !== 0 ? ` ${modifier > 0 ? '+' : ''}${modifier}` : '';
    return `🎲 ${nickname} rolls ${pattern}: ${rollsStr}${modifierStr} = ${total}`;
  }
}
