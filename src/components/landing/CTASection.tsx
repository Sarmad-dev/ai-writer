'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

gsap.registerPlugin(ScrollTrigger);

export function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate content on scroll
      gsap.from(contentRef.current, {
        scrollTrigger: {
          trigger: contentRef.current,
          start: 'top 80%',
          end: 'top 40%',
          scrub: 1,
        },
        opacity: 0,
        y: 60,
        scale: 0.95,
      });

      // Floating animation for sparkles
      gsap.to('.cta-sparkle', {
        y: -15,
        x: 10,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: {
          each: 0.4,
          from: 'random',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 px-6 sm:px-8 lg:px-12 bg-linear-to-br from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-700 dark:via-purple-700 dark:to-pink-700 overflow-hidden"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20" aria-hidden="true">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white dark:bg-indigo-300 rounded-full mix-blend-overlay filter blur-3xl animate-blob" />
        <div className="absolute top-20 right-20 w-64 h-64 bg-pink-200 dark:bg-pink-400 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-10 left-1/2 w-64 h-64 bg-purple-200 dark:bg-purple-400 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Floating sparkles */}
      <Sparkles className="cta-sparkle absolute top-16 left-1/4 w-8 h-8 text-white opacity-40" />
      <Sparkles className="cta-sparkle absolute top-1/3 right-1/4 w-6 h-6 text-pink-200 opacity-40" />
      <Sparkles className="cta-sparkle absolute bottom-1/4 left-1/3 w-7 h-7 text-purple-200 opacity-40" />

      <div ref={contentRef} className="relative z-10 max-w-4xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
          Ready to Transform Your Content?
        </h2>
        <p className="text-xl sm:text-2xl text-white/90 mb-10 max-w-2xl mx-auto">
          Join thousands of creators using AI to produce professional content faster
          than ever before.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/register">
            <Button
              size="lg"
              className="bg-white text-indigo-600 hover:bg-gray-100 dark:bg-gray-100 dark:text-indigo-700 dark:hover:bg-white px-8 py-6 text-lg rounded-full shadow-2xl hover:shadow-3xl transition-all font-semibold"
            >
              Start Creating Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/login">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg rounded-full transition-all"
            >
              Sign In
            </Button>
          </Link>
        </div>
        <p className="mt-8 text-white/80 text-sm">
          No credit card required • Free forever plan available
        </p>
      </div>
    </section>
  );
}
