export function getSlotTime(time: Date): string {
  const hours = time.getUTCHours().toString().padStart(2, '0');
  const minutes = time.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}
