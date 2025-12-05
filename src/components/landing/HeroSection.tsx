'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from "@gsap/react"
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadlineRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const ctx = gsap.context(() => {
      // Create timeline for text reveal animations
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Animate background
      tl.from(backgroundRef.current, {
        opacity: 0,
        scale: 1.2,
        duration: 1.5,
      });

      // Animate headline with split text effect
      if (headlineRef.current) {
        const words = headlineRef.current.querySelectorAll('.word');
        tl.from(
          words,
          {
            opacity: 0,
            y: 50,
            rotationX: -90,
            transformOrigin: 'top center',
            stagger: 0.1,
            duration: 0.8,
          },
          '-=1'
        );
      }

      // Animate subheadline
      tl.from(
        subheadlineRef.current,
        {
          opacity: 0,
          y: 30,
          duration: 0.8,
        },
        '-=0.4'
      );

      // Animate CTA buttons
      tl.from(
        ctaRef.current?.children || [],
        {
          opacity: 0,
          y: 20,
          stagger: 0.15,
          duration: 0.6,
        },
        '-=0.3'
      );

      // Floating animation for sparkles
      gsap.to('.sparkle', {
        y: -20,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: {
          each: 0.3,
          from: 'random',
        },
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-linear-to-br from-indigo-50 via-background to-purple-50 dark:from-gray-900 dark:via-background dark:to-indigo-950"
    >
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Animated background effects */}
      <div
        ref={backgroundRef}
        className="absolute inset-0 opacity-30 dark:opacity-20"
        aria-hidden="true"
      >
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl animate-blob" />
        <div className="absolute top-40 right-20 w-72 h-72 bg-indigo-300 dark:bg-indigo-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 dark:bg-pink-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl animate-blob animation-delay-4000" />
      </div>

      {/* Floating sparkles */}
      <Sparkles className="sparkle absolute top-20 left-1/4 w-8 h-8 text-indigo-400 dark:text-indigo-300 opacity-60" />
      <Sparkles className="sparkle absolute top-1/3 right-1/4 w-6 h-6 text-purple-400 dark:text-purple-300 opacity-60" />
      <Sparkles className="sparkle absolute bottom-1/3 left-1/3 w-7 h-7 text-pink-400 dark:text-pink-300 opacity-60" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
        <h1
          ref={headlineRef}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight"
        >
          <span className="word inline-block">Create</span>{' '}
          <span className="word inline-block bg-linear-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
            Stunning
          </span>{' '}
          <span className="word inline-block">Content</span>{' '}
          <span className="word inline-block">with</span>{' '}
          <span className="word inline-block">AI</span>
        </h1>

        <p
          ref={subheadlineRef}
          className="text-xl sm:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto"
        >
          Transform your ideas into professional content with our AI-powered
          writing assistant. Search the web, generate graphs, and edit with
          ease.
        </p>

        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/register">
            <Button
              size="lg"
              className="bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 dark:from-indigo-500 dark:to-purple-500 dark:hover:from-indigo-600 dark:hover:to-purple-600 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/login">
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-6 text-lg rounded-full border-2 hover:bg-accent transition-all"
            >
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
