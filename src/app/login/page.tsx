'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, KeyRound, Users, Shield, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
}

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [replacementName, setReplacementName] = useState('');
  const [isReplacement, setIsReplacement] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isReplacement && !replacementName.trim()) {
      toast.error('Veuillez entrer votre nom complet');
      return;
    }
    
    if (!isReplacement && (!selectedUser || !pin)) {
      toast.error('Veuillez sélectionner un utilisateur et entrer votre PIN');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: isReplacement ? undefined : selectedUser,
          pin: isReplacement ? undefined : pin,
          replacementName: isReplacement ? replacementName : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Connexion réussie');
        router.push('/dashboard');
      } else {
        toast.error(data.error || 'Échec de la connexion');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative flex items-center justify-center p-4 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-40 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="w-full max-w-lg relative z-10">
        {/* Back Button */}
        <button 
          onClick={goBack}
          className="mb-8 bg-white/80 backdrop-blur-xl border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/90 transition-all duration-300 hover:scale-105 shadow-lg flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à l'accueil
        </button>

        {/* Main Login Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-blue-500/20 border border-white/50 overflow-hidden max-w-sm mx-auto">
          {/* Header Section */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-6 py-8 text-center">
            <div className="h-16 w-16 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-white mb-1">
              Bienvenue sur CLAIR
            </h1>
            <p className="text-white/90 text-xs">
              Centre Logiciel d'Aide aux Interventions Résidentielles
            </p>
          </div>

          {/* Form Section */}
          <div className="p-6 space-y-4">
            {/* Step 1: User Type Selection */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-in fade-in-0 slide-in-from-right-2 duration-300">
                <h3 className="text-gray-700 font-medium text-sm">Type de connexion</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsReplacement(false);
                      setCurrentStep(2);
                    }}
                    className="flex flex-col items-center p-3 rounded-lg border-2 border-gray-200 bg-gray-50 text-gray-500 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
                  >
                    <Users className="h-5 w-5 mb-1" />
                    <span className="font-medium text-xs">Personnel</span>
                    <span className="text-xs opacity-70">Équipe régulière</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsReplacement(true);
                      setCurrentStep(3);
                    }}
                    className="flex flex-col items-center p-3 rounded-lg border-2 border-gray-200 bg-gray-50 text-gray-500 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
                  >
                    <Shield className="h-5 w-5 mb-1" />
                    <span className="font-medium text-xs">Remplacement</span>
                    <span className="text-xs opacity-70">Personnel temporaire</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Regular User Selection */}
            {currentStep === 2 && !isReplacement && (
              <div className="space-y-4 animate-in fade-in-0 slide-in-from-right-2 duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-700 font-medium text-sm">Sélectionner l'utilisateur</h3>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-gray-400 hover:text-gray-600 text-xs"
                  >
                    Retour
                  </button>
                </div>
                <Select 
                  value={selectedUser} 
                  onValueChange={(value) => {
                    setSelectedUser(value);
                    setCurrentStep(4);
                  }}
                >
                  <SelectTrigger className="w-full h-10 border-gray-200 rounded-lg bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 shadow-sm">
                    <SelectValue placeholder={loadingUsers ? "Chargement..." : "Choisir un utilisateur"} />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user._id} value={user._id}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium text-sm">{user.firstName} {user.lastName}</span>
                          <span className="text-xs text-gray-500">{user.role}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Step 3: Replacement Name */}
            {currentStep === 3 && isReplacement && (
              <div className="space-y-4 animate-in fade-in-0 slide-in-from-right-2 duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-700 font-medium text-sm">Nom complet</h3>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-gray-400 hover:text-gray-600 text-xs"
                  >
                    Retour
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Entrez votre nom complet"
                  value={replacementName}
                  onChange={(e) => setReplacementName(e.target.value)}
                  className="w-full h-10 border-gray-200 rounded-lg bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 px-3 text-sm shadow-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && replacementName.trim()) {
                      setCurrentStep(5);
                    }
                  }}
                />
                {replacementName.trim() && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(5)}
                    className="w-full h-10 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 text-sm shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    Continuer
                  </button>
                )}
              </div>
            )}

            {/* Step 4: PIN Entry */}
            {currentStep === 4 && !isReplacement && (
              <div className="space-y-4 animate-in fade-in-0 slide-in-from-right-2 duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-700 font-medium text-sm">Code PIN</h3>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-gray-400 hover:text-gray-600 text-xs"
                  >
                    Retour
                  </button>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="relative">
                    <input
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Entrez votre PIN"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      maxLength={4}
                      className="w-full h-10 border-gray-200 rounded-lg bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 px-3 text-sm shadow-sm text-center text-lg font-mono tracking-widest"
                      autoFocus
                    />
                    <KeyRound className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  <button
                    type="submit"
                    className="w-full h-10 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 text-sm shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100"
                    disabled={isLoading || pin.length !== 4}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-white/30 border-t-white"></div>
                        <span>Connexion...</span>
                      </div>
                    ) : (
                      'Se connecter'
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Step 5: Replacement Login */}
            {currentStep === 5 && isReplacement && (
              <div className="space-y-4 animate-in fade-in-0 slide-in-from-right-2 duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-700 font-medium text-sm">Connexion</h3>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="text-gray-400 hover:text-gray-600 text-xs"
                  >
                    Retour
                  </button>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-orange-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-orange-700 text-xs">Mode remplacement</p>
                      <p className="text-xs text-orange-600">Connexion sans PIN</p>
                    </div>
                  </div>
                </div>
                <form onSubmit={handleLogin}>
                  <button
                    type="submit"
                    className="w-full h-10 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 text-sm shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-white/30 border-t-white"></div>
                        <span>Connexion...</span>
                      </div>
                    ) : (
                      'Se connecter'
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Security Notice - Always visible */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
              <div className="flex items-start space-x-2">
                <Shield className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-700 text-xs">Sécurité garantie</p>
                  <p className="text-xs text-green-600">
                    Authentification locale sécurisée
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 bg-white/95 backdrop-blur-xl rounded-xl p-4 border border-white/50 shadow-xl shadow-blue-500/10">
          <div className="flex items-start space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg shadow-lg">
              <Heart className="h-4 w-4 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 text-sm mb-1">Mode Démonstration</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>Utilisateur:</strong> Admin Principal</p>
                <p><strong>PIN:</strong> 1234</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}