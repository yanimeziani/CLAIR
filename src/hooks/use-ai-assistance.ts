'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface AISuggestion {
  type: 'correction' | 'summary' | 'enhancement';
  original_text: string;
  suggested_text: string;
  metadata?: {
    has_changes?: boolean;
    word_count_original?: number;
    word_count_summary?: number;
    compression_ratio?: number;
    model_used?: string;
    confidence_score?: number;
    suggestions?: {
      grammar_improvements?: boolean;
      style_improvements?: boolean;
      medical_terminology?: boolean;
      tone_adjustment?: boolean;
    };
    errors_found?: Array<{
      type: 'grammar' | 'spelling' | 'style';
      message: string;
      start: number;
      end: number;
    }>;
  };
}

export interface UseAIAssistanceOptions {
  context?: 'healthcare' | 'general' | 'administrative';
  language?: 'french' | 'english';
  autoCorrect?: boolean;
  enableSuggestions?: boolean;
}

export function useAIAssistance(options: UseAIAssistanceOptions = {}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState<AISuggestion | null>(null);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [realtimeErrors, setRealtimeErrors] = useState<Array<{
    type: 'grammar' | 'spelling' | 'style';
    message: string;
    start: number;
    end: number;
  }>>([]);

  const {
    context = 'healthcare',
    language = 'french',
    autoCorrect = false,
    enableSuggestions = true
  } = options;

  // Real-time text analysis for Grammarly-like underlines
  const analyzeText = useCallback(async (text: string): Promise<Array<{
    type: 'grammar' | 'spelling' | 'style';
    message: string;
    start: number;
    end: number;
  }>> => {
    if (!text.trim() || !enableSuggestions) return [];

    try {
      const response = await fetch('/api/ai/analyze-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text, 
          context, 
          language,
          analysis_type: 'realtime'
        })
      });

      if (!response.ok) return [];

      const data = await response.json();
      return data.errors || [];
    } catch (error) {
      console.error('Real-time analysis error:', error);
      return [];
    }
  }, [context, language, enableSuggestions]);

  // Debounced real-time analysis
  const analyzeTextRealtime = useCallback(
    debounce(async (text: string) => {
      const errors = await analyzeText(text);
      setRealtimeErrors(errors);
    }, 1000),
    [analyzeText]
  );

  // Grammar and style correction
  const correctText = useCallback(async (text: string): Promise<boolean> => {
    if (!text.trim()) {
      toast.error('Aucun contenu à corriger');
      return false;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/ai/correct-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text, 
          context, 
          language,
          auto_apply: autoCorrect
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la correction');
      }

      const data = await response.json();
      
      if (data.success && data.corrected_text) {
        const suggestion: AISuggestion = {
          type: 'correction',
          original_text: data.original_text,
          suggested_text: data.corrected_text,
          metadata: {
            has_changes: data.has_changes,
            model_used: data.model_used,
            confidence_score: data.confidence_score,
            suggestions: data.suggestions,
            errors_found: data.errors_found
          }
        };

        if (autoCorrect && data.has_changes) {
          // Apply corrections automatically for minor changes
          if (data.confidence_score > 0.8) {
            return true; // Signal to apply changes
          }
        }

        setCurrentSuggestion(suggestion);
        setShowSuggestionModal(true);
        return false; // User needs to review
      } else {
        toast.error(data.error || 'Erreur lors de la correction du texte');
        return false;
      }
    } catch (error) {
      console.error('Error correcting text:', error);
      toast.error('🚫 Service IA indisponible - Veuillez réessayer plus tard');
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [context, language, autoCorrect]);

  // Text summarization
  const summarizeText = useCallback(async (text: string): Promise<boolean> => {
    if (!text.trim()) {
      toast.error('Aucun contenu à résumer');
      return false;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/ai/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text, 
          context, 
          language,
          summary_type: 'professional'
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération du résumé');
      }

      const data = await response.json();
      
      if (data.success && data.summary) {
        const suggestion: AISuggestion = {
          type: 'summary',
          original_text: data.original_text,
          suggested_text: data.summary,
          metadata: {
            word_count_original: data.word_count_original,
            word_count_summary: data.word_count_summary,
            compression_ratio: data.compression_ratio,
            model_used: data.model_used,
            confidence_score: data.confidence_score
          }
        };

        setCurrentSuggestion(suggestion);
        setShowSuggestionModal(true);
        return false;
      } else {
        toast.error(data.error || 'Erreur lors de la génération du résumé');
        return false;
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error('🚫 Service IA indisponible - Veuillez réessayer plus tard');
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [context, language]);

  // Enhanced text improvement
  const enhanceText = useCallback(async (text: string, enhancementType: 'professional' | 'concise' | 'detailed' = 'professional'): Promise<boolean> => {
    if (!text.trim()) {
      toast.error('Aucun contenu à améliorer');
      return false;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/ai/enhance-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text, 
          context, 
          language,
          enhancement_type: enhancementType
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'amélioration');
      }

      const data = await response.json();
      
      if (data.success && data.enhanced_text) {
        const suggestion: AISuggestion = {
          type: 'enhancement',
          original_text: data.original_text,
          suggested_text: data.enhanced_text,
          metadata: {
            model_used: data.model_used,
            confidence_score: data.confidence_score,
            suggestions: {
              style_improvements: true,
              tone_adjustment: enhancementType === 'professional',
              medical_terminology: context === 'healthcare'
            }
          }
        };

        setCurrentSuggestion(suggestion);
        setShowSuggestionModal(true);
        return false;
      } else {
        toast.error(data.error || 'Erreur lors de l\'amélioration du texte');
        return false;
      }
    } catch (error) {
      console.error('Error enhancing text:', error);
      toast.error('🚫 Service IA indisponible - Veuillez réessayer plus tard');
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [context, language]);

  // Accept suggestion
  const acceptSuggestion = useCallback(() => {
    if (!currentSuggestion) return null;
    
    const acceptedText = currentSuggestion.suggested_text;
    setCurrentSuggestion(null);
    setShowSuggestionModal(false);
    
    toast.success(`✨ ${
      currentSuggestion.type === 'correction' ? 'Correction' :
      currentSuggestion.type === 'summary' ? 'Résumé' : 'Amélioration'
    } appliquée avec succès`);
    
    return acceptedText;
  }, [currentSuggestion]);

  // Reject suggestion
  const rejectSuggestion = useCallback(() => {
    setCurrentSuggestion(null);
    setShowSuggestionModal(false);
    toast.info('Suggestion ignorée');
  }, []);

  // Clear real-time errors
  const clearErrors = useCallback(() => {
    setRealtimeErrors([]);
  }, []);

  return {
    // State
    isProcessing,
    currentSuggestion,
    showSuggestionModal,
    realtimeErrors,
    
    // Actions
    correctText,
    summarizeText,
    enhanceText,
    analyzeTextRealtime,
    acceptSuggestion,
    rejectSuggestion,
    clearErrors,
    
    // UI Controls
    setShowSuggestionModal
  };
}

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}