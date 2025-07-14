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

      {/* Hero Section - Clean and Minimal */}
      <section className="wealth-hero wealth-section-lg">
        <div className="wealth-container text-center">
          {/* Subtle badge */}
          <div className="mb-8">
            <div className="wealth-badge inline-flex items-center space-x-2">
              <Heart className="h-3 w-3 text-blue-600" />
              <span>Québec • Projet pilote DI-TSA</span>
              <span>⚜️</span>
            </div>
          </div>
          
          <h1 className="heading-xl mb-8 max-w-5xl mx-auto">
            Mieux que votre
            <br />
            système actuel
          </h1>
          
          <p className="body-text-lg mb-12 max-w-2xl mx-auto">
            Obtenez une gestion de résidence sans frais mensuels, des rapports intelligents, 
            et des outils d'IA pour construire un système de soins plus efficace.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
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
                  <span>Accéder à CLAIR</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
            <button className="wealth-button-secondary">
              <Calendar className="h-4 w-4" />
              <span>Formation et support</span>
            </button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Conformité gouvernementale</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <span>Sécurité certifiée</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4 text-red-600" />
              <span>Projet pilote Québec</span>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
