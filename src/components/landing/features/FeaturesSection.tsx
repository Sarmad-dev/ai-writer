import { BentoGrid, BentoCard } from "../BentoGrid"
import { Sparkles, MessageSquare, FileText, Zap, Globe, Lock } from "lucide-react"

const editorPreview = (
  <div className="rounded-lg border border-border bg-background/50 p-3 font-mono text-xs">
    <div className="flex gap-2 mb-2 pb-2 border-b border-border">
      <span className="text-muted-foreground">B</span>
      <span className="text-muted-foreground italic">I</span>
      <span className="text-muted-foreground underline">U</span>
    </div>
    <p className="text-muted-foreground">
      <span className="text-foreground">The quick brown fox</span> jumps over the lazy dog...
    </p>
  </div>
)

const chatPreview = (
  <div className="space-y-2">
    <div className="flex justify-end">
      <div className="rounded-lg bg-secondary px-3 py-1.5 text-xs text-foreground max-w-[80%]">Write a blog intro</div>
    </div>
    <div className="flex justify-start">
      <div className="rounded-lg bg-muted px-3 py-1.5 text-xs text-muted-foreground max-w-[80%]">
        Here&apos;s an engaging intro...
      </div>
    </div>
  </div>
)

const analyticsPreview = (
  <div className="flex items-end gap-1 h-16">
    {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
      <div
        key={i}
        className="flex-1 bg-linear-to-t from-muted-foreground/30 to-muted-foreground/60 rounded-t"
        style={{ height: `${height}%` }}
      />
    ))}
  </div>
)

export function FeaturesSection() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block mb-4 text-sm font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full">
            Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Everything you need to create
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
            Powerful AI-driven tools designed to transform how you write, edit, and collaborate on content.
          </p>
        </div>

        <BentoGrid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {/* Large card - spans 2 columns */}
          <BentoCard
            title="AI-Powered Writing"
            description="Generate high-quality content with our advanced AI. From blog posts to marketing copy, get intelligent suggestions that match your tone and style."
            icon={<Sparkles className="h-5 w-5" />}
            className="lg:col-span-2 lg:row-span-2"
          >
            <div className="space-y-4">
              {editorPreview}
              <div className="flex gap-2">
                <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">GPT-4</span>
                <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">Claude</span>
                <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">Custom</span>
              </div>
            </div>
          </BentoCard>

          {/* Chat interface card */}
          <BentoCard
            title="Smart Chat Interface"
            description="Have natural conversations with AI to brainstorm ideas, refine drafts, or get instant feedback."
            icon={<MessageSquare className="h-5 w-5" />}
          >
            {chatPreview}
          </BentoCard>

          {/* Rich text editor card */}
          <BentoCard
            title="Rich Text Editor"
            description="Built on Tiptap with full formatting, tables, embeds, and real-time collaboration support."
            icon={<FileText className="h-5 w-5" />}
          />

          {/* Real-time card */}
          <BentoCard
            title="Lightning Fast"
            description="Optimized for speed with edge deployment and streaming responses for instant AI feedback."
            icon={<Zap className="h-5 w-5" />}
          >
            {analyticsPreview}
          </BentoCard>

          {/* Multi-language card */}
          <BentoCard
            title="40+ Languages"
            description="Write and translate content in over 40 languages with native-quality output."
            icon={<Globe className="h-5 w-5" />}
          />

          {/* Security card */}
          <BentoCard
            title="Enterprise Security"
            description="SOC 2 compliant with end-to-end encryption. Your content stays private and secure."
            icon={<Lock className="h-5 w-5" />}
          />
        </BentoGrid>
      </div>
    </section>
  )
}
