export function rethrowProviderError(provider: string, error: unknown): never {
  if (error instanceof Error) {
    throw new Error(`${provider} request failed: ${error.message}`);
  }

  throw new Error(`${provider} request failed.`);
}
