'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  User, 
  Calendar, 
  ThumbsUp, 
  ThumbsDown, 
  AlertTriangle,
  Eye,
  Clock,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { HtmlContent } from '@/components/ui/html-content';
import { toast } from 'sonner';

interface ObservationNote {
  _id: string;
  content: string;
  isPositive: boolean;
  isSignificant: boolean;
  authorName: string;
  authorEmployeeNumber?: string;
  createdAt: string;
  signature: {
    signedAt: string;
    ipAddress?: string;
    userAgent?: string;
  };
}

interface ObservationNotesListProps {
  patientId: string;
  refreshTrigger?: number;
}

export function ObservationNotesList({ patientId, refreshTrigger }: ObservationNotesListProps) {
  const [notes, setNotes] = useState<ObservationNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<ObservationNote | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative' | 'significant'>('all');
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  useEffect(() => {
    const initNotes = async () => {
      await checkSession();
      await fetchNotes();
    };
    initNotes();
  }, [patientId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (refreshTrigger) {
      fetchNotes();
    }
  }, [refreshTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      
      if (data.authenticated) {
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error('Session check error:', error);
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await fetch(`/api/observations?patientId=${patientId}`);
      if (response.ok) {
        const data = await response.json();
        setNotes(data.observations || []);
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

  const isAdmin = () => {
    return currentUser?.role === 'admin' || currentUser?.role === 'educator';
  };

  const filteredNotes = notes.filter(note => {
    switch (filter) {
      case 'positive':
        return note.isPositive;
      case 'negative':
        return !note.isPositive;
      case 'significant':
        return note.isSignificant;
      default:
        return true;
    }
  });

  const toggleNoteExpansion = (noteId: string) => {
    const newExpanded = new Set(expandedNotes);
    if (newExpanded.has(noteId)) {
      newExpanded.delete(noteId);
    } else {
      newExpanded.add(noteId);
    }
    setExpandedNotes(newExpanded);
  };

  const getContentPreview = (content: string, maxLength: number = 150) => {
    const textContent = content.replace(/<[^>]*>/g, '');
    return textContent.length > maxLength 
      ? textContent.substring(0, maxLength) + '...'
      : textContent;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <p className="text-sm">Chargement des observations...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isAdmin()) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              Accès aux observations réservé aux professionnels et éducateurs
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Observations ({filteredNotes.length})</h3>
        <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les observations</SelectItem>
            <SelectItem value="positive">Observations positives</SelectItem>
            <SelectItem value="negative">Observations négatives</SelectItem>
            <SelectItem value="significant">Événements significatifs</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {filter === 'all' 
                  ? 'Aucune observation enregistrée pour cet usager'
                  : 'Aucune observation correspondant au filtre sélectionné'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotes.map((note) => {
            const isExpanded = expandedNotes.has(note._id);
            const contentPreview = getContentPreview(note.content);
            const needsExpansion = note.content.replace(/<[^>]*>/g, '').length > 150;

            return (
              <Card 
                key={note._id} 
                className={`transition-all ${
                  note.isSignificant 
                    ? 'border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20' 
                    : note.isPositive 
                      ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20'
                      : 'border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20'
                }`}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {note.isPositive ? (
                            <ThumbsUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <ThumbsDown className="h-4 w-4 text-orange-600" />
                          )}
                          {note.isSignificant && (
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm font-medium">{note.authorName}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {new Date(note.createdAt).toLocaleDateString('fr-FR')} à{' '}
                              {new Date(note.createdAt).toLocaleTimeString('fr-FR')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {note.isSignificant && (
                          <span className="text-xs px-2 py-1 bg-amber-200 text-amber-800 rounded-full">
                            Significatif
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedNote(note)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Content Preview */}
                    <div className="space-y-2">
                      {isExpanded ? (
                        <RichTextEditor
                          content={note.content}
                          onChange={() => {}}
                          editable={false}
                          className="bg-background/50"
                        />
                      ) : (
                        <HtmlContent 
                          content={contentPreview}
                          className="text-sm line-clamp-3"
                        />
                      )}
                      
                      {needsExpansion && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleNoteExpansion(note._id)}
                          className="h-auto p-1 text-xs text-primary hover:text-primary/80"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-3 w-3 mr-1" />
                              Voir moins
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3 w-3 mr-1" />
                              Voir plus
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    {/* Signature Info */}
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground pt-2 border-t border-border/50">
                      <Clock className="h-3 w-3" />
                      <span>
                        Signé électroniquement le {new Date(note.signature.signedAt).toLocaleDateString('fr-FR')} à{' '}
                        {new Date(note.signature.signedAt).toLocaleTimeString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detailed View Dialog */}
      <Dialog open={!!selectedNote} onOpenChange={() => setSelectedNote(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedNote && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    {selectedNote.isPositive ? (
                      <ThumbsUp className="h-5 w-5 text-green-600" />
                    ) : (
                      <ThumbsDown className="h-5 w-5 text-orange-600" />
                    )}
                    {selectedNote.isSignificant && (
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                    )}
                  </div>
                  <span>
                    Observation {selectedNote.isPositive ? 'positive' : 'négative'}
                    {selectedNote.isSignificant ? ' (significative)' : ''}
                  </span>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Author and Date */}
                <Card>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Auteur</Label>
                        <p className="font-medium">{selectedNote.authorName}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Date et heure</Label>
                        <p className="font-medium">
                          {new Date(selectedNote.createdAt).toLocaleDateString('fr-FR')} à{' '}
                          {new Date(selectedNote.createdAt).toLocaleTimeString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Content */}
                <div className="space-y-2">
                  <Label className="text-base font-medium">Contenu</Label>
                  <RichTextEditor
                    content={selectedNote.content}
                    onChange={() => {}}
                    editable={false}
                    className="bg-muted/20"
                  />
                </div>

                <Separator />

                {/* Digital Signature */}
                <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                  <CardHeader>
                    <CardTitle className="text-lg text-blue-900 dark:text-blue-100">
                      Signature électronique
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-blue-700 dark:text-blue-300">Signé par</Label>
                        <p className="font-medium text-blue-900 dark:text-blue-100">
                          {selectedNote.authorName}
                          {selectedNote.authorEmployeeNumber && (
                            <span className="text-sm font-normal text-blue-700 dark:text-blue-300">
                              {' '}(#{selectedNote.authorEmployeeNumber})
                            </span>
                          )}
                        </p>
                      </div>
                      <div>
                        <Label className="text-blue-700 dark:text-blue-300">Date de signature</Label>
                        <p className="font-medium text-blue-900 dark:text-blue-100">
                          {new Date(selectedNote.signature.signedAt).toLocaleDateString('fr-FR')} à{' '}
                          {new Date(selectedNote.signature.signedAt).toLocaleTimeString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    {selectedNote.signature.ipAddress && (
                      <div className="text-xs text-blue-600 dark:text-blue-400 pt-2 border-t border-blue-200 dark:border-blue-800">
                        <p>Adresse IP: {selectedNote.signature.ipAddress}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}