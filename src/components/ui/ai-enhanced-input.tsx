'use client';

import React, { forwardRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAIAssistance, UseAIAssistanceOptions } from '@/hooks/use-ai-assistance';
import { AIAssistanceToolbar } from './ai-assistance-toolbar';
import { AISuggestionModal } from './ai-suggestion-modal';
import { Input } from './input';
import { Sparkles, AlertCircle } from 'lucide-react';
import { Button } from './button';

interface AIEnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  aiOptions?: UseAIAssistanceOptions;
  showQuickCorrect?: boolean;
  showRealtimeErrors?: boolean;
  showToolbar?: boolean;
  onAICorrection?: (correctedText: string) => void;
}

export const AIEnhancedInput = forwardRef<HTMLInputElement, AIEnhancedInputProps>(
  ({ 
    className, 
    value, 
    onChange, 
    aiOptions = { context: 'healthcare', language: 'french' }, 
    showQuickCorrect = true,
    showRealtimeErrors = true,
    showToolbar = false,
    onAICorrection,
    ...props 
  }, ref) => {
    const [internalValue, setInternalValue] = useState(value || '');
    const [hasErrors, setHasErrors] = useState(false);

    const {
      isProcessing,
      currentSuggestion,
      showSuggestionModal,
      realtimeErrors,
      correctText,
      summarizeText,
      enhanceText,
      analyzeTextRealtime,
      acceptSuggestion,
      rejectSuggestion,
      setShowSuggestionModal
    } = useAIAssistance(aiOptions);

    // Sync internal value with external value
    useEffect(() => {
      setInternalValue(value as string || '');
    }, [value]);

    // Analyze text for real-time errors
    useEffect(() => {
      if (showRealtimeErrors && internalValue) {
        analyzeTextRealtime(internalValue);
      }
    }, [internalValue, analyzeTextRealtime, showRealtimeErrors]);

    // Update error state when errors change
    useEffect(() => {
      setHasErrors(realtimeErrors && realtimeErrors.length > 0);
    }, [realtimeErrors]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);
      onChange?.(e);
    };

    const handleQuickCorrect = async () => {
      await correctText(internalValue);
    };

    const handleCorrection = async () => {
      await correctText(internalValue);
    };

    const handleSummary = async () => {
      await summarizeText(internalValue);
    };

    const handleEnhancement = async (type: 'professional' | 'concise' | 'detailed' = 'professional') => {
      await enhanceText(internalValue, type);
    };

    const handleAcceptSuggestion = () => {
      const correctedText = acceptSuggestion();
      if (correctedText) {
        setInternalValue(correctedText);
        onAICorrection?.(correctedText);
        
        // Trigger onChange event
        const syntheticEvent = {
          target: { value: correctedText },
          currentTarget: { value: correctedText }
        } as React.ChangeEvent<HTMLInputElement>;
        onChange?.(syntheticEvent);
      }
    };

    return (
      <div className="relative">
        {showToolbar && (
          <AIAssistanceToolbar
            onCorrect={handleCorrection}
            onSummarize={handleSummary}
            onEnhance={handleEnhancement}
            isProcessing={isProcessing}
            hasContent={!!internalValue.trim()}
            errorCount={realtimeErrors?.length || 0}
            variant="compact"
          />
        )}
        
        <div className="relative flex items-center">
          <Input
            ref={ref}
            className={cn(
              'pr-20',
              showRealtimeErrors && hasErrors && 'border-red-300 dark:border-red-700 bg-red-50/20 dark:bg-red-950/20',
              showQuickCorrect && 'pr-24',
              className
            )}
            value={internalValue}
            onChange={handleChange}
            {...props}
          />
          
          {/* Quick actions in input */}
          <div className="absolute right-2 flex items-center gap-1">
            {/* Error indicator */}
            {showRealtimeErrors && hasErrors && (
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-500" title={`${realtimeErrors?.length} erreur(s) détectée(s)`} />
              </div>
            )}

            {/* Quick correct button */}
            {showQuickCorrect && internalValue.trim() && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleQuickCorrect}
                disabled={isProcessing}
                className={cn(
                  "h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/50",
                  hasErrors && "text-blue-600 dark:text-blue-400"
                )}
                title="Correction rapide IA"
              >
                <Sparkles className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        <AISuggestionModal
          isOpen={showSuggestionModal}
          onClose={() => setShowSuggestionModal(false)}
          suggestion={currentSuggestion}
          onAccept={handleAcceptSuggestion}
          onReject={rejectSuggestion}
        />
      </div>
    );
  }
);

AIEnhancedInput.displayName = 'AIEnhancedInput';