'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, ArrowLeft, Plus, Filter, User, Clock, 
  Droplets, Activity, ChevronLeft, ChevronRight, Search,
  Save, X, CheckCircle, AlertCircle, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { SHIFTS } from '@/lib/constants/shifts';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
}

interface BristolEntry {
  _id: string;
  patientId: string;
  authorId: string;
  shift: 'day' | 'evening' | 'night';
  entryDate: string;
  type: 'bowel';
  value: string;
  size?: 'G' | 'M' | 'P';
  createdAt: string;
}

const BRISTOL_SCALE = [
  { value: '1', label: 'Type 1 - Très dur', description: 'Morceaux durs séparés, difficiles à évacuer', color: 'bg-red-600' },
  { value: '2', label: 'Type 2 - Dur', description: 'En forme de saucisse, grumeleux', color: 'bg-orange-600' },
  { value: '3', label: 'Type 3 - Normal dur', description: 'En forme de saucisse, surface craquelée', color: 'bg-yellow-600' },
  { value: '4', label: 'Type 4 - Normal', description: 'En forme de saucisse, surface lisse', color: 'bg-green-600' },
  { value: '5', label: 'Type 5 - Normal mou', description: 'Masses molles aux bords nets', color: 'bg-blue-600' },
  { value: '6', label: 'Type 6 - Mou', description: 'Morceaux mous, bords déchiquetés', color: 'bg-indigo-600' },
  { value: '7', label: 'Type 7 - Liquide', description: 'Entièrement liquide', color: 'bg-purple-600' }
];

const SIZE_OPTIONS = [
  { value: 'P', label: 'Petit', color: 'bg-blue-500' },
  { value: 'M', label: 'Moyen', color: 'bg-green-500' },
  { value: 'G', label: 'Grand', color: 'bg-orange-500' }
];

