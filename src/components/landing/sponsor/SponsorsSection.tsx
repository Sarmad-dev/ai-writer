import type React from "react"
import { cn } from "@/lib/utils"

function OpenAIIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
    </svg>
  )
}

function TursoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6zm4 4h-2v-2h2v2zm0-4h-2V7h2v6z" />
      <path d="M19 8.5c0-1.5-1-2.5-2.5-2.5H14v2h2c.55 0 1 .45 1 1s-.45 1-1 1h-2v2h2.5c1.5 0 2.5-1 2.5-2.5zM7.5 6C6 6 5 7 5 8.5S6 11 7.5 11H10V9H8c-.55 0-1-.45-1-1s.45-1 1-1h2V5H7.5z" />
    </svg>
  )
}

function VercelIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 19.5h20L12 2z" />
    </svg>
  )
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

function ClaudeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.4l-6.4 4.8 2.4-7.2-6-4.8h7.6L12 2z" />
    </svg>
  )
}

function ClerkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a5 5 0 0 0-5 5v3H5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1h-2V7a5 5 0 0 0-5-5zm-3 8V7a3 3 0 1 1 6 0v3H9zm3 4a2 2 0 0 1 1 3.732V19a1 1 0 0 1-2 0v-1.268A2 2 0 0 1 12 14z" />
    </svg>
  )
}

function NvidiaIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8.948 8.798v-1.43a6.7 6.7 0 0 1 .424-.018c3.922-.124 6.493 3.374 6.493 3.374s-2.774 3.851-5.75 3.851c-.422 0-.812-.058-1.167-.166v-4.574c1.342.122 1.612.836 2.417 2.262l1.795-1.497s-1.347-1.8-3.503-1.8a6.09 6.09 0 0 0-.709.018zm0-5.083v2.329l.424-.036c5.136-.173 8.545 4.223 8.545 4.223s-3.9 4.742-7.83 4.742c-.396 0-.77-.036-1.139-.1v1.504c.327.036.666.06 1.014.06 3.47 0 5.985-1.763 8.455-3.862.405.324 2.07 1.117 2.412 1.461-2.163 1.78-7.199 3.904-10.786 3.904-.373 0-.734-.024-1.095-.066v1.831h12.916V3.715H8.948z" />
    </svg>
  )
}

const sponsors = [
  { name: "OpenAI", Icon: OpenAIIcon },
  { name: "TURSO", Icon: TursoIcon },
  { name: "Vercel", Icon: VercelIcon },
  { name: "GitHub", Icon: GitHubIcon },
  { name: "Claude", Icon: ClaudeIcon },
  { name: "Clerk", Icon: ClerkIcon },
  { name: "NVIDIA", Icon: NvidiaIcon },
]

function SponsorLogo({ name, Icon }: { name: string; Icon: React.FC<{ className?: string }> }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-muted-foreground/60 px-8",
        "hover:text-muted-foreground transition-colors duration-300",
        "whitespace-nowrap",
      )}
    >
      <Icon className="w-5 h-5" />
      <span className="text-base md:text-lg font-semibold tracking-wide">{name}</span>
    </div>
  )
}

export function SponsorsSection() {
  return (
    <section className="relative bg-background overflow-hidden">
      <div className="relative">
        <div className="relative w-full h-12 flex items-end">
          {/* SVG for the curved line spanning full width */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 48" fill="none" preserveAspectRatio="none">
            {/* Line from left edge → curves up → flat top → curves down → right edge */}
            <path
              d="M0 47 L460 47 Q480 47 490 35 Q500 23 510 12 Q520 0 530 0 L670 0 Q680 0 690 12 Q700 23 710 35 Q720 47 740 47 L1200 47"
              className="stroke-border"
              strokeWidth="1"
              fill="none"
            />
          </svg>
          {/* Text positioned above the bump */}
          <p className="absolute left-1/2 -translate-x-1/2 top-0 text-lg text-muted-foreground">Trusted by experts</p>
        </div>

        {/* Marquee container */}
        <div className="py-8 md:py-10">
          <div className="relative flex overflow-hidden">
            {/* Fade edges */}
            <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-background to-transparent" />

            {/* Scrolling track */}
            <div className="animate-marquee flex items-center">
              {[...sponsors, ...sponsors].map((sponsor, idx) => (
                <SponsorLogo key={`${sponsor.name}-${idx}`} {...sponsor} />
              ))}
            </div>
            <div className="animate-marquee flex items-center" aria-hidden="true">
              {[...sponsors, ...sponsors].map((sponsor, idx) => (
                <SponsorLogo key={`${sponsor.name}-dup-${idx}`} {...sponsor} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
