import { z } from 'zod';

// Load environment variables first
if (typeof window === 'undefined') {
  try {
    require('dotenv').config();
  } catch (error) {
    console.warn('dotenv not available');
  }
}

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1),
  
  // Authentication
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().min(1),
  
  // AI Services
  OPENAI_API_KEY: z.string().min(1),
  
  // Search API
  SEARCH_API_KEY: z.string().min(1),
  
  // File Upload
  UPLOAD_BUCKET_URL: z.string().optional(),
  
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  // Debug: Log what we're getting from process.env
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Environment Debug:');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');
    console.log('BETTER_AUTH_SECRET:', process.env.BETTER_AUTH_SECRET ? '✅ Set' : '❌ Missing');
    console.log('BETTER_AUTH_URL:', process.env.BETTER_AUTH_URL ? '✅ Set' : '❌ Missing');
    console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing');
    console.log('SEARCH_API_KEY:', process.env.SEARCH_API_KEY ? '✅ Set' : '❌ Missing');
  }

  try {
    const envData = {
      DATABASE_URL: process.env.DATABASE_URL,
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
      BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      SEARCH_API_KEY: process.env.SEARCH_API_KEY,
      UPLOAD_BUCKET_URL: process.env.UPLOAD_BUCKET_URL,
      NODE_ENV: process.env.NODE_ENV || 'development',
    };

    return envSchema.parse(envData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        const value = process.env[path as keyof typeof process.env];
        console.error(`  - ${path}: ${value ? `Invalid (${issue.message})` : 'Missing'}`);
      });
      
      const missingVars = error.issues.map((issue) => issue.path.join('.')).join(', ');
      throw new Error(
        `Missing or invalid environment variables: ${missingVars}\n` +
        'Please check your .env file and ensure all required variables are set.\n' +
        'Make sure to restart your development server after changing .env files.'
      );
    }
    throw error;
  }
}

// Validate environment variables at startup
export const env = validateEnv();
