export function roundValue(value: number, fractionDigits = 3): number {
  return parseFloat(value.toFixed(fractionDigits));
}
