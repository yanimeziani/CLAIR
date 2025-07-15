'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Shield, Users, MessageSquare, FileText, Heart, Activity, Calendar, BarChart3, 
  Download, Database, Star, ArrowRight, CheckCircle, Sparkles, Lock, 
  Clock, Zap, Award, Target
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
      {/* Header */}
      <header className="wealth-nav sticky top-0 z-50">
        <div className="wealth-container py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8">
                <Image 
                  src="/logo.svg" 
                  alt="CLAIR Logo" 
                  width={32} 
                  height={32}
                  className="h-full w-full"
                />
              </div>
              <span className="heading-md">
                CLAIR
              </span>
            </div>
            
            <div className="flex items-center space-x-8">
              <div className="hidden lg:flex items-center space-x-8">
                <button className="body-text hover:text-gray-900 font-medium transition-colors">
                  Fonctionnalités
                </button>
                <button className="body-text hover:text-gray-900 font-medium transition-colors">
                  Avantages
                </button>
                <button className="body-text hover:text-gray-900 font-medium transition-colors">
                  Contact
                </button>
              </div>
              <button 
                onClick={handleLogin}
                disabled={isLoading}
                className="wealth-button-primary"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Connexion...</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>Se connecter</span>
                  </>
                )}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section - Enhanced with mockingjay theme */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Background Video */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 w-full h-full object-cover blur-md scale-105"
          style={{ filter: 'blur(8px) brightness(0.6)' }}
        >
          <source src="/loop-bg.mp4" type="video/mp4" />
          {/* Fallback background image */}
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{backgroundImage: "url('/bg.jpg')"}}></div>
        </video>
        
        {/* Multi-layer overlay for optimal text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-slate-900/40 to-slate-900/60"></div>
        <div className="absolute inset-0 backdrop-blur-sm bg-slate-900/10"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-red-400 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse delay-500"></div>
        
        <div className="wealth-container relative z-10 flex flex-col justify-center min-h-screen text-center text-white">
          {/* Badge */}
          <div className="mb-8">
            <div className="inline-flex items-center space-x-3 bg-white/15 backdrop-blur-md border border-white/30 rounded-full px-6 py-3 shadow-lg shadow-black/10">
              <Heart className="h-4 w-4 text-red-400" />
              <span className="text-sm font-medium">Québec • Innovation DI-TSA</span>
              <span className="text-amber-400">⚜️</span>
            </div>
          </div>
          
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 max-w-6xl mx-auto leading-tight">
            L'avenir des soins
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              commence ici
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto text-slate-300 leading-relaxed">
            Révolutionnez la gestion de vos résidences DI-TSA avec l'intelligence artificielle, 
            des outils intuitifs et une sécurité sans compromis.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <button 
              onClick={handleLogin}
              disabled={isLoading}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-2xl shadow-orange-500/25 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isLoading ? (
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Connexion...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <span>Découvrir CLAIR</span>
                  <ArrowRight className="h-5 w-5" />
                </div>
              )}
            </button>
            <button className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5" />
                <span>Démo guidée</span>
              </div>
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-slate-300">
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 shadow-lg shadow-black/10">
              <Shield className="h-4 w-4 text-blue-400" />
              <span>Sécurité locale</span>
            </div>
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 shadow-lg shadow-black/10">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>Données privées</span>
            </div>
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 shadow-lg shadow-black/10">
              <Award className="h-4 w-4 text-amber-400" />
              <span>Projet pilote</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
