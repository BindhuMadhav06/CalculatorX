export function validatePin(pin: string, expectedLength: number = 6): boolean {
  const regex = new RegExp(`^\\d{${expectedLength}}$`);
  return regex.test(pin);
}

export function validatePairingCode(code: string): boolean {
  return /^[A-Z0-9]{6}$/.test(code.toUpperCase());
}

export function formatPairingCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
}
