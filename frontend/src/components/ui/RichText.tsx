import { parseMentions, MENTION_CHIP_STYLES } from '@/utils/mentions';

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
              className={MENTION_CHIP_STYLES}
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
