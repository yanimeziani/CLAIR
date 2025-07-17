'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Shield, Heart, Calendar, ArrowRight, CheckCircle, Lock, 
  Award, Sparkles, Star, Users, Brain, Activity
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Floating Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-white/50 shadow-lg shadow-blue-100/50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Heart className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  CLAIR
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate">Centre Logiciel d'Aide aux Interventions</p>
              </div>
            </div>
            
            <button 
              onClick={handleLogin}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center space-x-1 sm:space-x-2 shadow-lg hover:shadow-xl hover:scale-105 flex-shrink-0 min-h-[40px] sm:min-h-[44px]"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs sm:text-sm">Connexion...</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm whitespace-nowrap">Se connecter</span>
                </>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden flex items-center pt-16 sm:pt-20">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-40 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        {/* Floating Icons */}
        <div className="absolute top-32 left-10 animate-float hidden lg:block">
          <div className="w-16 h-16 bg-white/80 backdrop-blur-xl rounded-xl shadow-lg flex items-center justify-center">
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="absolute top-48 right-10 animate-float animation-delay-1000 hidden lg:block">
          <div className="w-16 h-16 bg-white/80 backdrop-blur-xl rounded-xl shadow-lg flex items-center justify-center">
            <Brain className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <div className="absolute bottom-40 left-20 animate-float animation-delay-2000 hidden lg:block">
          <div className="w-16 h-16 bg-white/80 backdrop-blur-xl rounded-xl shadow-lg flex items-center justify-center">
            <Activity className="h-8 w-8 text-indigo-500" />
          </div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto text-center">
            {/* Badge */}
            <div className="mb-10 sm:mb-12">
              <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-xl border border-blue-200/50 rounded-full px-6 py-3 shadow-xl shadow-blue-500/10">
                <Star className="h-5 w-5 text-amber-500" />
                <span className="text-sm font-semibold text-gray-700">Québec • Innovation en Santé DI-TSA</span>
                <Sparkles className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold mb-10 sm:mb-12 leading-tight">
              <span className="text-gray-800">L'avenir des soins</span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                commence ici
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg sm:text-xl lg:text-2xl mb-14 sm:mb-16 max-w-4xl mx-auto text-gray-600 leading-relaxed">
              Révolutionnez la gestion de vos résidences DI-TSA avec l'intelligence artificielle, 
              des outils intuitifs et une sécurité sans compromis.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-18 sm:mb-20">
              <button 
                onClick={handleLogin}
                disabled={isLoading}
                className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-2xl shadow-blue-500/25 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 min-h-[56px]"
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {isLoading ? (
                  <div className="relative flex items-center justify-center space-x-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Connexion...</span>
                  </div>
                ) : (
                  <div className="relative flex items-center justify-center space-x-3">
                    <span>Accéder à CLAIR</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </button>
              
              <button className="group bg-white/80 backdrop-blur-xl border border-gray-200 text-gray-700 px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-white/90 transition-all duration-300 hover:scale-105 min-h-[56px] shadow-xl">
                <div className="flex items-center justify-center space-x-3">
                  <Calendar className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                  <span>Voir la démo</span>
                </div>
              </button>
            </div>

            {/* Enhanced Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-20">
              <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-xl shadow-blue-100/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Sécurité Avancée</h3>
                  <p className="text-gray-600">Protection des données avec authentification locale et chiffrement de bout en bout</p>
                </CardContent>
              </Card>
              
              <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-xl shadow-purple-100/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">IA Intégrée</h3>
                  <p className="text-gray-600">Assistance intelligente pour la rédaction et l'analyse des rapports médicaux</p>
                </CardContent>
              </Card>
              
              <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-xl shadow-indigo-100/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Collaboration</h3>
                  <p className="text-gray-600">Travail d'équipe simplifié avec communication en temps réel et partage sécurisé</p>
                </CardContent>
              </Card>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-sm text-gray-600 pb-12 sm:pb-16">
              <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-xl border border-gray-200/50 rounded-full px-4 py-2 shadow-lg">
                <Shield className="h-4 w-4 text-blue-500" />
                <span>Conformité HIPAA</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-xl border border-gray-200/50 rounded-full px-4 py-2 shadow-lg">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Données locales</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-xl border border-gray-200/50 rounded-full px-4 py-2 shadow-lg">
                <Award className="h-4 w-4 text-amber-500" />
                <span>Innovation Québec</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
