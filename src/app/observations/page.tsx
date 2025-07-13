'use client';

import { useState, useEffect } from 'react';
import { FileText, Search, Filter, Plus, User, Clock, ThumbsUp, ThumbsDown, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { QuickObservationForm } from '@/components/observations/quick-observation-form';

interface Observation {
  _id: string;
  patientId: string;
  patientName?: string;
  content: string;
  isPositive: boolean;
  isSignificant: boolean;
  authorName: string;
  createdAt: string;
}

export default function ObservationsPage() {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'positive' | 'negative' | 'significant'>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchObservations();
  }, []);

  const fetchObservations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/observations?withPatientNames=true&limit=50');
      const data = await response.json();
      
      if (data.success) {
        setObservations(data.observations || []);
      } else {
        toast.error('Erreur lors du chargement des observations');
      }
    } catch (error) {
      console.error('Error fetching observations:', error);
      toast.error('Erreur lors du chargement des observations');
    } finally {
      setLoading(false);
    }
  };

  const handleObservationAdded = () => {
    fetchObservations();
    setShowAddForm(false);
  };

  const filteredObservations = observations.filter(observation => {
    const matchesSearch = observation.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (observation.patientName && observation.patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         observation.authorName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterType === 'all' ||
      (filterType === 'positive' && observation.isPositive) ||
      (filterType === 'negative' && !observation.isPositive) ||
      (filterType === 'significant' && observation.isSignificant);

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50 animate-pulse" />
          <h2 className="text-xl font-semibold mb-2">Chargement des observations...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <FileText className="h-8 w-8 mr-3 text-primary" />
            Observations
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérer toutes les observations des patients
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle observation
        </Button>
      </div>

      {/* Quick Add Form */}
      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Nouvelle Observation</CardTitle>
          </CardHeader>
          <CardContent>
            <QuickObservationForm
              onSuccess={handleObservationAdded}
            />
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par contenu, patient ou auteur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="positive">Positives</SelectItem>
                <SelectItem value="negative">Négatives</SelectItem>
                <SelectItem value="significant">Significatives</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Observations List */}
      <div className="space-y-4">
        {filteredObservations.length > 0 ? (
          filteredObservations.map((observation) => (
            <Card key={observation._id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{observation.patientName || 'Patient inconnu'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {observation.isPositive ? (
                        <ThumbsUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <ThumbsDown className="h-4 w-4 text-red-600" />
                      )}
                      {observation.isSignificant && (
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {new Date(observation.createdAt).toLocaleDateString('fr-FR', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
                
                <div 
                  className="text-foreground mb-4 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: observation.content }}
                />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Par {observation.authorName}
                  </span>
                  <div className="flex items-center space-x-2">
                    <Badge variant={observation.isPositive ? 'default' : 'destructive'}>
                      {observation.isPositive ? 'Positive' : 'Négative'}
                    </Badge>
                    {observation.isSignificant && (
                      <Badge variant="secondary">
                        Significative
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Aucune observation trouvée</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filterType !== 'all' 
                    ? 'Aucune observation ne correspond à vos critères de recherche.'
                    : 'Aucune observation n\'a encore été créée.'
                  }
                </p>
                {!searchTerm && filterType === 'all' && (
                  <Button onClick={() => setShowAddForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer une observation
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Statistics */}
      {observations.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Statistiques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{observations.length}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {observations.filter(o => o.isPositive).length}
                </div>
                <div className="text-sm text-muted-foreground">Positives</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {observations.filter(o => !o.isPositive).length}
                </div>
                <div className="text-sm text-muted-foreground">Négatives</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {observations.filter(o => o.isSignificant).length}
                </div>
                <div className="text-sm text-muted-foreground">Significatives</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}