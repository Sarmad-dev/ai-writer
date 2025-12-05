'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Sparkles,
  Search,
  BarChart3,
  Edit3,
  Image as ImageIcon,
  CheckCircle,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Generation',
    description:
      'Generate high-quality content with advanced AI that understands your needs and creates professional results.',
  },
  {
    icon: Search,
    title: 'Web Search Integration',
    description:
      'Access real-time data from the web to ensure your content is accurate, up-to-date, and well-researched.',
  },
  {
    icon: BarChart3,
    title: 'Automatic Graph Generation',
    description:
      'Transform statistical data into beautiful, editable charts and visualizations automatically.',
  },
  {
    icon: Edit3,
    title: 'Rich Text Editor',
    description:
      'Edit and refine your content with a powerful editor that supports formatting, images, and embedded graphs.',
  },
  {
    icon: ImageIcon,
    title: 'Multimodal Input',
    description:
      'Provide text, images, or other media as input to create comprehensive, visually rich content.',
  },
  {
    icon: CheckCircle,
    title: 'Human-in-the-Loop',
    description:
      'Maintain control with approval requests for critical actions, ensuring the AI works exactly as you want.',
  },
];

export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const ctx = gsap.context(() => {
      // Animate heading on scroll
      gsap.from(headingRef.current, {
        scrollTrigger: {
          trigger: headingRef.current,
          start: 'top 80%',
          end: 'top 50%',
          scrub: 1,
        },
        opacity: 0,
        y: 50,
      });

      // Animate feature cards with stagger
      const cards = cardsRef.current?.querySelectorAll('.feature-card');
      if (cards) {
        gsap.from(cards, {
          scrollTrigger: {
            trigger: cardsRef.current,
            start: 'top 75%',
            end: 'top 25%',
            scrub: 1,
          },
          opacity: 0,
          y: 60,
          scale: 0.9,
          stagger: 0.1,
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-24 px-6 sm:px-8 lg:px-12 bg-background"
    >
      <div className="max-w-7xl mx-auto">
        <div ref={headingRef} className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Powerful Features
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to create professional content with AI assistance
          </p>
        </div>

        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="feature-card border-2 hover:border-primary transition-all duration-300 hover:shadow-xl"
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-linear-to-br from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
