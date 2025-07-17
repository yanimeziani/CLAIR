'use client';

import { cn } from '@/lib/utils';

interface RichTextDisplayProps {
  content: string;
  className?: string;
}

export function RichTextDisplay({ content, className }: RichTextDisplayProps) {
  return (
    <div 
      className={cn(
        'prose max-w-none prose-sm prose-slate dark:prose-invert',
        'prose-headings:text-foreground prose-p:text-foreground prose-p:leading-relaxed',
        'prose-strong:text-foreground prose-em:text-foreground',
        'prose-code:text-foreground prose-pre:bg-muted prose-pre:border prose-pre:rounded',
        'prose-blockquote:text-muted-foreground prose-blockquote:border-border prose-blockquote:bg-muted/20 prose-blockquote:rounded',
        'prose-table:text-foreground prose-th:border-border prose-td:border-border prose-th:bg-muted/50',
        'prose-li:text-foreground prose-ul:text-foreground prose-ol:text-foreground',
        'prose-a:text-primary prose-a:underline hover:prose-a:text-primary/80',
        'prose-img:rounded-lg prose-img:border prose-img:shadow-sm',
        '[&_.highlight]:bg-yellow-200 [&_.highlight]:px-1 [&_.highlight]:rounded',
        '[&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6 [&_h1]:first:mt-0',
        '[&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:first:mt-0',
        '[&_h3]:text-base [&_h3]:font-medium [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:first:mt-0',
        '[&_p]:mb-3 [&_p]:last:mb-0',
        '[&_ul]:my-3 [&_ul]:pl-6',
        '[&_ol]:my-3 [&_ol]:pl-6',
        '[&_li]:mb-1',
        '[&_blockquote]:my-4 [&_blockquote]:px-4 [&_blockquote]:py-2',
        '[&_table]:my-4 [&_table]:w-full [&_table]:border-collapse',
        '[&_th]:p-2 [&_th]:text-left [&_th]:font-medium',
        '[&_td]:p-2',
        '[&_img]:my-4 [&_img]:max-w-full [&_img]:h-auto',
        '[&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm',
        '[&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:text-sm',
        className
      )}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}