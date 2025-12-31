import { parseMentions } from '@/utils/mentions';

interface RichTextProps {
  content: string;
  className?: string;
}

export function RichText({ content, className = '' }: RichTextProps) {
  const parts = parseMentions(content);

  return (
    <div className={`whitespace-pre-wrap break-words ${className}`}>
      {parts.map((part, index) => {
        if (part.type === 'mention') {
          return (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-0.5 mx-0.5 bg-primary-100 text-primary-700 rounded-md text-sm font-medium"
            >
              @{part.displayName}
            </span>
          );
        }
        return <span key={index}>{part.content}</span>;
      })}
    </div>
  );
}
