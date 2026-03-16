import { EmailBlock } from '@/types/email';

interface Props {
  block: EmailBlock;
}

export function EmailBlockRenderer({ block }: Props) {
  const { type, content, styles } = block;

  switch (type) {
    case 'heading':
      return <h1 style={{ fontSize: styles.fontSize, color: styles.color, textAlign: (styles.textAlign as React.CSSProperties['textAlign']) || 'left', fontWeight: styles.fontWeight, margin: 0 }}>{content.text}</h1>;

    case 'text':
      return (
        <p style={{ fontSize: styles.fontSize, color: styles.color, lineHeight: styles.lineHeight, textAlign: (styles.textAlign as React.CSSProperties['textAlign']) || 'left', margin: 0, whiteSpace: 'pre-wrap' }}>
          {content.text}
        </p>
      );

    case 'image':
      return <img src={content.src} alt={content.alt || ''} style={{ width: styles.width, borderRadius: styles.borderRadius, display: 'block', maxWidth: '100%' }} />;

    case 'button':
      return (
        <div style={{ textAlign: 'center' }}>
          <a
            href={content.url || '#'}
            onClick={e => e.preventDefault()}
            style={{ display: 'inline-block', backgroundColor: styles.backgroundColor, color: styles.color, padding: styles.padding, borderRadius: styles.borderRadius, fontSize: styles.fontSize, fontWeight: styles.fontWeight, textDecoration: 'none', cursor: 'pointer' }}
          >
            {content.text}
          </a>
        </div>
      );

    case 'divider':
      return <hr style={{ border: 'none', borderTop: `1px solid ${styles.borderColor}`, margin: styles.margin }} />;

    case 'spacer':
      return <div style={{ height: styles.height }} />;

    case 'columns':
      return (
        <div style={{ display: 'flex', gap: styles.gap }}>
          <div style={{ flex: 1, fontSize: '14px', color: '#374151' }}>{content.left}</div>
          <div style={{ flex: 1, fontSize: '14px', color: '#374151' }}>{content.right}</div>
        </div>
      );

    default:
      return null;
  }
}
