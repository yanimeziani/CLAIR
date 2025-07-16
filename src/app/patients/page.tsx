'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, Plus, Search, Filter, MoreHorizontal, User, 
  Phone, AlertTriangle, MapPin, Calendar, ArrowLeft,
  Edit, Eye, UserX, UserCheck, Download, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { HtmlContent } from '@/components/ui/html-content';
import { ObservationNoteForm } from '@/components/observations/observation-note-form';
import { ObservationNotesList } from '@/components/observations/observation-notes-list';
import { toast } from 'sonner';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  profileImageURL?: string;
  allergies: string[];
  emergencyContacts: {
    name: string;
    relationship: string;
    phone: string;
  }[];
  medicalNotes?: string;
  isActive: boolean;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [observationRefresh, setObservationRefresh] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    allergies: '',
    medicalNotes: '',
    emergencyContacts: [{ name: '', relationship: '', phone: '' }]
  });
  const router = useRouter();

  useEffect(() => {
    const initPatients = async () => {
      await checkSession();
      await fetchPatients();
    };
    initPatients();
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

  const isAdmin = () => {
    return currentUser?.role === 'admin';
  };

  const handleExport = async (format: 'csv' = 'csv') => {
    try {
      const activeOnly = statusFilter === 'active';
      const response = await fetch(`/api/export/patients?format=${format}&activeOnly=${activeOnly}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `residents-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Export réussi!');
      } else {
        toast.error('Erreur lors de l\'export');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erreur lors de l\'export');
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/patients');
      if (response.ok) {
        const data = await response.json();
        setPatients(data.patients || []);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Erreur lors du chargement des résidents');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && patient.isActive) ||
      (statusFilter === 'inactive' && !patient.isActive);
    return matchesSearch && matchesStatus;
  });

  const openCreateDialog = () => {
    setEditingPatient(null);
    setFormData({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      allergies: '',
      medicalNotes: '',
      emergencyContacts: [{ name: '', relationship: '', phone: '' }]
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({
      firstName: patient.firstName,
      lastName: patient.lastName,
      dateOfBirth: patient.dateOfBirth.split('T')[0],
      allergies: patient.allergies.join(', '),
      medicalNotes: patient.medicalNotes || '',
      emergencyContacts: patient.emergencyContacts.length > 0 ? patient.emergencyContacts : [{ name: '', relationship: '', phone: '' }]
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error('Prénom, nom et numéro de chambre sont requis');
      return;
    }

    try {
      const url = editingPatient ? `/api/patients/${editingPatient._id}` : '/api/patients';
      const method = editingPatient ? 'PUT' : 'POST';
      
      const patientData = {
        ...formData,
        allergies: formData.allergies.split(',').map(a => a.trim()).filter(a => a),
        emergencyContacts: formData.emergencyContacts.filter(ec => ec.name.trim())
      };
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success(editingPatient ? 'Résident modifié' : 'Résident créé');
        setIsDialogOpen(false);
        fetchPatients();
      } else {
        toast.error(data.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Error saving patient:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const togglePatientStatus = async (patientId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/patients/${patientId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(isActive ? 'Résident archivé' : 'Résident réactivé');
        fetchPatients();
      } else {
        toast.error(data.error || 'Erreur lors de la modification du statut');
      }
    } catch (error) {
      console.error('Error toggling patient status:', error);
      toast.error('Erreur lors de la modification du statut');
    }
  };

  const addEmergencyContact = () => {
    setFormData({
      ...formData,
      emergencyContacts: [...formData.emergencyContacts, { name: '', relationship: '', phone: '' }]
    });
  };

  const removeEmergencyContact = (index: number) => {
    const newContacts = formData.emergencyContacts.filter((_, i) => i !== index);
    setFormData({ ...formData, emergencyContacts: newContacts });
  };

  const updateEmergencyContact = (index: number, field: string, value: string) => {
    const newContacts = [...formData.emergencyContacts];
    newContacts[index] = { ...newContacts[index], [field]: value };
    setFormData({ ...formData, emergencyContacts: newContacts });
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Users className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Chargement des résidents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Gestion des Résidents</h1>
                <p className="text-muted-foreground">Profils et informations des résidents</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                onClick={() => handleExport('csv')} 
                className="flex-1 sm:flex-none bg-gradient-to-r from-blue-500/10 to-blue-600/5 hover:from-blue-500/20 hover:to-blue-600/10 border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:scale-105"
              >
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Exporter CSV</span>
                <span className="sm:hidden">CSV</span>
              </Button>
              {isAdmin() && (
                <Button 
                  onClick={openCreateDialog} 
                  className="flex-1 sm:flex-none bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Nouveau Résident</span>
                  <span className="sm:hidden">Nouveau</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Filters and Stats */}
        <div className="grid lg:grid-cols-4 gap-6 mb-6">
          <Card className="lg:col-span-3">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher par nom ou numéro de chambre..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="md:w-48">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Résidents actifs</SelectItem>
                      <SelectItem value="inactive">Résidents archivés</SelectItem>
                      <SelectItem value="all">Tous les résidents</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardContent className="p-6">
              <div className="text-center">
                <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{patients.filter(p => p.isActive).length}</p>
                <p className="text-sm text-muted-foreground">Résidents actifs</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patients Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <Card key={patient._id} className={`transition-all hover:shadow-lg ${!patient.isActive ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/20 p-3 rounded-full">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{patient.firstName} {patient.lastName}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {patient.isActive ? (
                          <UserCheck className="h-4 w-4 text-green-500" />
                        ) : (
                          <UserX className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedPatient(patient)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Voir détails
                      </DropdownMenuItem>
                      {isAdmin() && (
                        <DropdownMenuItem onClick={() => setSelectedPatient(patient)}>
                          <FileText className="h-4 w-4 mr-2" />
                          Observations
                        </DropdownMenuItem>
                      )}
                      {isAdmin() && (
                        <DropdownMenuItem onClick={() => openEditDialog(patient)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                      )}
                      {isAdmin() && (
                        <DropdownMenuItem 
                          onClick={() => togglePatientStatus(patient._id, patient.isActive)}
                          className={patient.isActive ? 'text-red-600' : 'text-green-600'}
                        >
                        {patient.isActive ? (
                          <>
                            <UserX className="h-4 w-4 mr-2" />
                            Archiver
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-4 w-4 mr-2" />
                            Réactiver
                          </>
                        )}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2 shrink-0" />
                    <span className="truncate">{calculateAge(patient.dateOfBirth)} ans</span>
                  </div>
                  {patient.allergies.length > 0 && (
                    <div className="flex items-start text-amber-600">
                      <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 mr-2 mt-0.5 shrink-0" />
                      <span className="text-xs break-words">{patient.allergies.slice(0, 2).join(', ')}{patient.allergies.length > 2 && '...'}</span>
                    </div>
                  )}
                  {patient.emergencyContacts.length > 0 && (
                    <div className="flex items-center text-muted-foreground">
                      <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-2 shrink-0" />
                      <span className="text-xs truncate">{patient.emergencyContacts[0].name}</span>
                    </div>
                  )}
                  <div className="pt-2">
                    <span className={`text-xs px-2 py-1 rounded inline-block ${
                      patient.isActive ? 'bg-green-500/20 text-green-600' : 'bg-gray-500/20 text-gray-600'
                    }`}>
                      {patient.isActive ? 'Actif' : 'Archivé'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPatients.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Aucun résident trouvé</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'active' 
                  ? 'Essayez de modifier vos critères de recherche'
                  : isAdmin() 
                    ? 'Commencez par ajouter votre premier résident'
                    : 'Aucun résident trouvé'
                }
              </p>
              {!searchTerm && statusFilter === 'active' && isAdmin() && (
                <Button onClick={openCreateDialog} className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un résident
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPatient ? 'Modifier le résident' : 'Nouveau résident'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Prénom"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Nom de famille"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date de naissance</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Input
                id="allergies"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                placeholder="Séparer par des virgules"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medicalNotes">Notes médicales</Label>
              <RichTextEditor
                content={formData.medicalNotes}
                onChange={(content) => setFormData({ ...formData, medicalNotes: content })}
                placeholder="Informations médicales importantes"
                className="min-h-[100px]"
              />
            </div>

            {/* Emergency Contacts */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Contacts d'urgence</Label>
                <Button type="button" variant="outline" size="sm" onClick={addEmergencyContact}>
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              </div>
              
              {formData.emergencyContacts.map((contact, index) => (
                <div key={index} className="p-4 border border-border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Contact {index + 1}</span>
                    {formData.emergencyContacts.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeEmergencyContact(index)}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                  <div className="grid md:grid-cols-3 gap-3">
                    <Input
                      placeholder="Nom complet"
                      value={contact.name}
                      onChange={(e) => updateEmergencyContact(index, 'name', e.target.value)}
                    />
                    <Input
                      placeholder="Relation"
                      value={contact.relationship}
                      onChange={(e) => updateEmergencyContact(index, 'relationship', e.target.value)}
                    />
                    <Input
                      placeholder="Téléphone"
                      value={contact.phone}
                      onChange={(e) => updateEmergencyContact(index, 'phone', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                Annuler
              </Button>
              <Button type="submit" className="flex-1 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg">
                {editingPatient ? 'Modifier' : 'Créer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Patient Details Dialog */}
      <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedPatient && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-3">
                  <div className="bg-primary/20 p-2 rounded-full">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <span>{selectedPatient.firstName} {selectedPatient.lastName}</span>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Chambre</Label>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Âge</Label>
                    <p className="font-medium">{calculateAge(selectedPatient.dateOfBirth)} ans</p>
                  </div>
                </div>

                {selectedPatient.allergies.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground">Allergies</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedPatient.allergies.map((allergy, index) => (
                        <span key={index} className="bg-amber-500/20 text-amber-600 text-xs px-2 py-1 rounded">
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedPatient.medicalNotes && (
                  <div>
                    <Label className="text-muted-foreground">Notes médicales</Label>
                    <div className="mt-1 bg-muted/50 p-3 rounded-lg">
                      <RichTextEditor
                        content={selectedPatient.medicalNotes}
                        onChange={() => {}}
                        editable={false}
                      />
                    </div>
                  </div>
                )}

                <Separator />

                {/* Observations Section */}
                {isAdmin() && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">Observations</Label>
                      <ObservationNoteForm
                        patientId={selectedPatient._id}
                        patientName={`${selectedPatient.firstName} ${selectedPatient.lastName}`}
                        onSuccess={() => setObservationRefresh(prev => prev + 1)}
                      />
                    </div>
                    <ObservationNotesList
                      patientId={selectedPatient._id}
                      refreshTrigger={observationRefresh}
                    />
                  </div>
                )}

                {selectedPatient.emergencyContacts.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground">Contacts d'urgence</Label>
                    <div className="space-y-2 mt-1">
                      {selectedPatient.emergencyContacts.map((contact, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">{contact.name}</p>
                            <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                          </div>
                          <p className="text-sm font-mono">{contact.phone}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}