'use client';

import { useState } from 'react';
import { Check, X, RefreshCw, Sparkles, FileText, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface AISuggestion {
  type: 'correction' | 'summary';
  original_text: string;
  suggested_text: string;
  metadata?: {
    has_changes?: boolean;
    word_count_original?: number;
    word_count_summary?: number;
    compression_ratio?: number;
    model_used?: string;
    suggestions?: {
      grammar_improvements?: boolean;
      style_improvements?: boolean;
    };
  };
}

interface AISuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestion: AISuggestion | null;
  onAccept: (suggestedText: string) => void;
  onReject: () => void;
}

export function AISuggestionModal({
  isOpen,
  onClose,
  suggestion,
  onAccept,
  onReject
}: AISuggestionModalProps) {
  const [isComparing, setIsComparing] = useState(false);

  if (!suggestion) return null;

  // Simple markdown to HTML converter
  const convertMarkdownToHtml = (markdown: string): string => {
    let html = markdown
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Headers
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold">$1</h1>')
      // Line breaks
      .replace(/\n\n/g, '</p><p class="mb-2">')
      .replace(/\n/g, '<br>');
    
    // Wrap in paragraphs if not already wrapped
    if (!html.startsWith('<h') && !html.startsWith('<p>')) {
      html = `<p class="mb-2">${html}</p>`;
    }
    
    return html;
  };

  const handleAccept = () => {
    onAccept(suggestion.suggested_text);
    onClose();
  };

  const handleReject = () => {
    onReject();
    onClose();
  };

  const getTitle = () => {
    return suggestion.type === 'correction' 
      ? '🤖 Suggestion de correction IA' 
      : '📝 Résumé généré par IA';
  };

  const getDescription = () => {
    return suggestion.type === 'correction'
      ? 'L\'IA a analysé votre texte et propose des améliorations.'
      : 'L\'IA a généré un résumé concis de votre texte.';
  };

  const renderMetadata = () => {
    if (!suggestion.metadata) return null;

    return (
      <div className="space-y-2">
        {suggestion.type === 'correction' && suggestion.metadata.suggestions && (
          <div className="flex flex-wrap gap-2">
            {suggestion.metadata.suggestions.grammar_improvements && (
              <Badge variant="secondary" className="text-xs">
                <Check className="h-3 w-3 mr-1" />
                Grammaire améliorée
              </Badge>
            )}
            {suggestion.metadata.suggestions.style_improvements && (
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                Style professionnel
              </Badge>
            )}
          </div>
        )}

        {suggestion.type === 'summary' && (
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span>📊 {suggestion.metadata.word_count_original} → {suggestion.metadata.word_count_summary} mots</span>
            <span>🗜️ Compression: {suggestion.metadata.compression_ratio}%</span>
          </div>
        )}

        {suggestion.metadata.model_used && (
          <div className="text-xs text-muted-foreground flex items-center">
            <Info className="h-3 w-3 mr-1" />
            Modèle: {suggestion.metadata.model_used}
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {suggestion.type === 'correction' ? (
              <Sparkles className="h-5 w-5 text-blue-500" />
            ) : (
              <FileText className="h-5 w-5 text-green-500" />
            )}
            {getTitle()}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{getDescription()}</p>
        </DialogHeader>

        <div className="space-y-4">
          {renderMetadata()}
          
          <Separator />

          {/* Toggle between side-by-side and stacked view */}
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Comparaison</h3>
            <Button
              variant="outline" 
              size="sm"
              onClick={() => setIsComparing(!isComparing)}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {isComparing ? 'Vue empilée' : 'Vue côte à côte'}
            </Button>
          </div>

          <div className={`grid gap-4 ${isComparing ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
            {/* Original Text */}
            <Card className="border-orange-200 dark:border-orange-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center text-orange-700 dark:text-orange-300">
                  <FileText className="h-4 w-4 mr-2" />
                  Texte original
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-md border border-orange-200 dark:border-orange-800 max-h-60 overflow-y-auto">
                  <div 
                    className="text-sm prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ 
                      __html: convertMarkdownToHtml(suggestion.original_text) 
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Suggested Text */}
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center text-green-700 dark:text-green-300">
                  <Sparkles className="h-4 w-4 mr-2" />
                  {suggestion.type === 'correction' ? 'Texte corrigé' : 'Résumé proposé'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-md border border-green-200 dark:border-green-800 max-h-60 overflow-y-auto">
                  <div 
                    className="text-sm prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ 
                      __html: convertMarkdownToHtml(suggestion.suggested_text) 
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex-1 text-xs text-muted-foreground">
            💡 Cette suggestion est générée par IA. Vérifiez toujours le contenu avant acceptation.
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReject}>
              <X className="h-4 w-4 mr-2" />
              Rejeter
            </Button>
            <Button onClick={handleAccept} className="bg-green-600 hover:bg-green-700">
              <Check className="h-4 w-4 mr-2" />
              Accepter {suggestion.type === 'correction' ? 'la correction' : 'le résumé'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}