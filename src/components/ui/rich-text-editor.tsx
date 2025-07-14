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
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCallback } from 'react';
import { useAIAssistance, UseAIAssistanceOptions } from '@/hooks/use-ai-assistance';
import { AIAssistanceToolbar } from './ai-assistance-toolbar';
import { AISuggestionModal } from './ai-suggestion-modal';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
  aiOptions?: UseAIAssistanceOptions;
  showAIToolbar?: boolean;
}

export function RichTextEditor({ 
  content, 
  onChange, 
  placeholder = 'Commencez à taper...', 
  editable = true,
  className,
  aiOptions = { context: 'healthcare', language: 'french' },
  showAIToolbar = true
}: RichTextEditorProps) {
  const {
    isProcessing,
    currentSuggestion,
    showSuggestionModal,
    realtimeErrors,
    correctText,
    summarizeText,
    enhanceText,
    acceptSuggestion,
    rejectSuggestion,
    setShowSuggestionModal
  } = useAIAssistance(aiOptions);
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

  const handleCorrection = useCallback(async () => {
    if (!editor) return;
    const textContent = editor.getText();
    await correctText(textContent);
  }, [editor, correctText]);

  const handleSummary = useCallback(async () => {
    if (!editor) return;
    const textContent = editor.getText();
    await summarizeText(textContent);
  }, [editor, summarizeText]);

  const handleEnhancement = useCallback(async (type: 'professional' | 'concise' | 'detailed' = 'professional') => {
    if (!editor) return;
    const textContent = editor.getText();
    await enhanceText(textContent, type);
  }, [editor, enhanceText]);

  const handleAcceptSuggestion = useCallback(() => {
    const suggestedText = acceptSuggestion();
    if (!editor || !suggestedText || !currentSuggestion) return;

    if (currentSuggestion.type === 'correction' || currentSuggestion.type === 'enhancement') {
      // Convert markdown to HTML and replace content
      const htmlContent = convertMarkdownToHtml(suggestedText);
      editor.chain().focus().setContent(htmlContent).run();
    } else if (currentSuggestion.type === 'summary') {
      // Convert markdown summary to HTML and add at beginning
      const currentContent = editor.getHTML();
      const summaryHtml = convertMarkdownToHtml(suggestedText);
      const summaryContent = `<div class="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
        <p><strong>🤖 Résumé automatique généré par IA:</strong></p>
        <div class="mt-2">${summaryHtml}</div>
      </div>${currentContent}`;
      editor.chain().focus().setContent(summaryContent).run();
    }
  }, [editor, acceptSuggestion, currentSuggestion]);

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


  if (!editor) {
    return null;
  }

  return (
    <div className={cn('border border-border rounded-md', className)}>
      {editable && showAIToolbar && (
        <AIAssistanceToolbar
          onCorrect={handleCorrection}
          onSummarize={handleSummary}
          onEnhance={handleEnhancement}
          isProcessing={isProcessing}
          hasContent={!!content.trim()}
          errorCount={realtimeErrors?.length || 0}
          variant="compact"
        />
      )}
      
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
        suggestion={currentSuggestion}
        onAccept={handleAcceptSuggestion}
        onReject={rejectSuggestion}
      />
    </div>
  );
}