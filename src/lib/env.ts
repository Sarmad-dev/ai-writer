import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // Authentication
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  
  // AI Services
  OPENAI_API_KEY: z.string().min(1),
  
  // Search API
  SEARCH_API_KEY: z.string().min(1),
  
  // File Upload
  UPLOAD_BUCKET_URL: z.string().url().optional(),
  
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  try {
    return envSchema.parse({
      DATABASE_URL: process.env.DATABASE_URL,
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
      BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      SEARCH_API_KEY: process.env.SEARCH_API_KEY,
      UPLOAD_BUCKET_URL: process.env.UPLOAD_BUCKET_URL,
      NODE_ENV: process.env.NODE_ENV,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((issue) => issue.path.join('.')).join(', ');
      throw new Error(
        `Missing or invalid environment variables: ${missingVars}\n` +
        'Please check your .env file and ensure all required variables are set.'
      );
    }
    throw error;
  }
}

// Validate environment variables at startup
export const env = validateEnv();
