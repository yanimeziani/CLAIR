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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-indigo-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-violet-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Hero Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
        <div className="w-full h-full" 
             style={{
               backgroundImage: `url('/hero-healthcare-abstract.jpg')`,
               backgroundSize: 'cover',
               backgroundPosition: 'center',
               backgroundRepeat: 'no-repeat'
             }}>
        </div>
      </div>
      
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/20 backdrop-blur-xl bg-white/10 dark:bg-black/10">
          <div className="container mx-auto px-6 py-4">
            <nav className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Image 
                  src="/logo.png" 
                  alt="Irielle Logo" 
                  width={32} 
                  height={32}
                  className="h-8 w-8"
                />
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Irielle
                </span>
              </div>
              
              <div className="hidden md:flex items-center space-x-8">
                <Button variant="ghost" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-medium">
                  Fonctionnalités
                </Button>
                <Button variant="ghost" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-medium">
                  Avantages
                </Button>
                <Button variant="ghost" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-medium">
                  Contact
                </Button>
                <Button 
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 border-0"
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
                </Button>
              </div>
            </nav>
          </div>
        </header>

        {/* Hero Section - Full Screen */}
        <section className="scroll-snap-hero relative">
          <div className="container mx-auto px-6 text-center">
            {/* Compact Logo & Badge */}
            <div className="mb-8">
              <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-700/50 rounded-full px-6 py-3 backdrop-blur-sm">
                <Image 
                  src="/logo.png" 
                  alt="Irielle Logo" 
                  width={24} 
                  height={24}
                  className="h-6 w-6"
                />
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Plateforme spécialisée DI-TSA</span>
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                Gestion spécialisée pour
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                résidences DI-TSA
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-12 max-w-5xl mx-auto leading-relaxed">
              Irielle transforme la gestion des résidences pour personnes ayant une déficience intellectuelle 
              et troubles du spectre de l'autisme au Québec avec des outils adaptés et sécurisés.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Button 
                size="lg" 
                onClick={handleLogin}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-4 text-lg font-semibold shadow-2xl shadow-blue-500/25 border-0 group"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Chargement...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Découvrir la plateforme</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 px-10 py-4 text-lg font-semibold backdrop-blur-sm"
              >
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Demander une démonstration</span>
                </div>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center items-center space-x-8 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Conforme HIPAA</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <span>Sécurité renforcée</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-yellow-500" />
                <span>Spécialisé DI-TSA</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="scroll-snap-feature relative">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 scroll-fade-in">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                  Fonctionnalités principales
                </span>
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                Des outils spécialement conçus pour les défis uniques des résidences DI-TSA
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 scroll-fade-in">
              <Card className="group bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-500 shadow-xl shadow-blue-500/5 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Gestion des Résidents</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                    Profils complets avec informations personnelles, médicales, allergies et contacts d'urgence. 
                    Observations signées électroniquement pour un suivi professionnel.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Profils médicaux avec éditeur riche</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Observations signées numériquement</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>IA - Correction et résumés automatiques</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-500 shadow-xl shadow-green-500/5 hover:shadow-2xl hover:shadow-green-500/10 hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                    <MessageSquare className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Communications d'Équipe</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                    Communications sécurisées avec éditeur enrichi par IA, système d'alertes urgentes 
                    et suivi des accusés de réception en temps réel.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Éditeur avec assistance IA</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Messages urgents prioritaires</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Système d'authentification PIN</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-500 shadow-xl shadow-purple-500/5 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                    <FileText className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Rapports Intelligents</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                    Création de rapports personnalisables avec templates adaptés aux besoins spécifiques 
                    des résidences DI-TSA et exports CSV pour analyse externe.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Templates dynamiques personnalisés</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Export CSV pour analyse</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Échelle de Bristol intégrée</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Additional Features Section */}
        <section className="scroll-snap-feature relative">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12 scroll-fade-in">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                  Fonctionnalités avancées
                </span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Technologies modernes au service des résidences spécialisées
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 scroll-fade-in">
              {[
                { icon: Target, title: "Échelle de Bristol", desc: "Suivi spécialisé des selles avec classification médicale standardisée" },
                { icon: Shield, title: "Authentification PIN", desc: "Sécurité renforcée avec codes PIN personnalisés par utilisateur" },
                { icon: Download, title: "Exports CSV", desc: "Exportation complète des données pour analyses externes et rapports" },
                { icon: Sparkles, title: "Intelligence Artificielle", desc: "Correction automatique et génération de résumés dans tous les champs texte" }
              ].map((feature, index) => (
                <Card key={index} className="bg-white/40 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Admin & Management Features Section */}
        <section className="scroll-snap-section relative">
          <div className="container mx-auto px-6 py-20">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12 scroll-fade-in">Gestion Administrative</h2>
            <div className="grid md:grid-cols-2 gap-8 scroll-fade-in">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="bg-indigo-500/20 p-4 rounded-lg w-fit mb-6">
                    <Database className="h-8 w-8 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Gestion des Utilisateurs</h3>
                  <p className="text-muted-foreground">
                    Administration complète des équipes avec gestion des rôles, réinitialisation des PIN et contrôle d'accès.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <li>• Création et modification des profils utilisateurs</li>
                    <li>• Gestion des rôles (Admin, Standard, Viewer)</li>
                    <li>• Réinitialisation sécurisée des codes PIN</li>
                    <li>• Suivi des activités et connexions</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="bg-amber-500/20 p-4 rounded-lg w-fit mb-6">
                    <BarChart3 className="h-8 w-8 text-amber-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Tableaux de Bord</h3>
                  <p className="text-muted-foreground">
                    Visualisations en temps réel des données avec exports CSV et statistiques détaillées.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <li>• Graphiques interactifs avec Recharts</li>
                    <li>• Exports CSV avec métadonnées complètes</li>
                    <li>• Statistiques par période et par équipe</li>
                    <li>• Visualisations temps réel des données</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
