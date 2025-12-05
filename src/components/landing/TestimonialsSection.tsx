'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Card, CardContent } from '@/components/ui/card';
import { Quote } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Content Marketing Manager',
    company: 'TechCorp',
    content:
      'This AI content writer has transformed our content creation process. The web search integration ensures our articles are always accurate and up-to-date.',
    avatar: 'SJ',
  },
  {
    name: 'Michael Chen',
    role: 'Freelance Writer',
    company: 'Independent',
    content:
      'The human-in-the-loop feature gives me complete control while still benefiting from AI speed. I can review and approve every important decision.',
    avatar: 'MC',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Data Analyst',
    company: 'Analytics Pro',
    content:
      'The automatic graph generation is a game-changer. It turns my data into beautiful visualizations that I can easily customize and embed.',
    avatar: 'ER',
  },
];

export function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate heading
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

      // Animate testimonial cards
      const cards = cardsRef.current?.querySelectorAll('.testimonial-card');
      if (cards) {
        gsap.from(cards, {
          scrollTrigger: {
            trigger: cardsRef.current,
            start: 'top 75%',
            end: 'top 30%',
            scrub: 1,
          },
          opacity: 0,
          y: 80,
          rotationY: -15,
          stagger: 0.15,
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-24 px-6 sm:px-8 lg:px-12 bg-linear-to-br from-muted/50 to-background"
    >
      <div className="max-w-7xl mx-auto">
        <div ref={headingRef} className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            What Our Users Say
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of content creators who trust our AI-powered platform
          </p>
        </div>

        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="testimonial-card bg-card border-2 hover:shadow-2xl transition-shadow duration-300"
            >
              <CardContent className="pt-6">
                <Quote className="w-10 h-10 text-primary mb-4 opacity-50" />
                <p className="text-foreground mb-6 text-lg leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-linear-to-br from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.company}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
