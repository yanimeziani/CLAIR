'use client';

import { cn } from '@/lib/utils';

interface HtmlContentProps {
  content: string;
  className?: string;
}

export function HtmlContent({ content, className }: HtmlContentProps) {
  // Determine if content is already HTML or needs markdown conversion
  const isHtml = content.includes('<') && content.includes('>');
  
  // Convert markdown-like content to HTML if needed
  const convertMarkdownToHtml = (text: string): string => {
    let html = text
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic  
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Headers
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mb-2">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mb-3">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
      // Line breaks
      .replace(/\n\n/g, '</p><p class="mb-2">')
      .replace(/\n/g, '<br>');
    
    // Wrap in paragraphs if not already wrapped and not empty
    if (html.trim() && !html.startsWith('<h') && !html.startsWith('<p>') && !html.startsWith('<div')) {
      html = `<p class="mb-2">${html}</p>`;
    }
    
    return html;
  };

  const htmlContent = isHtml ? content : convertMarkdownToHtml(content);

  return (
    <div 
      className={cn(
        'prose prose-sm max-w-none dark:prose-invert',
        'prose-headings:text-foreground prose-p:text-foreground prose-p:leading-relaxed',
        'prose-strong:text-foreground prose-em:text-foreground',
        'prose-code:text-foreground prose-pre:bg-muted',
        'prose-blockquote:text-muted-foreground prose-blockquote:border-border',
        'prose-table:text-foreground prose-th:border-border prose-td:border-border',
        'prose-li:text-foreground prose-ul:text-foreground prose-ol:text-foreground',
        'prose-a:text-primary prose-a:hover:text-primary/80',
        // Support for TipTap extensions
        '[&_.highlight]:px-1 [&_.highlight]:rounded',
        '[&_mark]:px-1 [&_mark]:rounded [&_mark]:bg-yellow-200 [&_mark]:dark:bg-yellow-900/30',
        // Preserve inline styles for colors and backgrounds
        '[&_*[style*="color"]]:opacity-100',
        '[&_*[style*="background-color"]]:opacity-100',
        // Table styling
        'prose-table:border-collapse prose-table:border prose-table:border-border',
        'prose-th:bg-muted prose-th:font-medium prose-th:p-2',
        'prose-td:p-2 prose-td:border-border',
        // Image styling
        'prose-img:rounded-lg prose-img:shadow-sm prose-img:max-w-full',
        // List styling
        '[&>ul]:list-disc [&>ol]:list-decimal',
        '[&>ul]:ml-6 [&>ol]:ml-6',
        // Spacing
        '[&>p]:mb-2 [&>p:last-child]:mb-0',
        '[&>h1]:mb-4 [&>h2]:mb-3 [&>h3]:mb-2',
        '[&>ul]:mb-3 [&>ol]:mb-3',
        '[&>blockquote]:mb-3 [&>table]:mb-3',
        className
      )}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}