// ❗ SERVER ONLY — do not import in client components

export const REQUIRED_ENV_VARS = {
    NEXT_PUBLIC_API_URL: 'API URL',
  } as const;
  
  export function validateServerEnv() {
    const missing: string[] = [];
  
    for (const key of Object.keys(REQUIRED_ENV_VARS)) {
      if (!process.env[key]) {
        missing.push(key);
      }
    }
  
    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables:\n${missing.join('\n')}`
      );
    }
  }
  