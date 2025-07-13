'use client';

import { useState, useEffect } from 'react';
import { FileText, Clock, User, Eye, ThumbsUp, ThumbsDown, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

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

interface RecentObservationsViewProps {
  limit?: number;
  className?: string;
}

export function RecentObservationsView({ limit = 5, className }: RecentObservationsViewProps) {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentObservations();
  }, []);

  const fetchRecentObservations = async () => {
    try {
      const response = await fetch(`/api/observations?limit=${limit}&withPatientNames=true`);
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

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-primary" />
            Observations Récentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50 animate-pulse" />
            <p className="text-sm">Chargement...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-primary" />
            Observations Récentes
          </span>
          <Button size="sm" variant="ghost" onClick={() => window.location.href = '/observations'}>
            <Eye className="h-4 w-4 mr-1" />
            Voir tout
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {observations.length > 0 ? (
          <div className="space-y-4">
            {observations.map((observation) => (
              <div 
                key={observation._id} 
                className="p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{observation.patientName || 'Patient inconnu'}</span>
                    <div className="flex items-center space-x-1">
                      {observation.isPositive ? (
                        <ThumbsUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <ThumbsDown className="h-3 w-3 text-red-600" />
                      )}
                      {observation.isSignificant && (
                        <AlertTriangle className="h-3 w-3 text-orange-600" />
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(observation.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                
                <p className="text-sm text-foreground mb-2">
                  {truncateContent(observation.content.replace(/<[^>]*>/g, ''))}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Par {observation.authorName}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Badge variant={observation.isPositive ? 'default' : 'destructive'} className="text-xs">
                      {observation.isPositive ? 'Positive' : 'Négative'}
                    </Badge>
                    {observation.isSignificant && (
                      <Badge variant="secondary" className="text-xs">
                        Significative
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucune observation récente</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}