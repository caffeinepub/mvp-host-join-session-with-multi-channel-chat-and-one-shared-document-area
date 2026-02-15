export function formatTimestamp(timestamp: bigint): string {
  // Convert nanoseconds to milliseconds
  const ms = Number(timestamp / BigInt(1_000_000));
  const date = new Date(ms);

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    // Show time only for today
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else {
    // Show date and time for older messages
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
