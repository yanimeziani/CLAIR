'use client';

import React, { useRef, useEffect, useState, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { useAIAssistance, UseAIAssistanceOptions } from '@/hooks/use-ai-assistance';
import { AIAssistanceToolbar } from './ai-assistance-toolbar';
import { AISuggestionModal } from './ai-suggestion-modal';
import { Textarea } from './textarea';

interface AIEnhancedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  aiOptions?: UseAIAssistanceOptions;
  showToolbar?: boolean;
  showRealtimeErrors?: boolean;
  onAICorrection?: (correctedText: string) => void;
}

export const AIEnhancedTextarea = forwardRef<HTMLTextAreaElement, AIEnhancedTextareaProps>(
  ({ 
    className, 
    value, 
    onChange, 
    aiOptions = {}, 
    showToolbar = true,
    showRealtimeErrors = true,
    onAICorrection,
    ...props 
  }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [internalValue, setInternalValue] = useState(value || '');
    const [errorHighlights, setErrorHighlights] = useState<Array<{start: number, end: number, type: string}>>([]);

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

    // Update error highlights when errors change
    useEffect(() => {
      if (realtimeErrors) {
        const highlights = realtimeErrors.map(error => ({
          start: error.start,
          end: error.end,
          type: error.type
        }));
        setErrorHighlights(highlights);
      }
    }, [realtimeErrors]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);
      onChange?.(e);
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
        } as React.ChangeEvent<HTMLTextAreaElement>;
        onChange?.(syntheticEvent);
      }
    };

    // Create highlighted overlay for grammar errors
    const renderErrorOverlay = () => {
      if (!showRealtimeErrors || errorHighlights.length === 0) return null;

      return (
        <div 
          className="absolute inset-0 pointer-events-none overflow-hidden whitespace-pre-wrap break-words p-3 text-transparent"
          style={{
            font: 'inherit',
            fontSize: 'inherit',
            lineHeight: 'inherit',
            letterSpacing: 'inherit',
            wordSpacing: 'inherit',
            textIndent: 'inherit'
          }}
        >
          {renderHighlightedText(internalValue, errorHighlights)}
        </div>
      );
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
          />
        )}
        
        <div className="relative">
          <Textarea
            ref={ref || textareaRef}
            className={cn(
              'relative z-10 bg-transparent',
              showRealtimeErrors && errorHighlights.length > 0 && 'bg-red-50/20',
              className
            )}
            value={internalValue}
            onChange={handleChange}
            {...props}
          />
          
          {renderErrorOverlay()}
        </div>

        {/* Error indicator */}
        {showRealtimeErrors && realtimeErrors && realtimeErrors.length > 0 && (
          <div className="absolute top-1 right-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs px-2 py-1 rounded-full border border-red-200 dark:border-red-800">
            {realtimeErrors.length} erreur{realtimeErrors.length > 1 ? 's' : ''}
          </div>
        )}

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

AIEnhancedTextarea.displayName = 'AIEnhancedTextarea';

// Helper function to render highlighted text with error underlines
function renderHighlightedText(text: string, highlights: Array<{start: number, end: number, type: string}>) {
  if (highlights.length === 0) return text;

  const parts: Array<{ text: string; isError: boolean; type?: string }> = [];
  let lastIndex = 0;

  // Sort highlights by start position
  const sortedHighlights = highlights.sort((a, b) => a.start - b.start);

  sortedHighlights.forEach(highlight => {
    // Add text before highlight
    if (highlight.start > lastIndex) {
      parts.push({
        text: text.slice(lastIndex, highlight.start),
        isError: false
      });
    }

    // Add highlighted text
    parts.push({
      text: text.slice(highlight.start, highlight.end),
      isError: true,
      type: highlight.type
    });

    lastIndex = highlight.end;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      text: text.slice(lastIndex),
      isError: false
    });
  }

  return (
    <>
      {parts.map((part, index) => (
        <span
          key={index}
          className={part.isError ? cn(
            'relative',
            part.type === 'grammar' && 'border-b-2 border-red-400 border-dotted',
            part.type === 'spelling' && 'border-b-2 border-blue-400 border-wavy',
            part.type === 'style' && 'border-b-2 border-yellow-400 border-dashed'
          ) : ''}
        >
          {part.text}
        </span>
      ))}
    </>
  );
}