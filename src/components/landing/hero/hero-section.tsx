import { Button } from "@/components/ui/button"
import { ArrowRight, Rocket, Phone } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[40px_40px] opacity-50" />

      <div className="relative px-4 pb-24 pt-32 md:pb-32 md:pt-40">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/30 px-4 py-2 text-sm text-muted-foreground backdrop-blur-sm transition-all hover:bg-secondary/50 hover:border-muted-foreground/30 cursor-pointer">
              <Rocket className="h-4 w-4" />
              <span>Shipped new features!</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>

          <h1 className="mx-auto max-w-4xl text-balance text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl xl:text-7xl leading-[1.1]">
            AI Writing That Helps
            <br />
            You Create and Lead
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-pretty text-center text-base text-muted-foreground md:text-lg">
            Connecting you with intelligent AI to write, innovate and create compelling content
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              variant="outline"
              className="gap-2 rounded-full px-6 bg-transparent border-border hover:bg-secondary/50"
            >
              <Phone className="h-4 w-4" />
              Book a Call
            </Button>
            <Button
              size="lg"
              className="group gap-2 rounded-full px-6 text-primary-foreground hover:bg-primary/90"
            >
              Get started
              <ArrowRight className="h-4 w-4 arrow-slide" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
