'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Send
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function PatientQueryPage() {
  const [inputValue, setInputValue] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedPatient) return;
    setIsLoading(true);
    
    // Simulate processing
    setTimeout(() => {
      setIsLoading(false);
      setInputValue('');
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-calm">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <div className="h-6 w-6">
                <Image 
                  src="/logo.svg" 
                  alt="Logo Irielle" 
                  width={24} 
                  height={24}
                  className="h-full w-full"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Irielle IA</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Assistant intelligent</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6">
        <div className="w-full max-w-2xl mx-auto text-center">
          
          {/* Title */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Bonjour, je suis Irielle IA
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Comment puis-je vous aider aujourd'hui ?
            </p>
          </div>

          {/* Patient Selection */}
          <div className="mb-8">
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger className="w-full max-w-md mx-auto h-12 text-base">
                <SelectValue placeholder="Sélectionner un patient..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="patient-001">Marie Lavoie</SelectItem>
                <SelectItem value="patient-002">Pierre Gagnon</SelectItem>
                <SelectItem value="patient-003">Julie Bouchard</SelectItem>
                <SelectItem value="patient-004">André Martin</SelectItem>
                <SelectItem value="patient-005">Sophie Tremblay</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Input with Orb Inside */}
          <div className="relative max-w-lg mx-auto">
            <div className="relative">
              {/* Animated Orb inside input */}
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                <div className="relative w-8 h-8">
                  {/* Main Orb */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-400 via-blue-500 to-blue-600 opacity-90 animate-pulse shadow-lg shadow-blue-500/30"></div>
                  
                  {/* Shine Effect */}
                  <div className="absolute top-1 left-1.5 w-2 h-1.5 bg-gradient-to-br from-white/60 to-white/20 rounded-full blur-[1px]"></div>
                  
                  {/* Floating Particles */}
                  <div className="absolute top-1 right-1.5 w-0.5 h-0.5 bg-white/80 rounded-full animate-bounce"></div>
                  <div className="absolute bottom-1.5 left-1 w-0.5 h-0.5 bg-white/60 rounded-full animate-bounce delay-300"></div>
                  
                  {/* Outer Glow Ring */}
                  {isLoading && (
                    <div className="absolute -inset-1 rounded-full border border-blue-400/30 animate-spin" style={{animationDuration: '3s'}}></div>
                  )}
                </div>
              </div>
              
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={selectedPatient ? "Posez votre question..." : "Sélectionnez d'abord un patient"}
                className="h-14 pl-14 pr-4 text-base rounded-full border-2 border-muted focus:border-primary transition-colors"
                disabled={!selectedPatient || isLoading}
              />
            </div>
          </div>

          {/* Status Text */}
          {isLoading && (
            <p className="text-sm text-muted-foreground mt-6 animate-pulse">
              Irielle IA traite votre demande...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}