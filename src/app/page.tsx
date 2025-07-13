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
    <div className="min-h-screen bg-gradient-healthcare">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-r from-primary/10 to-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-r from-secondary/10 to-secondary/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-gradient-to-r from-accent/5 to-accent/2 rounded-full blur-2xl"></div>
      </div>
      
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/20 backdrop-blur-sm bg-card/30">
          <div className="container mx-auto px-4 sm:px-6 py-4">
            <nav className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Image 
                    src="/logo.png" 
                    alt="Irielle Logo" 
                    width={32} 
                    height={32}
                    className="h-8 w-8"
                  />
                </div>
                <span className="text-xl sm:text-2xl font-bold text-foreground">
                  Irielle
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
                <div className="hidden lg:flex items-center space-x-6">
                  <Button variant="ghost" className="text-muted-foreground hover:text-foreground font-medium">
                    Fonctionnalités
                  </Button>
                  <Button variant="ghost" className="text-muted-foreground hover:text-foreground font-medium">
                    Avantages
                  </Button>
                  <Button variant="ghost" className="text-muted-foreground hover:text-foreground font-medium">
                    Contact
                  </Button>
                </div>
                <Button 
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
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

        {/* Hero Section */}
        <section className="relative py-12 sm:py-20 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            {/* Badge */}
            <div className="mb-6 sm:mb-8">
              <div className="inline-flex items-center space-x-2 sm:space-x-3 bg-primary/10 border border-primary/20 rounded-full px-4 sm:px-6 py-2 sm:py-3 backdrop-blur-sm">
                <div className="bg-primary/20 p-1 rounded-full">
                  <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-primary">Plateforme spécialisée DI-TSA</span>
                <Star className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500 fill-current" />
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 leading-tight text-foreground">
              Gestion spécialisée pour
              <br />
              <span className="text-primary">
                résidences DI-TSA
              </span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed">
              Irielle transforme la gestion des résidences pour personnes ayant une déficience intellectuelle 
              et troubles du spectre de l'autisme au Québec avec des outils adaptés et sécurisés.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-12 sm:mb-16">
              <Button 
                size="lg" 
                onClick={handleLogin}
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-lg group"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Chargement...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Découvrir la plateforme</span>
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 text-foreground hover:bg-accent px-6 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-semibold"
              >
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Demander une démonstration</span>
                  <span className="sm:hidden">Démonstration</span>
                </div>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                <span>Conforme HIPAA</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                <span>Sécurité renforcée</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
                <span>Spécialisé DI-TSA</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-12 sm:py-20 bg-card/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-foreground">
                Fonctionnalités principales
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                Des outils spécialement conçus pour les défis uniques des résidences DI-TSA
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <Card className="group bg-card/50 backdrop-blur-sm border hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <CardContent className="p-6 sm:p-8">
                  <div className="bg-primary/20 p-3 sm:p-4 rounded-xl w-fit mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">Gestion des Résidents</h3>
                  <p className="text-muted-foreground mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                    Profils complets avec informations personnelles, médicales, allergies et contacts d'urgence. 
                    Observations signées électroniquement pour un suivi professionnel.
                  </p>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                      <span>Profils médicaux avec éditeur riche</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                      <span>Observations signées numériquement</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                      <span>IA - Correction et résumés automatiques</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group bg-card/50 backdrop-blur-sm border hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <CardContent className="p-6 sm:p-8">
                  <div className="bg-secondary/20 p-3 sm:p-4 rounded-xl w-fit mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                    <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-secondary" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">Communications d'Équipe</h3>
                  <p className="text-muted-foreground mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                    Communications sécurisées avec éditeur enrichi par IA, système d'alertes urgentes 
                    et suivi des accusés de réception en temps réel.
                  </p>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                      <span>Éditeur avec assistance IA</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                      <span>Messages urgents prioritaires</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                      <span>Système d'authentification PIN</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group bg-card/50 backdrop-blur-sm border hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <CardContent className="p-6 sm:p-8">
                  <div className="bg-accent/20 p-3 sm:p-4 rounded-xl w-fit mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                    <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-accent-foreground" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">Rapports Intelligents</h3>
                  <p className="text-muted-foreground mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                    Création de rapports personnalisables avec templates adaptés aux besoins spécifiques 
                    des résidences DI-TSA et exports CSV pour analyse externe.
                  </p>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                      <span>Templates dynamiques personnalisés</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                      <span>Export CSV pour analyse</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                      <span>Échelle de Bristol intégrée</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Additional Features Section */}
        <section className="relative py-12 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Fonctionnalités avancées
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Technologies modernes au service des résidences spécialisées
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                { icon: Target, title: "Échelle de Bristol", desc: "Suivi spécialisé des selles avec classification médicale standardisée" },
                { icon: Shield, title: "Authentification PIN", desc: "Sécurité renforcée avec codes PIN personnalisés par utilisateur" },
                { icon: Download, title: "Exports CSV", desc: "Exportation complète des données pour analyses externes et rapports" },
                { icon: Sparkles, title: "Intelligence Artificielle", desc: "Correction automatique et génération de résumés dans tous les champs texte" }
              ].map((feature, index) => (
                <Card key={index} className="bg-card/40 backdrop-blur-sm border hover:bg-card/60 transition-all duration-300 group">
                  <CardContent className="p-4 sm:p-6">
                    <div className="bg-primary/20 p-2 sm:p-3 rounded-xl w-fit mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <h4 className="font-bold text-foreground mb-2 text-sm sm:text-base">{feature.title}</h4>
                    <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Admin & Management Features Section */}
        <section className="relative py-12 sm:py-20 bg-card/30">
          <div className="container mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-8 sm:mb-12">Gestion Administrative</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <Card className="bg-card/50 backdrop-blur-sm border hover:bg-card/80 transition-all duration-300">
                <CardContent className="p-6 sm:p-8">
                  <div className="bg-primary/20 p-3 sm:p-4 rounded-lg w-fit mb-4 sm:mb-6">
                    <Database className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3">Gestion des Utilisateurs</h3>
                  <p className="text-muted-foreground text-sm sm:text-base mb-4">
                    Administration complète des équipes avec gestion des rôles, réinitialisation des PIN et contrôle d'accès.
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
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
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border hover:bg-card/80 transition-all duration-300">
                <CardContent className="p-6 sm:p-8">
                  <div className="bg-secondary/20 p-3 sm:p-4 rounded-lg w-fit mb-4 sm:mb-6">
                    <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-secondary" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3">Tableaux de Bord</h3>
                  <p className="text-muted-foreground text-sm sm:text-base mb-4">
                    Visualisations en temps réel des données avec exports CSV et statistiques détaillées.
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                    <li className="flex items-start space-x-2">
                      <span className="text-secondary mt-1">•</span>
                      <span>Graphiques interactifs avec Recharts</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-secondary mt-1">•</span>
                      <span>Exports CSV avec métadonnées complètes</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-secondary mt-1">•</span>
                      <span>Statistiques par période et par équipe</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-secondary mt-1">•</span>
                      <span>Visualisations temps réel des données</span>
                    </li>
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
