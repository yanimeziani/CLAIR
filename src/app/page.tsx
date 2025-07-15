'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Shield, Heart, Calendar, ArrowRight, CheckCircle, Lock, 
  Award
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      
      if (data.authenticated) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Session check error:', error);
    }
  }, [router]);

  useEffect(() => {
    checkSession();
    
    // Apple-style scroll fade-in animation
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);
    
    // Observe all fade-in elements
    const fadeInElements = document.querySelectorAll('.scroll-fade-in');
    fadeInElements.forEach((el) => observer.observe(el));
    
    return () => {
      fadeInElements.forEach((el) => observer.unobserve(el));
    };
  }, [checkSession]);

  const handleLogin = () => {
    setIsLoading(true);
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Simplified for internal tool */}
      <header className="wealth-nav sticky top-0 z-50">
        <div className="wealth-container py-4 sm:py-6 px-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-7 w-7 sm:h-8 sm:w-8">
                <Image 
                  src="/logo.svg" 
                  alt="CLAIR Logo" 
                  width={32} 
                  height={32}
                  className="h-full w-full"
                />
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-800">
                CLAIR
              </span>
            </div>
            
            {/* Login Button Only */}
            <button 
              onClick={handleLogin}
              disabled={isLoading}
              className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg"
            >
              {isLoading ? (
                <>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="hidden sm:inline">Connexion...</span>
                </>
              ) : (
                <>
                  <Lock className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Se connecter</span>
                </>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section - Mesh Gradient Background */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Mesh Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-teal-100/40 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-slate-50/20 to-transparent"></div>
        
        {/* Floating Elements - Subtle accents */}
        <div className="absolute top-16 left-4 sm:top-20 sm:left-10 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-teal-400/60 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-8 sm:top-40 sm:right-20 w-1 h-1 bg-blue-400/60 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-16 left-8 sm:bottom-20 sm:left-20 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-slate-400/60 rounded-full animate-pulse delay-500"></div>
        
        <div className="px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col justify-center min-h-screen text-center text-gray-800 max-w-7xl mx-auto">
          {/* Badge */}
          <div className="mb-6 sm:mb-8">
            <div className="inline-flex items-center space-x-2 sm:space-x-3 bg-white/80 backdrop-blur-md border border-teal-200/50 rounded-full px-3 py-2 sm:px-6 sm:py-3 shadow-lg shadow-teal-500/10">
              <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">Québec • Innovation DI-TSA</span>
              <span className="text-amber-500 text-sm">⚜️</span>
            </div>
          </div>
          
          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 sm:mb-8 max-w-6xl mx-auto leading-tight">
            <span className="block sm:inline text-gray-800">L'avenir des soins</span>
            <br className="hidden sm:block" /><span className="hidden sm:inline"> </span>
            <span className="bg-gradient-to-r from-teal-600 via-blue-600 to-slate-700 bg-clip-text text-transparent block sm:inline">
              commence ici
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 sm:mb-12 max-w-3xl mx-auto text-gray-600 leading-relaxed px-4">
            Révolutionnez la gestion de vos résidences DI-TSA avec l'intelligence artificielle, 
            des outils intuitifs et une sécurité sans compromis.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-12 sm:mb-16 px-4">
            <button 
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold shadow-2xl shadow-cyan-500/25 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 min-h-[44px]"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Connexion...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3">
                  <span>Découvrir CLAIR</span>
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              )}
            </button>
            <button className="w-full sm:w-auto bg-white/70 backdrop-blur-sm border border-gray-200 text-gray-700 px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-white/90 transition-all duration-300 hover:scale-105 min-h-[44px] shadow-lg">
              <div className="flex items-center justify-center space-x-3">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Démo guidée</span>
              </div>
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3 sm:gap-4 md:gap-8 text-xs sm:text-sm text-gray-600 px-4">
            <div className="flex items-center space-x-2 sm:space-x-3 bg-white/60 backdrop-blur-md border border-gray-200/50 rounded-full px-3 sm:px-4 py-2 shadow-lg shadow-teal-500/10">
              <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
              <span>Sécurité locale</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 bg-white/60 backdrop-blur-md border border-gray-200/50 rounded-full px-3 sm:px-4 py-2 shadow-lg shadow-teal-500/10">
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
              <span>Données privées</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 bg-white/60 backdrop-blur-md border border-gray-200/50 rounded-full px-3 sm:px-4 py-2 shadow-lg shadow-teal-500/10">
              <Award className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500" />
              <span>Projet pilote</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
