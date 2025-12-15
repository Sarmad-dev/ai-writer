'use client';

interface IconProps {
  className?: string;
}

export function OpenAIIcon({ className = "w-12 h-12" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="openai-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="20" fill="url(#openai-gradient)" />
      <path
        d="M24 8C16.268 8 10 14.268 10 22s6.268 14 14 14 14-6.268 14-14S31.732 8 24 8zm0 24c-5.523 0-10-4.477-10-10s4.477-10 10-10 10 4.477 10 10-4.477 10-10 10z"
        fill="white"
        fillOpacity="0.9"
      />
      <circle cx="24" cy="22" r="6" fill="white" />
      <circle cx="24" cy="22" r="3" fill="url(#openai-gradient)" />
    </svg>
  );
}

export function MicrosoftIcon({ className = "w-12 h-12" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="8" width="14" height="14" fill="#F25022" rx="2" />
      <rect x="26" y="8" width="14" height="14" fill="#7FBA00" rx="2" />
      <rect x="8" y="26" width="14" height="14" fill="#00A4EF" rx="2" />
      <rect x="26" y="26" width="14" height="14" fill="#FFB900" rx="2" />
    </svg>
  );
}

export function GoogleIcon({ className = "w-12 h-12" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
        fill="#EA4335"
      />
      <path
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
        fill="#4285F4"
      />
      <path
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
        fill="#FBBC05"
      />
      <path
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
        fill="#34A853"
      />
    </svg>
  );
}

export function AmazonIcon({ className = "w-12 h-12" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="amazon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF9900" />
          <stop offset="100%" stopColor="#FF6600" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="8" fill="url(#amazon-gradient)" />
      <path
        d="M13 32c0-1.1.9-2 2-2h18c1.1 0 2 .9 2 2s-.9 2-2 2H15c-1.1 0-2-.9-2-2z"
        fill="white"
      />
      <path
        d="M30 18c0 3.31-2.69 6-6 6s-6-2.69-6-6 2.69-6 6-6 6 2.69 6 6z"
        fill="white"
      />
      <path
        d="M28 36c0 1.1-.9 2-2 2H22c-1.1 0-2-.9-2-2s.9-2 2-2h4c1.1 0 2 .9 2 2z"
        fill="white"
      />
      <path
        d="M35 30c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z"
        fill="white"
      />
    </svg>
  );
}

export function MetaIcon({ className = "w-12 h-12" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="meta-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0081FB" />
          <stop offset="100%" stopColor="#0066CC" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="20" fill="url(#meta-gradient)" />
      <path
        d="M16 18c-2.21 0-4 1.79-4 4v8c0 2.21 1.79 4 4 4h16c2.21 0 4-1.79 4-4v-8c0-2.21-1.79-4-4-4H16zm8 6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-6 0c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm12 0c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"
        fill="white"
        fillOpacity="0.9"
      />
    </svg>
  );
}

export function AppleIcon({ className = "w-12 h-12" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="apple-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A3A3A3" />
          <stop offset="100%" stopColor="#737373" />
        </linearGradient>
      </defs>
      <path
        d="M30.84 15.02c-1.17 0-2.74.69-3.65 1.53-.78.72-1.46 1.85-1.46 2.96 0 .17.03.34.08.5 1.37-.11 2.74-.69 3.65-1.53.78-.72 1.46-1.85 1.46-2.96 0-.17-.03-.34-.08-.5z"
        fill="url(#apple-gradient)"
      />
      <path
        d="M24 8c-8.84 0-16 7.16-16 16s7.16 16 16 16 16-7.16 16-16S32.84 8 24 8zm5.5 24.5c-.83 1.5-1.83 2.83-3 4-1.17 1.17-2.5 2.17-4 3-.83.5-1.67.83-2.5 1-.83.17-1.67.17-2.5 0-.83-.17-1.67-.5-2.5-1-1.5-.83-2.83-1.83-4-3-1.17-1.17-2.17-2.5-3-4-.5-.83-.83-1.67-1-2.5-.17-.83-.17-1.67 0-2.5.17-.83.5-1.67 1-2.5.83-1.5 1.83-2.83 3-4 1.17-1.17 2.5-2.17 4-3 .83-.5 1.67-.83 2.5-1 .83-.17 1.67-.17 2.5 0 .83.17 1.67.5 2.5 1 1.5.83 2.83 1.83 4 3 1.17 1.17 2.17 2.5 3 4 .5.83.83 1.67 1 2.5.17.83.17 1.67 0 2.5-.17.83-.5 1.67-1 2.5z"
        fill="url(#apple-gradient)"
      />
    </svg>
  );
}