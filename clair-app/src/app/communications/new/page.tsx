'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MessageSquare, ArrowLeft, Send, X, User, AlertTriangle, Users, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { 
  Stepper, 
  StepperItem, 
  StepperContent, 
  StepperHeader, 
  StepperTitle, 
  StepperDescription, 
  StepperNavigation 
} from '@/components/ui/stepper';
import { toast } from 'sonner';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
}

const STEPS = [
  {
    id: 1,
    title: "Destinataires",
    description: "Sélectionner qui recevra le message"
  },
  {
    id: 2,
    title: "Contexte",
    description: "Usager et dates de pertinence"
  },
  {
    id: 3,
    title: "Contenu",
    description: "Rédiger le message"
  },
  {
    id: 4,
    title: "Révision",
    description: "Vérifier et envoyer"
  }
];

export default function NewCommunicationPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);

  // Form state
  const [formData, setFormData] = useState({
    recipientIds: [] as string[],
    patientId: '',
    destinationDates: [new Date().toISOString().split('T')[0]],
    content: '',
    isUrgent: false,
    sendToAll: false
  });

  // Remove PIN authentication state - no longer needed since user is already authenticated

  const router = useRouter();

  useEffect(() => {
    const initPage = async () => {
      await checkSession();
      await fetchData();
    };
    initPage();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      
      if (!data.authenticated) {
        router.push('/login');
        return;
      }
      
      setCurrentUser(data.user);
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchData = async () => {
    try {
      // Fetch users
      try {
        const usersRes = await fetch('/api/users');
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData.users || []);
        } else {
          throw new Error('API not available');
        }
      } catch {
        // Fallback mock data for development
        setUsers([
          { _id: '1', firstName: 'Marie', lastName: 'Dubois', role: 'Médecin' },
          { _id: '2', firstName: 'Sophie', lastName: 'Martin', role: 'Infirmière' },
          { _id: '3', firstName: 'Jean', lastName: 'Tremblay', role: 'Aide-soignant' },
          { _id: '4', firstName: 'Lisa', lastName: 'Rousseau', role: 'Coordinatrice' }
        ]);
      }

      // Fetch patients
      try {
        const patientsRes = await fetch('/api/patients');
        if (patientsRes.ok) {
          const patientsData = await patientsRes.json();
          setPatients(patientsData.patients || []);
        } else {
          throw new Error('API not available');
        }
      } catch {
        // Fallback mock data for development
        setPatients([
          { _id: '1', firstName: 'Marie', lastName: 'Lavoie' },
          { _id: '2', firstName: 'Pierre', lastName: 'Gagnon' },
          { _id: '3', firstName: 'Julie', lastName: 'Bouchard' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.sendToAll && formData.recipientIds.length === 0) {
          toast.error('Veuillez sélectionner au moins un destinataire');
          return false;
        }
        return true;
      case 2:
        return true; // Optional fields
      case 3:
        if (!formData.content.trim() || formData.content.replace(/<[^>]*>/g, '').trim() === '') {
          toast.error('Veuillez saisir le contenu du message');
          return false;
        }
        return true;
      case 4:
        return true;
      default:
        return true;
    }
  };

  const handleRecipientToggle = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      recipientIds: prev.recipientIds.includes(userId)
        ? prev.recipientIds.filter(id => id !== userId)
        : [...prev.recipientIds, userId]
    }));
  };

  const handleSendToAllChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      sendToAll: checked,
      recipientIds: checked ? [] : prev.recipientIds
    }));
  };

  const handleSubmit = async () => {
    if (validateCurrentStep()) {
      setSending(true);
      await sendMessage();
    }
  };

  const sendMessage = async () => {
    try {
      // Filter out current user from recipients to prevent self-messaging
      const availableUsers = users.filter(u => u._id !== currentUser?.userId);
      
      const payload = {
        content: formData.content,
        recipientIds: formData.sendToAll ? availableUsers.map(u => u._id) : formData.recipientIds,
        isUrgent: formData.isUrgent,
        destinationDates: formData.destinationDates,
        patientId: formData.patientId === "none" ? null : formData.patientId || null,
        authorDisplayName: currentUser?.name || `${currentUser?.firstName} ${currentUser?.lastName}`
      };

      const response = await fetch('/api/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Message envoyé avec succès');
        router.push('/communications');
      } else {
        toast.error(data.error || 'Erreur lors de l\'envoi du message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepperContent>
            <StepperHeader>
              <StepperTitle>Qui recevra ce message ?</StepperTitle>
              <StepperDescription>
                Sélectionnez les destinataires de votre communication
              </StepperDescription>
            </StepperHeader>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <Label className="text-base font-medium">Envoyer à toute l'équipe</Label>
                  <p className="text-sm text-muted-foreground">
                    Le message sera envoyé à tous les membres actifs ({users.filter(u => u._id !== currentUser?.userId).length} personnes)
                  </p>
                </div>
                <Switch
                  checked={formData.sendToAll}
                  onCheckedChange={handleSendToAllChange}
                />
              </div>

              {!formData.sendToAll && (
                <Card className="p-4 border-2 border-dashed border-primary/30">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-primary" />
                      <Label className="text-base font-medium">Sélectionner individuellement</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Choisissez les membres de l'équipe qui recevront ce message
                    </p>
                    
                    {users.length === 0 ? (
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <p className="text-sm">Chargement des utilisateurs...</p>
                      </div>
                    ) : (
                      <div className="grid gap-3 max-h-60 sm:max-h-80 overflow-y-auto pr-2">
                        {users.filter(user => user._id !== currentUser?.userId).map(user => (
                          <div
                            key={user._id}
                            className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                              formData.recipientIds.includes(user._id)
                                ? 'border-primary bg-primary/10 shadow-sm'
                                : 'border-border hover:bg-muted/50 hover:border-primary/30'
                            }`}
                            onClick={() => handleRecipientToggle(user._id)}
                          >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                              formData.recipientIds.includes(user._id)
                                ? 'border-primary bg-primary'
                                : 'border-muted-foreground hover:border-primary'
                            }`}>
                              {formData.recipientIds.includes(user._id) && (
                                <div className="w-2.5 h-2.5 bg-primary-foreground rounded-full" />
                              )}
                            </div>
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div className="flex-1">
                              <p className="font-medium">{user.firstName} {user.lastName}</p>
                              <p className="text-sm text-muted-foreground">{user.role}</p>
                            </div>
                            {formData.recipientIds.includes(user._id) && (
                              <div className="text-primary text-sm font-medium">✓ Sélectionné</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {formData.recipientIds.length > 0 && (
                      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-sm text-blue-600">
                          <Users className="h-4 w-4 inline mr-2" />
                          {formData.recipientIds.length} personne(s) sélectionnée(s)
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {formData.sendToAll && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm text-blue-600">
                    <Users className="h-4 w-4 inline mr-2" />
                    Ce message sera envoyé à tous les membres actifs de l'équipe ({users.filter(u => u._id !== currentUser?.userId).length} personnes).
                  </p>
                </div>
              )}
            </div>
          </StepperContent>
        );

      case 2:
        return (
          <StepperContent>
            <StepperHeader>
              <StepperTitle>Contexte du message</StepperTitle>
              <StepperDescription>
                Précisez l'usager concerné et les dates de pertinence (optionnel)
              </StepperDescription>
            </StepperHeader>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Usager concerné (optionnel)</Label>
                <Select value={formData.patientId} onValueChange={(value) => setFormData({ ...formData, patientId: value })}>
                  <SelectTrigger>
                    <User className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sélectionner un usager" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun usager spécifique</SelectItem>
                    {patients.map(patient => (
                      <SelectItem key={patient._id} value={patient._id}>
                        {patient.firstName} {patient.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date de pertinence</Label>
                <Input
                  type="date"
                  value={formData.destinationDates[0]}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    destinationDates: [e.target.value] 
                  })}
                  className="w-fit"
                />
                <p className="text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Cette date indique quand le message est le plus pertinent
                </p>
              </div>
            </div>
          </StepperContent>
        );

      case 3:
        return (
          <StepperContent>
            <StepperHeader>
              <StepperTitle>Contenu du message</StepperTitle>
              <StepperDescription>
                Rédigez votre communication de manière claire et professionnelle
              </StepperDescription>
            </StepperHeader>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Message *</Label>
                <RichTextEditor
                  content={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  placeholder="Tapez votre message ici..."
                  className="min-h-[200px]"
                />
                <p className="text-sm text-muted-foreground">
                  {formData.content.replace(/<[^>]*>/g, '').length} caractères
                </p>
              </div>

              <div className="flex items-center space-x-3 p-4 border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <div className="flex-1">
                  <Label className="text-base font-medium">Marquer comme urgent</Label>
                  <p className="text-sm text-muted-foreground">
                    Les messages urgents apparaîtront en priorité dans le centre de communications
                  </p>
                </div>
                <Switch
                  checked={formData.isUrgent}
                  onCheckedChange={(checked) => setFormData({ ...formData, isUrgent: checked })}
                />
              </div>
            </div>
          </StepperContent>
        );

      case 4:
        return (
          <StepperContent>
            <StepperHeader>
              <StepperTitle>Révision du message</StepperTitle>
              <StepperDescription>
                Vérifiez les informations avant l'envoi
              </StepperDescription>
            </StepperHeader>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Résumé</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Destinataires</Label>
                    <p className="text-sm">
                      {formData.sendToAll 
                        ? `Toute l'équipe (${users.filter(u => u._id !== currentUser?.userId).length} personnes)`
                        : `${formData.recipientIds.length} personne(s) sélectionnée(s)`
                      }
                    </p>
                  </div>

                  {formData.patientId && formData.patientId !== 'none' && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Usager concerné</Label>
                      <p className="text-sm">
                        {patients.find(p => p._id === formData.patientId)?.firstName} {' '}
                        {patients.find(p => p._id === formData.patientId)?.lastName}
                      </p>
                    </div>
                  )}

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Date de pertinence</Label>
                    <p className="text-sm">
                      {new Date(formData.destinationDates[0]).toLocaleDateString('fr-FR')}
                    </p>
                  </div>

                  {formData.isUrgent && (
                    <div className="flex items-center space-x-2 text-amber-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">Message urgent</span>
                    </div>
                  )}

                  <Separator />

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Contenu du message</Label>
                    <div className="mt-2 bg-muted/50 rounded-md">
                      <RichTextEditor
                        content={formData.content}
                        onChange={() => {}}
                        editable={false}
                        className="bg-transparent"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </StepperContent>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.push('/communications')} size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Nouveau Message</h1>
              <p className="text-sm text-muted-foreground hidden sm:block">Communication sécurisée de l'équipe</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-4xl">
        {/* Stepper */}
        <Stepper className="mb-8">
          {STEPS.map((step, index) => (
            <StepperItem
              key={step.id}
              isActive={currentStep === step.id}
              isCompleted={currentStep > step.id}
              isLast={index === STEPS.length - 1}
            >
              {step.id}
            </StepperItem>
          ))}
        </Stepper>

        {/* Step Content */}
        <Card>
          <CardContent className="p-8">
            {renderStepContent()}

            {/* Navigation */}
            <StepperNavigation>
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                size="sm"
                className="w-full sm:w-auto"
              >
                Précédent
              </Button>

              <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 w-full sm:w-auto">
                <Button variant="outline" onClick={() => router.push('/communications')} size="sm" className="w-full sm:w-auto">
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
                
                {currentStep < STEPS.length ? (
                  <Button onClick={handleNext} size="sm" className="w-full sm:w-auto">
                    Suivant
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} size="sm" className="w-full sm:w-auto" disabled={sending}>
                    <Send className="h-4 w-4 mr-2" />
                    {sending ? 'Envoi...' : 'Envoyer'}
                  </Button>
                )}
              </div>
            </StepperNavigation>
          </CardContent>
        </Card>
      </div>

      {/* PIN Authentication Dialog removed - user is already authenticated via session */}
    </div>
  );
}