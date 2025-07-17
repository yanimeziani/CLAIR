'use client';

import { useState, useEffect } from 'react';
import { 
  Wrench, Clock, RefreshCw, CheckCircle, Heart, 
  Shield, Activity, Sparkles, ArrowRight
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function MaintenancePage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Simulate deployment progress
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 0; // Reset progress
        return prev + Math.random() * 5;
      });
    }, 2000);

    return () => {
      clearInterval(timer);
      clearInterval(progressTimer);
    };
  }, []);

  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-40 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Icons */}
      <div className="absolute top-32 left-10 animate-float hidden lg:block">
        <div className="w-16 h-16 bg-white/80 backdrop-blur-xl rounded-xl shadow-lg flex items-center justify-center">
          <Wrench className="h-8 w-8 text-blue-500" />
        </div>
      </div>
      <div className="absolute top-48 right-10 animate-float animation-delay-1000 hidden lg:block">
        <div className="w-16 h-16 bg-white/80 backdrop-blur-xl rounded-xl shadow-lg flex items-center justify-center">
          <Activity className="h-8 w-8 text-purple-500" />
        </div>
      </div>
      <div className="absolute bottom-40 left-20 animate-float animation-delay-2000 hidden lg:block">
        <div className="w-16 h-16 bg-white/80 backdrop-blur-xl rounded-xl shadow-lg flex items-center justify-center">
          <Shield className="h-8 w-8 text-indigo-500" />
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  CLAIR
                </h1>
                <p className="text-sm text-gray-600">Centre Logiciel d'Aide aux Interventions</p>
              </div>
            </div>
          </div>

          {/* Maintenance Icon */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full shadow-2xl shadow-orange-500/25 mb-6">
              <Wrench className="h-12 w-12 sm:h-16 sm:w-16 text-white animate-pulse" />
            </div>
          </div>

          {/* Main Content */}
          <div className="mb-12">
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-6 text-gray-800">
              Maintenance en cours
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Nous améliorons actuellement CLAIR pour vous offrir une meilleure expérience. 
              La plateforme sera bientôt de retour en ligne.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-12">
            <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-xl max-w-md mx-auto">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-700">Déploiement en cours</span>
                  <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-1000 ease-out relative"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  >
                    <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                  </div>
                </div>
                <div className="flex items-center justify-center mt-4 text-xs text-gray-500">
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  <span>Mise à jour automatique via GitHub Actions</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Base de données</h3>
                <p className="text-sm text-green-600 font-medium">✓ Opérationnelle</p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <RefreshCw className="h-6 w-6 text-white animate-spin" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Application</h3>
                <p className="text-sm text-orange-600 font-medium">⚡ Mise à jour</p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Sécurité</h3>
                <p className="text-sm text-blue-600 font-medium">🔒 Sécurisée</p>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              onClick={refreshPage}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Actualiser la page
            </Button>
            
            <Button 
              variant="outline"
              className="bg-white/80 backdrop-blur-xl border border-gray-200 text-gray-700 px-6 py-3 rounded-xl text-lg font-semibold hover:bg-white/90 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <Clock className="h-5 w-5 mr-2" />
              Statut en temps réel
            </Button>
          </div>

          {/* Footer Info */}
          <div className="text-center">
            <div className="inline-flex items-center space-x-3 bg-white/60 backdrop-blur-xl border border-gray-200/50 rounded-full px-6 py-3 shadow-lg mb-6">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium text-gray-700">
                Durée estimée: 2-5 minutes
              </span>
            </div>
            
            <p className="text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Nos équipes travaillent pour déployer les dernières améliorations de CLAIR. 
              Vos données sont en sécurité et aucune information ne sera perdue. 
              Merci de votre patience.
            </p>
            
            <div className="mt-6 text-xs text-gray-400">
              <p>Dernière mise à jour: {currentTime.toLocaleString('fr-CA')}</p>
              <p className="mt-1">ID de déploiement: {Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}