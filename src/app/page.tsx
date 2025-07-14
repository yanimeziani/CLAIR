'use client';

import { useState, useEffect } from 'react';
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
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      
      if (data.authenticated) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Session check error:', error);
    }
  };

  const handleLogin = () => {
    setIsLoading(true);
    router.push('/login');
  };

  return (
    <div className="min-h-screen ws-gradient-main">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-lg border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10">
                <Image 
                  src="/logo.svg" 
                  alt="Irielle Logo" 
                  width={40} 
                  height={40}
                  className="h-full w-full"
                />
              </div>
              <span className="text-2xl font-semibold text-foreground">
                Irielle
              </span>
            </div>
            
            <div className="flex items-center space-x-8">
              <div className="hidden lg:flex items-center space-x-8">
                <button className="text-muted-foreground hover:text-foreground font-medium transition-colors">
                  Fonctionnalités
                </button>
                <button className="text-muted-foreground hover:text-foreground font-medium transition-colors">
                  Avantages
                </button>
                <button className="text-muted-foreground hover:text-foreground font-medium transition-colors">
                  Contact
                </button>
              </div>
              <button 
                onClick={handleLogin}
                disabled={isLoading}
                className="ws-button-primary"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Connexion...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Lock className="h-4 w-4" />
                    <span>Connexion</span>
                  </div>
                )}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section with 3D Elements */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* 3D Background Elements */}
        <div className="absolute inset-0 -z-10">
          {/* Floating geometric shapes */}
          <div className="floating-shape floating-shape-1 bg-gradient-to-br from-blue-500/20 to-blue-600/10 w-32 h-32 rounded-3xl"></div>
          <div className="floating-shape floating-shape-2 bg-gradient-to-br from-blue-600/15 to-blue-700/10 w-24 h-24 rounded-full"></div>
          <div className="floating-shape floating-shape-3 bg-gradient-to-br from-blue-400/25 to-blue-500/15 w-20 h-20 rounded-2xl"></div>
          <div className="floating-shape floating-shape-4 bg-gradient-to-br from-red-500/20 to-red-600/10 w-16 h-16 rounded-full"></div>
          <div className="floating-shape floating-shape-5 bg-gradient-to-br from-blue-500/30 to-blue-600/20 w-28 h-28 rounded-3xl"></div>
          <div className="floating-shape floating-shape-6 bg-gradient-to-br from-blue-300/20 to-blue-400/15 w-36 h-20 rounded-2xl"></div>
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          {/* Quebec Government Badge */}
          <div className="mb-8">
            <div className="inline-flex items-center space-x-3 bg-blue-50 border border-blue-200 rounded-full px-6 py-3 quebec-badge">
              <div className="bg-blue-100 p-1.5 rounded-full">
                <Heart className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-blue-800">Gouvernement du Québec • DI-TSA</span>
              <div className="fleur-de-lis">⚜️</div>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight text-gray-900 hero-title">
            Plateforme de gestion
            <br />
            <span className="text-blue-600 relative">
              DI-TSA Québec
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full opacity-60"></div>
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            Solution officielle pour la gestion des résidences spécialisées DI-TSA. 
            Conçue pour les professionnels de la santé du Québec avec des outils adaptés et conformes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button 
              onClick={handleLogin}
              disabled={isLoading}
              className="quebec-button-primary group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 transition-transform duration-300 group-hover:scale-105"></div>
              <div className="relative z-10 flex items-center space-x-2">
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Connexion...</span>
                  </>
                ) : (
                  <>
                    <span>Accéder à la plateforme</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>
            <button className="quebec-button-outline group">
              <Calendar className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">Formation et support</span>
              <span className="sm:hidden">Formation</span>
            </button>
          </div>

          {/* Government Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600">
            <div className="flex items-center space-x-2 government-badge">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Conformité gouvernementale</span>
            </div>
            <div className="flex items-center space-x-2 government-badge">
              <Shield className="h-4 w-4 text-blue-600" />
              <span>Sécurité certifiée</span>
            </div>
            <div className="flex items-center space-x-2 government-badge">
              <Award className="h-4 w-4 text-red-600" />
              <span>Solution officielle Québec</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold mb-6 text-foreground">
              Fonctionnalités principales
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Des outils spécialement conçus pour les défis uniques des résidences DI-TSA
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="ws-card group">
              <div className="bg-primary/10 p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">Gestion des Résidents</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Profils complets avec informations personnelles, médicales, allergies et contacts d'urgence. 
                Observations signées électroniquement pour un suivi professionnel.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                  <span>Profils médicaux avec éditeur riche</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                  <span>Observations signées numériquement</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                  <span>IA - Correction et résumés automatiques</span>
                </div>
              </div>
            </div>

            <div className="ws-card group">
              <div className="bg-accent/10 p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                <MessageSquare className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">Communications d'Équipe</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Communications sécurisées avec éditeur enrichi par IA, système d'alertes urgentes 
                et suivi des accusés de réception en temps réel.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                  <span>Éditeur avec assistance IA</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                  <span>Messages urgents prioritaires</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                  <span>Système d'authentification PIN</span>
                </div>
              </div>
            </div>

            <div className="ws-card group">
              <div className="bg-success/10 p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                <FileText className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">Rapports Intelligents</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Création de rapports personnalisables avec templates adaptés aux besoins spécifiques 
                des résidences DI-TSA et exports CSV pour analyse externe.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                  <span>Templates dynamiques personnalisés</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                  <span>Export CSV pour analyse</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                  <span>Échelle de Bristol intégrée</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features Section */}
      <section className="relative py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-semibold mb-4 text-foreground">
              Fonctionnalités avancées
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Technologies modernes au service des résidences spécialisées
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Target, title: "Échelle de Bristol", desc: "Suivi spécialisé des selles avec classification médicale standardisée" },
              { icon: Shield, title: "Authentification PIN", desc: "Sécurité renforcée avec codes PIN personnalisés par utilisateur" },
              { icon: Download, title: "Exports CSV", desc: "Exportation complète des données pour analyses externes et rapports" },
              { icon: Sparkles, title: "Intelligence Artificielle", desc: "Correction automatique et génération de résumés dans tous les champs texte" }
            ].map((feature, index) => (
              <div key={index} className="ws-card-compact group">
                <div className="bg-primary/10 p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">{feature.title}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Admin & Management Features Section */}
      <section className="relative py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-semibold text-foreground text-center mb-12">Gestion Administrative</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="ws-card">
              <div className="bg-primary/10 p-4 rounded-xl w-fit mb-6">
                <Database className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Gestion des Utilisateurs</h3>
              <p className="text-muted-foreground mb-4">
                Administration complète des équipes avec gestion des rôles, réinitialisation des PIN et contrôle d'accès.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Création et modification des profils utilisateurs</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Gestion des rôles (Admin, Standard, Viewer)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Réinitialisation sécurisée des codes PIN</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Suivi des activités et connexions</span>
                </li>
              </ul>
            </div>

            <div className="ws-card">
              <div className="bg-accent/10 p-4 rounded-xl w-fit mb-6">
                <BarChart3 className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Tableaux de Bord</h3>
              <p className="text-muted-foreground mb-4">
                Visualisations en temps réel des données avec exports CSV et statistiques détaillées.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start space-x-2">
                  <span className="text-accent mt-1">•</span>
                  <span>Graphiques interactifs avec Recharts</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-accent mt-1">•</span>
                  <span>Exports CSV avec métadonnées complètes</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-accent mt-1">•</span>
                  <span>Statistiques par période et par équipe</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-accent mt-1">•</span>
                  <span>Visualisations temps réel des données</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        </section>
    </div>
  );
}
