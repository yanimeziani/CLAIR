'use client';

import { 
  Sparkles, 
  FileText, 
  Wand2, 
  Loader2, 
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AIAssistanceToolbarProps {
  onCorrect: () => void;
  onSummarize: () => void;
  onEnhance: (type: 'professional' | 'concise' | 'detailed') => void;
  isProcessing: boolean;
  hasContent: boolean;
  errorCount: number;
  className?: string;
  variant?: 'compact' | 'full';
  showSummary?: boolean;
  showEnhance?: boolean;
}

export function AIAssistanceToolbar({
  onCorrect,
  onSummarize,
  onEnhance,
  isProcessing,
  hasContent,
  errorCount,
  className,
  variant = 'full',
  showSummary = true,
  showEnhance = true
}: AIAssistanceToolbarProps) {
  const isCompact = variant === 'compact';

  if (isCompact) {
    return (
      <div className={cn('flex items-center gap-1 p-1 border-b bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20', className)}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={isProcessing || !hasContent}
              className="h-7 px-2 text-xs bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            >
              {isProcessing ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3 mr-1" />
              )}
              IA
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={onCorrect} disabled={isProcessing || !hasContent}>
              <Sparkles className="h-4 w-4 mr-2 text-blue-500" />
              Corriger le texte
            </DropdownMenuItem>
            {showSummary && (
              <DropdownMenuItem onClick={onSummarize} disabled={isProcessing || !hasContent}>
                <FileText className="h-4 w-4 mr-2 text-green-500" />
                Générer un résumé
              </DropdownMenuItem>
            )}
            {showEnhance && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEnhance('professional')} disabled={isProcessing || !hasContent}>
                  <Wand2 className="h-4 w-4 mr-2 text-purple-500" />
                  Style professionnel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEnhance('concise')} disabled={isProcessing || !hasContent}>
                  <Wand2 className="h-4 w-4 mr-2 text-orange-500" />
                  Rendre plus concis
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEnhance('detailed')} disabled={isProcessing || !hasContent}>
                  <Wand2 className="h-4 w-4 mr-2 text-indigo-500" />
                  Ajouter des détails
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {errorCount > 0 && (
          <Badge variant="destructive" className="h-5 text-xs px-1">
            <AlertCircle className="h-3 w-3 mr-1" />
            {errorCount}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      'flex items-center gap-2 p-2 border-b bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200/30 dark:border-blue-800/30',
      className
    )}>
      {/* Correction Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onCorrect}
        disabled={isProcessing || !hasContent}
        className={cn(
          "h-8 px-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-sm transition-all",
          isProcessing && "opacity-75"
        )}
        title="✨ Correction automatique par IA"
      >
        {isProcessing ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-xs font-medium">Traitement...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-medium">Corriger IA</span>
            {errorCount > 0 && (
              <Badge variant="secondary" className="h-4 text-xs px-1 bg-red-100 text-red-700">
                {errorCount}
              </Badge>
            )}
          </div>
        )}
      </Button>

      {/* Summary Button */}
      {showSummary && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onSummarize}
          disabled={isProcessing || !hasContent}
          className={cn(
            "h-8 px-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-sm transition-all",
            isProcessing && "opacity-75"
          )}
          title="📝 Générer un résumé automatique"
        >
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="text-xs font-medium">Résumé IA</span>
          </div>
        </Button>
      )}

      {/* Enhancement Dropdown */}
      {showEnhance && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={isProcessing || !hasContent}
              className={cn(
                "h-8 px-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-sm transition-all",
                isProcessing && "opacity-75"
              )}
              title="🎯 Améliorer le style du texte"
            >
              <div className="flex items-center gap-2">
                <Wand2 className="h-4 w-4" />
                <span className="text-xs font-medium">Améliorer</span>
                <ChevronDown className="h-3 w-3" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            <DropdownMenuItem 
              onClick={() => onEnhance('professional')} 
              disabled={isProcessing || !hasContent}
              className="flex items-center gap-2"
            >
              <div className="h-2 w-2 rounded-full bg-purple-500" />
              <div>
                <div className="font-medium">Style professionnel</div>
                <div className="text-xs text-muted-foreground">Ton formel et médical</div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onEnhance('concise')} 
              disabled={isProcessing || !hasContent}
              className="flex items-center gap-2"
            >
              <div className="h-2 w-2 rounded-full bg-orange-500" />
              <div>
                <div className="font-medium">Rendre plus concis</div>
                <div className="text-xs text-muted-foreground">Réduire la longueur</div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onEnhance('detailed')} 
              disabled={isProcessing || !hasContent}
              className="flex items-center gap-2"
            >
              <div className="h-2 w-2 rounded-full bg-indigo-500" />
              <div>
                <div className="font-medium">Ajouter des détails</div>
                <div className="text-xs text-muted-foreground">Enrichir le contenu</div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Error indicator */}
      {errorCount > 0 && (
        <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded border border-red-200 dark:border-red-800">
          <AlertCircle className="h-3 w-3" />
          <span>{errorCount} erreur{errorCount > 1 ? 's' : ''} détectée{errorCount > 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Content indicator */}
      {!hasContent && (
        <div className="text-xs text-muted-foreground italic">
          Tapez du texte pour activer l'assistance IA
        </div>
      )}
    </div>
  );
}