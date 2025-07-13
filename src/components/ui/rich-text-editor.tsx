'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { 
  Bold, 
  Italic, 
  Underline,
  List, 
  ListOrdered, 
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Unlink,
  Table as TableIcon,
  Image as ImageIcon,
  Sparkles,
  FileText,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { AISuggestionModal } from './ai-suggestion-modal';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
}

export function RichTextEditor({ 
  content, 
  onChange, 
  placeholder = 'Commencez à taper...', 
  editable = true,
  className 
}: RichTextEditorProps) {
  const [isCorrectingText, setIsCorrectingText] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [suggestion, setSuggestion] = useState<any>(null);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline hover:text-primary/80',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const addLink = useCallback(() => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    
    const url = window.prompt('URL de l\'image');

    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const addTable = useCallback(() => {
    if (!editor) return;
    
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  const correctText = useCallback(async () => {
    if (!editor || !content.trim()) {
      toast.error('Aucun contenu à corriger');
      return;
    }

    setIsCorrectingText(true);
    try {
      const textContent = editor.getText();
      
      const response = await fetch('/api/ai/correct-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textContent })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la correction');
      }

      const data = await response.json();
      
      if (data.success && data.corrected_text) {
        // Show suggestion modal instead of directly applying
        setSuggestion({
          type: 'correction',
          original_text: data.original_text,
          suggested_text: data.corrected_text,
          metadata: {
            has_changes: data.has_changes,
            model_used: data.model_used,
            suggestions: data.suggestions
          }
        });
        setShowSuggestionModal(true);
      } else {
        toast.error(data.error || 'Erreur lors de la correction du texte');
      }
    } catch (error) {
      console.error('Error correcting text:', error);
      toast.error('🚫 Service IA indisponible - Veuillez réessayer plus tard');
    } finally {
      setIsCorrectingText(false);
    }
  }, [editor, content]);

  const generateSummary = useCallback(async () => {
    if (!editor || !content.trim()) {
      toast.error('Aucun contenu à résumer');
      return;
    }

    setIsGeneratingSummary(true);
    try {
      const textContent = editor.getText();
      
      const response = await fetch('/api/ai/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textContent, context: 'healthcare', language: 'french' })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération du résumé');
      }

      const data = await response.json();
      
      if (data.success && data.summary) {
        // Show suggestion modal instead of directly applying
        setSuggestion({
          type: 'summary',
          original_text: data.original_text,
          suggested_text: data.summary,
          metadata: {
            word_count_original: data.word_count_original,
            word_count_summary: data.word_count_summary,
            compression_ratio: data.compression_ratio,
            model_used: data.model_used,
            context: data.context
          }
        });
        setShowSuggestionModal(true);
      } else {
        toast.error(data.error || 'Erreur lors de la génération du résumé');
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error('🚫 Service IA indisponible - Veuillez réessayer plus tard');
    } finally {
      setIsGeneratingSummary(false);
    }
  }, [editor, content]);

  const handleAcceptSuggestion = useCallback((suggestedText: string) => {
    if (!editor || !suggestion) return;

    if (suggestion.type === 'correction') {
      // Convert markdown to HTML and replace content
      const htmlContent = convertMarkdownToHtml(suggestedText);
      editor.chain().focus().setContent(htmlContent).run();
      toast.success('✨ Correction appliquée avec succès');
    } else if (suggestion.type === 'summary') {
      // Convert markdown summary to HTML and add at beginning
      const currentContent = editor.getHTML();
      const summaryHtml = convertMarkdownToHtml(suggestedText);
      const summaryContent = `<div class="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
        <p><strong>🤖 Résumé automatique généré par IA:</strong></p>
        <div class="mt-2">${summaryHtml}</div>
      </div>${currentContent}`;
      editor.chain().focus().setContent(summaryContent).run();
      toast.success('📝 Résumé ajouté avec succès');
    }
    
    setSuggestion(null);
  }, [editor, suggestion]);

  // Helper function to convert markdown to HTML
  const convertMarkdownToHtml = (markdown: string): string => {
    // Basic markdown conversion - could be enhanced with a proper markdown parser
    let html = markdown
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Headers
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      // Line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
    
    // Wrap in paragraphs if not already wrapped
    if (!html.startsWith('<h') && !html.startsWith('<p>')) {
      html = `<p>${html}</p>`;
    }
    
    return html;
  };

  const handleRejectSuggestion = useCallback(() => {
    setSuggestion(null);
    toast.info('Suggestion ignorée');
  }, []);

  if (!editor) {
    return null;
  }

  return (
    <div className={cn('border border-border rounded-md', className)}>
      {editable && (
        <div className="border-b border-border p-2 flex flex-wrap gap-1 bg-muted/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={cn(
              'h-8 w-8 p-0',
              editor.isActive('bold') && 'bg-accent'
            )}
          >
            <Bold className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={cn(
              'h-8 w-8 p-0',
              editor.isActive('italic') && 'bg-accent'
            )}
          >
            <Italic className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            className={cn(
              'h-8 w-8 p-0',
              editor.isActive('strike') && 'bg-accent'
            )}
          >
            <Underline className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(
              'h-8 w-8 p-0',
              editor.isActive('bulletList') && 'bg-accent'
            )}
          >
            <List className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn(
              'h-8 w-8 p-0',
              editor.isActive('orderedList') && 'bg-accent'
            )}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={cn(
              'h-8 w-8 p-0',
              editor.isActive('blockquote') && 'bg-accent'
            )}
          >
            <Quote className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={addLink}
            className={cn(
              'h-8 w-8 p-0',
              editor.isActive('link') && 'bg-accent'
            )}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().unsetLink().run()}
            disabled={!editor.isActive('link')}
            className="h-8 w-8 p-0"
          >
            <Unlink className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={addImage}
            className="h-8 w-8 p-0"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={addTable}
            className="h-8 w-8 p-0"
          >
            <TableIcon className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          {/* AI Functions - Made Prominent */}
          <div className="flex gap-1 p-1 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-md border border-blue-200/50 dark:border-blue-800/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={correctText}
              disabled={isCorrectingText}
              className={cn(
                "h-8 w-auto px-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-sm",
                isCorrectingText && "opacity-75"
              )}
              title="✨ Correction automatique par IA"
            >
              {isCorrectingText ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-xs font-medium">Correction...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-xs font-medium">Corriger IA</span>
                </div>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={generateSummary}
              disabled={isGeneratingSummary}
              className={cn(
                "h-8 w-auto px-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-sm",
                isGeneratingSummary && "opacity-75"
              )}
              title="📝 Générer un résumé automatique"
            >
              {isGeneratingSummary ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-xs font-medium">Résumé...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-xs font-medium">Résumé IA</span>
                </div>
              )}
            </Button>
          </div>

          <div className="w-px h-6 bg-border mx-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            className="h-8 w-8 p-0"
          >
            <Undo className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            className="h-8 w-8 p-0"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <EditorContent 
        editor={editor} 
        className={cn(
          'prose max-w-none p-4 focus:outline-none min-h-[200px] resize-none overflow-auto',
          !editable && 'bg-muted/20',
          'prose-sm prose-slate dark:prose-invert',
          'prose-headings:text-foreground prose-p:text-foreground',
          'prose-strong:text-foreground prose-em:text-foreground',
          'prose-code:text-foreground prose-pre:bg-muted',
          'prose-blockquote:text-muted-foreground prose-blockquote:border-border',
          'prose-table:text-foreground prose-th:border-border prose-td:border-border',
          'prose-li:text-foreground prose-ul:text-foreground prose-ol:text-foreground',
          '[&_.ProseMirror]:min-h-[200px] [&_.ProseMirror]:outline-none [&_.ProseMirror]:p-4',
          '[&_.ProseMirror]:whitespace-pre-wrap [&_.ProseMirror]:break-words'
        )}
      />
      
      {/* AI Suggestion Modal */}
      <AISuggestionModal
        isOpen={showSuggestionModal}
        onClose={() => setShowSuggestionModal(false)}
        suggestion={suggestion}
        onAccept={handleAcceptSuggestion}
        onReject={handleRejectSuggestion}
      />
    </div>
  );
}