export default function BristolPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entries, setEntries] = useState<BristolEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedShift, setSelectedShift] = useState<string>('');
  const [entryType, setEntryType] = useState<'bowel'>('bowel');
  const [entryValue, setEntryValue] = useState('');
  const [entrySize, setEntrySize] = useState<'G' | 'M' | 'P' | ''>('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const router = useRouter();

  useEffect(() => {
    checkSession();
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      fetchEntries();
    }
  }, [selectedPatient, currentDate]);

  const handleExport = async (format: 'csv' = 'csv') => {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      
      if (selectedPatient) {
        params.append('patientId', selectedPatient._id);
      }
      
      // Export current month's data
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];
      
      params.append('startDate', startDate);
      params.append('endDate', endDate);
      
      const response = await fetch(`/api/export/bristol?${params.toString()}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bristol-tracking-${startDate}-${endDate}.${format}`;
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

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/patients');
      if (response.ok) {
        const data = await response.json();
        setPatients(data.patients?.filter((p: Patient) => p.isActive) || []);
        if (data.patients?.length > 0) {
          setSelectedPatient(data.patients.filter((p: Patient) => p.isActive)[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Erreur lors du chargement des résidents');
    } finally {
      setLoading(false);
    }
  };

  const fetchEntries = async () => {
    if (!selectedPatient) return;
    
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      const response = await fetch(`/api/bristol?patientId=${selectedPatient._id}&year=${year}&month=${month}`);
      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries || []);
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
      toast.error('Erreur lors du chargement des données');
    }
  };

  const filteredPatients = patients.filter(patient =>
    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    
    return days;
  };

  const getEntriesForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return entries.filter(entry => entry.entryDate.startsWith(dateStr));
  };

  const getEntryForDayAndShift = (date: Date, shift: string) => {
    const dayEntries = getEntriesForDay(date);
    return dayEntries.find(entry => entry.shift === shift && entry.type === 'bowel');
  };

  const openEntryDialog = (dateStr: string, shift: string) => {
    setSelectedDay(dateStr);
    setSelectedShift(shift);
    setEntryType('bowel');
    setEntryValue('');
    setEntrySize('');
    setIsDialogOpen(true);
  };

  const handleSaveEntry = async () => {
    if (!selectedPatient || !entryValue || !entrySize) {
      toast.error('Veuillez sélectionner une valeur et une taille');
      return;
    }

    try {
      const response = await fetch('/api/bristol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatient._id,
          shift: selectedShift,
          entryDate: selectedDay,
          type: entryType,
          value: entryValue,
          size: entrySize
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Entrée enregistrée');
        setIsDialogOpen(false);
        fetchEntries();
      } else {
        toast.error(data.error || 'Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getBristolInfo = (value: string) => {
    return BRISTOL_SCALE.find(scale => scale.value === value);
  };

  const getSizeInfo = (size: string) => {
    return SIZE_OPTIONS.find(s => s.value === size);
  };

  const getShiftInfo = (shift: string) => {
    return SHIFTS.find(s => s.value === shift);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Chargement du suivi Bristol...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">Suivi Bristol</h1>
                <p className="text-sm sm:text-base text-muted-foreground">Surveillance des selles selon l'échelle Bristol</p>
              </div>
            </div>
            {selectedPatient && currentUser?.role === 'admin' && (
              <Button variant="outline" onClick={() => handleExport('csv')} className="w-full sm:w-auto bg-gradient-to-r from-blue-500/10 to-blue-600/5 hover:from-blue-500/20 hover:to-blue-600/10 border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:scale-105">
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Exporter CSV</span>
                <span className="sm:hidden">Export</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Patient Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Sélection du résident
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un résident..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:w-64">
                <Select 
                  value={selectedPatient?._id || ''} 
                  onValueChange={(value) => {
                    const patient = patients.find(p => p._id === value);
                    setSelectedPatient(patient || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un résident" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredPatients.map(patient => (
                      <SelectItem key={patient._id} value={patient._id}>
                        {patient.firstName} {patient.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedPatient && (
          <>
            {/* Calendar Navigation */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <Button variant="outline" onClick={() => navigateMonth('prev')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="text-center">
                    <h2 className="text-xl font-semibold">
                      {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Résident: {selectedPatient.firstName} {selectedPatient.lastName}
                    </p>
                  </div>
                  
                  <Button variant="outline" onClick={() => navigateMonth('next')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Calendar Grid */}
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <span>Calendrier du suivi</span>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-amber-500" />
                      <span className="hidden sm:inline">Échelle Bristol</span>
                      <span className="sm:hidden">Bristol</span>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Mobile scroll hint */}
                <div className="block md:hidden text-xs text-muted-foreground mb-2 text-center">
                  ← Faites défiler horizontalement →
                </div>
                
                {/* Calendar container with horizontal scroll on mobile */}
                <div className="overflow-x-auto md:overflow-visible">
                  <div className="min-w-[800px] md:min-w-0">
                    {/* Days of week header */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
                        <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar days - Enhanced day-to-day view */}
                    <div className="grid grid-cols-7 gap-2">
                      {getDaysInMonth(currentDate).map((date, index) => {
                        const dateStr = date.toISOString().split('T')[0];
                        const dayEntries = getEntriesForDay(date);
                        const isToday = date.toDateString() === new Date().toDateString();
                        const isPastDate = date < new Date();
                        const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });
                        
                        return (
                          <div 
                            key={index} 
                            className={`relative border-2 rounded-xl p-3 min-h-[160px] md:min-h-[180px] transition-all duration-300 hover:shadow-lg ${
                              isToday 
                                ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300 shadow-md' 
                                : isPastDate 
                                  ? 'bg-gray-50/80 border-gray-200' 
                                  : 'bg-white border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {/* Day header */}
                            <div className="text-center mb-3">
                              <div className={`text-xs font-medium text-gray-500 ${isToday ? 'text-blue-600' : ''}`}>
                                {dayName}
                              </div>
                              <div className={`text-lg font-bold ${
                                isToday 
                                  ? 'text-blue-700' 
                                  : isPastDate 
                                    ? 'text-gray-600' 
                                    : 'text-gray-800'
                              }`}>
                                {date.getDate()}
                              </div>
                              {isToday && (
                                <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                              )}
                            </div>
                            
                            {/* Shifts with improved styling */}
                            <div className="space-y-2">
                              {SHIFTS.map(shift => {
                                const bowelEntry = getEntryForDayAndShift(date, shift.value);
                                const hasEntry = bowelEntry !== undefined;
                                
                                return (
                                  <div 
                                    key={shift.value}
                                    className={`relative border rounded-lg p-2 cursor-pointer transition-all duration-200 hover:scale-102 ${
                                      hasEntry 
                                        ? 'border-green-200 bg-green-50/80 hover:bg-green-100/80' 
                                        : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100/80'
                                    }`}
                                    onClick={() => openEntryDialog(dateStr, shift.value)}
                                  >
                                    <div className="flex items-center justify-between">
                                      {/* Shift label */}
                                      <div className={`text-xs font-medium px-2 py-1 rounded-full text-white ${shift.bgColor}`}>
                                        {shift.label.split(' ')[0]}
                                      </div>
                                      
                                      {/* Entry indicator */}
                                      <div className="flex items-center space-x-1">
                                        {hasEntry ? (
                                          <>
                                            <div className={`w-4 h-4 rounded-full border-2 border-white shadow-sm ${getBristolInfo(bowelEntry.value)?.color || 'bg-gray-400'}`} />
                                            {bowelEntry.size && (
                                              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full text-white shadow-sm ${getSizeInfo(bowelEntry.size)?.color || 'bg-gray-500'}`}>
                                                {bowelEntry.size}
                                              </span>
                                            )}
                                            <CheckCircle className="h-3 w-3 text-green-600" />
                                          </>
                                        ) : (
                                          <>
                                            <div className="w-4 h-4 rounded-full bg-gray-300 border-2 border-white shadow-sm" />
                                            <Plus className="h-3 w-3 text-gray-400" />
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {/* Quick preview of Bristol type */}
                                    {hasEntry && (
                                      <div className="mt-1 text-xs text-gray-600 truncate">
                                        Type {bowelEntry.value} - {getBristolInfo(bowelEntry.value)?.label.split(' - ')[1]}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            
                            {/* Day completion indicator */}
                            <div className="absolute bottom-2 left-2 right-2">
                              <div className="flex justify-center space-x-1">
                                {SHIFTS.map(shift => {
                                  const hasEntry = getEntryForDayAndShift(date, shift.value) !== undefined;
                                  return (
                                    <div 
                                      key={shift.value}
                                      className={`w-1.5 h-1.5 rounded-full ${
                                        hasEntry ? 'bg-green-500' : 'bg-gray-300'
                                      }`}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Legend */}
            <div className="max-w-4xl mx-auto mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Échelle de Bristol</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {BRISTOL_SCALE.map(scale => (
                      <div key={scale.value} className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${scale.color}`} />
                        <div>
                          <p className="font-medium text-sm">{scale.label}</p>
                          <p className="text-xs text-muted-foreground">{scale.description}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tailles</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {SIZE_OPTIONS.map(size => (
                      <div key={size.value} className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${size.color}`} />
                        <div>
                          <p className="font-medium text-sm">{size.value} - {size.label}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Entry Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvelle entrée</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p><strong>Date:</strong> {new Date(selectedDay).toLocaleDateString('fr-FR')}</p>
              <p><strong>Équipe:</strong> {getShiftInfo(selectedShift)?.label}</p>
              <p><strong>Résident:</strong> {selectedPatient?.firstName} {selectedPatient?.lastName}</p>
            </div>

            <div className="space-y-2">
              <Label>Type d'entrée</Label>
              <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                <Activity className="h-4 w-4 text-amber-500" />
                <span className="font-medium">Échelle Bristol (Selles)</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Valeur Bristol</Label>
              <Select value={entryValue} onValueChange={setEntryValue}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type de selles" />
                </SelectTrigger>
                <SelectContent>
                  {BRISTOL_SCALE.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${option.color}`} />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Taille *</Label>
              <Select value={entrySize} onValueChange={(value: 'G' | 'M' | 'P') => setEntrySize(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner la taille" />
                </SelectTrigger>
                <SelectContent>
                  {SIZE_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${option.color}`} />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              <Button onClick={handleSaveEntry} className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}