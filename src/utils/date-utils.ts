export function formatGeneratedOn(date: Date): { formatted: string; year: number } {
  console.log("🔹 Raw Date input:", date);
  console.log("🔹 toISOString():", date.toISOString());
  console.log("🔹 toUTCString():", date.toUTCString());
  console.log("🔹 toString():", date.toString());

  const formatted = date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });

  console.log("🔹 Final formatted (en-IN):", formatted);
  console.log("🔹 Extracted year:", date.getFullYear());

  return {
    formatted,
    year: date.getFullYear(),
  };
}
