"use client";

import { TestimonialsColumn } from "./testimonials-columns";
import { motion } from "framer-motion";

const allTestimonials = [
  {
    text: "Efferd has completely transformed our content workflow. What used to take hours now takes minutes, and the quality is consistently better.",
    name: "Sarah Chen",
    role: "Head of Content at TechFlow",
    image:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
  },
  {
    text: "The AI chat interface is incredibly intuitive. It feels like having a senior editor available 24/7 to help refine and improve our writing.",
    name: "Marcus Johnson",
    role: "Marketing Director at Growthy",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  },
  {
    text: "We've seen a 3x increase in content output since adopting Efferd. The Tiptap editor integration is seamless and powerful.",
    name: "Emily Rodriguez",
    role: "CEO at ContentScale",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
  },
  {
    text: "Finally, an AI writing tool that understands context and maintains our brand voice. It's become essential to our team.",
    name: "David Kim",
    role: "Product Lead at Nexus",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  },
  {
    text: "The collaboration features are game-changing. Our entire team can work together with AI assistance in real-time.",
    name: "Lisa Thompson",
    role: "Content Manager at Acme Inc",
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
  },
  {
    text: "Enterprise-grade security with consumer-grade simplicity. Efferd checks all the boxes for our organization.",
    name: "James Wilson",
    role: "CTO at SecureWrite",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
  },
  {
    text: "The multi-language support is phenomenal. We can now create content for our global audience without missing a beat.",
    name: "Ana Martinez",
    role: "Global Marketing Lead at WorldTech",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
  },
  {
    text: "Efferd's AI suggestions have improved our content quality dramatically. It's like having an expert copywriter on demand.",
    name: "Robert Chang",
    role: "Creative Director at BrandForge",
    image:
      "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150&h=150&fit=crop&crop=face",
  },
  {
    text: "The speed and accuracy of content generation is unmatched. We've reduced our content production time by 70%.",
    name: "Jessica Park",
    role: "Content Strategy Manager at FastTrack",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
  },
];

// Split testimonials into 3 columns
const column1 = allTestimonials.slice(0, 3);
const column2 = allTestimonials.slice(3, 6);
const column3 = allTestimonials.slice(6, 9);

export function TestimonialsSection() {
  return (
    <section className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block mb-4 text-sm font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Loved by content teams
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
            See what industry leaders are saying about how Efferd has
            transformed their content creation process.
          </p>
        </motion.div>

        <div className="relative h-[600px] overflow-hidden max-w-6xl mx-auto">
          <div className="mt-10 flex max-h-[740px] justify-center gap-6 overflow-hidden mask-[linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)]">
            <TestimonialsColumn
              testimonials={column1}
              className="flex-1"
              duration={15}
            />
            <TestimonialsColumn
              testimonials={column2}
              className="flex-1 hidden md:block"
              duration={19}
            />
            <TestimonialsColumn
              testimonials={column3}
              className="flex-1 hidden lg:block"
              duration={17}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
