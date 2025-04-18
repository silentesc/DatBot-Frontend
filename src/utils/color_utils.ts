export function decimalToHex(decimal: number): string {
    if (decimal === 0) return "#99aab5";
    return '#' + decimal.toString(16).padStart(6, '0');
}
