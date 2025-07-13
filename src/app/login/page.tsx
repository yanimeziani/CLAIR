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
    <div className="min-h-screen bg-gradient-professional flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" 
             style={{
               backgroundImage: `url('/login-healthcare-pattern.svg')`,
               backgroundSize: '400px 400px',
               backgroundRepeat: 'repeat'
             }}>
          {/* AI Generated Image Prompt: Subtle medical pattern with healthcare icons, crosses, heart symbols, and geometric shapes in a repeating pattern, very light and minimal */}
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={goBack}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à l'accueil
        </Button>

        <Card className="bg-card/80 backdrop-blur-md border-border/50 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-orange-500/10 p-3 rounded-full">
                <Image 
                  src="/logo.png" 
                  alt="Irielle Logo" 
                  width={40} 
                  height={40}
                  className="h-10 w-10"
                />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Connexion Irielle
            </CardTitle>
            <p className="text-muted-foreground text-sm mt-2">
              Plateforme sécurisée pour résidences DI-TSA
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* User Type Selection */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={!isReplacement ? "default" : "outline"}
                onClick={() => setIsReplacement(false)}
                className="flex flex-col items-center p-4 h-auto"
              >
                <Users className="h-6 w-6 mb-2" />
                <span className="text-xs">Personnel</span>
              </Button>
              <Button
                type="button"
                variant={isReplacement ? "default" : "outline"}
                onClick={() => setIsReplacement(true)}
                className="flex flex-col items-center p-4 h-auto"
              >
                <Shield className="h-6 w-6 mb-2" />
                <span className="text-xs">Remplacement</span>
              </Button>
            </div>

            <Separator />

            <form onSubmit={handleLogin} className="space-y-4">
              {!isReplacement ? (
                <>
                  {/* Regular User Login */}
                  <div className="space-y-2">
                    <Label htmlFor="user-select">Sélectionner l'utilisateur</Label>
                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingUsers ? "Chargement..." : "Choisir un utilisateur"} />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user._id} value={user._id}>
                            {user.firstName} {user.lastName} ({user.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pin">PIN à 4 chiffres</Label>
                    <div className="relative">
                      <Input
                        id="pin"
                        type="password"
                        placeholder="••••"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        maxLength={4}
                        className="text-center text-lg tracking-widest"
                      />
                      <KeyRound className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Replacement User Login */}
                  <div className="space-y-2">
                    <Label htmlFor="replacement-name">Nom complet du remplaçant</Label>
                    <Input
                      id="replacement-name"
                      type="text"
                      placeholder="Entrez votre nom complet"
                      value={replacementName}
                      onChange={(e) => setReplacementName(e.target.value)}
                      className="text-center"
                    />
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                    <p className="text-amber-600 text-xs text-center">
                      Mode remplacement : Aucun PIN requis
                    </p>
                  </div>
                </>
              )}

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90" 
                disabled={isLoading || loadingUsers}
              >
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>

            {/* Security Notice */}
            <div className="bg-muted/50 rounded-lg p-3 mt-6">
              <div className="flex items-start space-x-2">
                <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Connexion sécurisée avec authentification locale. 
                    Toutes les données restent sur votre serveur.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="mt-4 bg-card/60 backdrop-blur-sm border-border/30">
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold text-foreground mb-2">Démonstration</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Utilisateur:</strong> Admin Principal</p>
              <p><strong>PIN:</strong> 1234</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}