export function formatAddress(address?: string) {
  if (!address) return 'Not connected';

  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}