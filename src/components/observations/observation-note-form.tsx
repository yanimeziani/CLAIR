'use client';

import { useState, useEffect } from 'react';
import { Plus, Save, X, FileText, ThumbsUp, ThumbsDown, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { toast } from 'sonner';

interface ObservationNoteFormProps {
  patientId: string;
  patientName: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

interface FormData {
  content: string;
  isPositive: boolean;
  isSignificant: boolean;
}

export function ObservationNoteForm({ 
  patientId, 
  patientName, 
  onSuccess,
  trigger 
}: ObservationNoteFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [formData, setFormData] = useState<FormData>({
    content: '',
    isPositive: true,
    isSignificant: false,
  });

  useEffect(() => {
    if (isOpen) {
      checkSession();
    }
  }, [isOpen]);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      
      if (!data.authenticated) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        setIsOpen(false);
        return;
      }
      
      setCurrentUser(data.user);
    } catch (error) {
      toast.error('Erreur de session. Veuillez vous reconnecter.');
      setIsOpen(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.content.trim()) {
      toast.error('Le contenu de l\'observation est requis');
      return;
    }

    if (!currentUser) {
      toast.error('Utilisateur non authentifié');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        patientId,
        content: formData.content,
        isPositive: formData.isPositive,
        isSignificant: formData.isSignificant,
        authorName: `${currentUser.firstName} ${currentUser.lastName}`,
        authorEmployeeNumber: currentUser.employeeNumber || '',
        signature: {
          signedAt: new Date().toISOString(),
          ipAddress: '', // Will be filled by server
          userAgent: navigator.userAgent,
        }
      };

      const response = await fetch('/api/observations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Observation enregistrée avec succès');
        setFormData({
          content: '',
          isPositive: true,
          isSignificant: false,
        });
        setIsOpen(false);
        onSuccess?.();
      } else {
        toast.error(data.error || 'Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      console.error('Error saving observation:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const defaultTrigger = (
    <Button size="sm">
      <Plus className="h-4 w-4 mr-2" />
      Nouvelle observation
    </Button>
  );

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="cursor-pointer">
        {trigger || defaultTrigger}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Nouvelle observation - {patientName}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Observation Type */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <span>Type d'observation</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.isPositive
                        ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                        : 'border-border hover:border-green-300'
                    }`}
                    onClick={() => setFormData({ ...formData, isPositive: true })}
                  >
                    <div className="flex items-center space-x-3">
                      <ThumbsUp className={`h-6 w-6 ${formData.isPositive ? 'text-green-600' : 'text-muted-foreground'}`} />
                      <div>
                        <h3 className="font-medium">Observation positive</h3>
                        <p className="text-sm text-muted-foreground">
                          Progrès, amélioration, comportement positif
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      !formData.isPositive
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                        : 'border-border hover:border-orange-300'
                    }`}
                    onClick={() => setFormData({ ...formData, isPositive: false })}
                  >
                    <div className="flex items-center space-x-3">
                      <ThumbsDown className={`h-6 w-6 ${!formData.isPositive ? 'text-orange-600' : 'text-muted-foreground'}`} />
                      <div>
                        <h3 className="font-medium">Observation négative</h3>
                        <p className="text-sm text-muted-foreground">
                          Problème, régression, incident à signaler
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Significance Toggle */}
            <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-amber-50 dark:bg-amber-950/20">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <div>
                  <Label className="text-base font-medium">Événement significatif</Label>
                  <p className="text-sm text-muted-foreground">
                    Marquer cette observation comme particulièrement importante pour les professionnels
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.isSignificant}
                onCheckedChange={(checked) => setFormData({ ...formData, isSignificant: checked })}
              />
            </div>

            {/* Content Editor */}
            <div className="space-y-2">
              <Label className="text-base font-medium">Contenu de l'observation *</Label>
              <RichTextEditor
                content={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                placeholder="Décrivez votre observation de manière détaillée et professionnelle..."
                className="min-h-[200px]"
              />
              <p className="text-sm text-muted-foreground">
                Cette observation sera signée électroniquement avec votre nom et horodatage.
              </p>
            </div>

            {/* Digital Signature Info */}
            {currentUser && (
              <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">Signature électronique</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Cette observation sera signée par <strong>{currentUser.firstName} {currentUser.lastName}</strong>
                        {currentUser.employeeNumber && <span> (#{currentUser.employeeNumber})</span>}
                        {' '}le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={saving || !formData.content.trim()}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Enregistrement...' : 'Enregistrer et signer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}