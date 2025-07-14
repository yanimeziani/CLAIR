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
    <div className="min-h-screen ws-gradient-main flex items-center justify-center p-4 ws-page-pattern">
      <div className="w-full max-w-lg">
        {/* Back Button */}
        <button 
          onClick={goBack}
          className="ws-button-ghost mb-8 !px-4 !py-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à l'accueil
        </button>

        {/* Main Login Card */}
        <div className="ws-card !p-0 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-br from-primary to-accent p-8 text-center">
            <div className="h-16 w-16 mx-auto mb-4">
              <Image 
                src="/logo.svg" 
                alt="Irielle Logo" 
                width={64} 
                height={64}
                className="h-full w-full"
              />
            </div>
            <h1 className="text-3xl font-semibold text-white mb-2">
              Bienvenue sur Irielle
            </h1>
            <p className="text-white/80 text-base">
              Plateforme sécurisée pour résidences DI-TSA
            </p>
          </div>

          {/* Form Section */}
          <div className="p-8 space-y-6">
            {/* User Type Selection */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-foreground">Type de connexion</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsReplacement(false)}
                  className={`flex flex-col items-center p-6 rounded-xl border-2 transition-all duration-200 ${
                    !isReplacement 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-border bg-background text-muted-foreground hover:border-primary/30'
                  }`}
                >
                  <Users className="h-8 w-8 mb-3" />
                  <span className="font-medium">Personnel</span>
                  <span className="text-xs opacity-70">Équipe régulière</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsReplacement(true)}
                  className={`flex flex-col items-center p-6 rounded-xl border-2 transition-all duration-200 ${
                    isReplacement 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-border bg-background text-muted-foreground hover:border-primary/30'
                  }`}
                >
                  <Shield className="h-8 w-8 mb-3" />
                  <span className="font-medium">Remplacement</span>
                  <span className="text-xs opacity-70">Personnel temporaire</span>
                </button>
              </div>
            </div>

            <div className="h-px bg-border"></div>

            <form onSubmit={handleLogin} className="space-y-6">
              {!isReplacement ? (
                <>
                  {/* Regular User Login */}
                  <div className="ws-form-group">
                    <label className="ws-form-label">Sélectionner l'utilisateur</label>
                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                      <SelectTrigger className="ws-input !h-14">
                        <SelectValue placeholder={loadingUsers ? "Chargement..." : "Choisir un utilisateur"} />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user._id} value={user._id}>
                            <div className="flex flex-col items-start">
                              <span className="font-medium">{user.firstName} {user.lastName}</span>
                              <span className="text-xs text-muted-foreground">{user.role}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="ws-form-group">
                    <label className="ws-form-label">PIN à 4 chiffres</label>
                    <div className="relative">
                      <input
                        id="pin"
                        type="password"
                        placeholder="••••"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        maxLength={4}
                        className="ws-input text-center text-xl tracking-[0.5em] !h-14"
                      />
                      <KeyRound className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="ws-form-description">Entrez votre code PIN personnel</p>
                  </div>
                </>
              ) : (
                <>
                  {/* Replacement User Login */}
                  <div className="ws-form-group">
                    <label className="ws-form-label">Nom complet du remplaçant</label>
                    <input
                      id="replacement-name"
                      type="text"
                      placeholder="Entrez votre nom complet"
                      value={replacementName}
                      onChange={(e) => setReplacementName(e.target.value)}
                      className="ws-input !h-14"
                    />
                    <p className="ws-form-description">Votre nom sera enregistré pour cette session</p>
                  </div>
                  <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-warning flex-shrink-0" />
                      <div>
                        <p className="font-medium text-warning">Mode remplacement</p>
                        <p className="text-xs text-warning/80">Aucun PIN requis pour cette connexion</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit" 
                className="ws-button-primary w-full !h-14 text-lg font-medium"
                disabled={isLoading || loadingUsers}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                    <span>Connexion...</span>
                  </div>
                ) : (
                  'Se connecter'
                )}
              </button>
            </form>

            {/* Security Notice */}
            <div className="bg-success/5 border border-success/20 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-success text-sm">Sécurité garantie</p>
                  <p className="text-xs text-success/70 mt-1">
                    Authentification locale sécurisée. Toutes vos données restent privées sur votre serveur.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="ws-card-compact mt-6 bg-muted/20 border-muted">
          <div className="flex items-start space-x-3">
            <div className="bg-accent/10 p-2 rounded-lg">
              <Heart className="h-4 w-4 text-accent" />
            </div>
            <div>
              <h4 className="font-medium text-foreground text-sm mb-1">Mode Démonstration</h4>
              <div className="text-xs text-muted-foreground space-y-1">
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