import { useState, useCallback, useEffect } from 'react';
import { EmailBlock, DevicePreview, BlockType } from '@/types/email';
import { defaultTemplates } from '@/data/templates';

const AUTOSAVE_KEY = 'mailcraft-autosave';

let idCounter = 1000;
const genId = () => `block-${++idCounter}`;

function loadAutosave(): EmailBlock[] | null {
  try {
    const saved = localStorage.getItem(AUTOSAVE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return null;
}

const defaultBlockContent: Record<BlockType, () => EmailBlock> = {
  heading: () => ({ id: genId(), type: 'heading', content: { text: 'Heading' }, styles: { fontSize: '24px', color: '#111827', fontWeight: '700' } }),
  text: () => ({ id: genId(), type: 'text', content: { text: 'Enter your text here...' }, styles: { fontSize: '16px', color: '#374151', lineHeight: '1.6' } }),
  image: () => ({ id: genId(), type: 'image', content: { src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=250&fit=crop', alt: 'Image description' }, styles: { width: '100%', borderRadius: '4px' } }),
  button: () => ({ id: genId(), type: 'button', content: { text: 'Click Here', url: '#' }, styles: { backgroundColor: '#4F46E5', color: '#FFFFFF', padding: '12px 24px', borderRadius: '6px', fontSize: '16px', fontWeight: '600' } }),
  divider: () => ({ id: genId(), type: 'divider', content: {}, styles: { borderColor: '#E5E7EB', margin: '24px 0' } }),
  spacer: () => ({ id: genId(), type: 'spacer', content: {}, styles: { height: '24px' } }),
  columns: () => ({ id: genId(), type: 'columns', content: { left: 'Left column content', right: 'Right column content' }, styles: { gap: '16px' } }),
};

export function useEmailEditor() {
  const initialBlocks = loadAutosave() || defaultTemplates[0].blocks;
  const [blocks, setBlocks] = useState<EmailBlock[]>(initialBlocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [device, setDevice] = useState<DevicePreview>('desktop');
  const [history, setHistory] = useState<EmailBlock[][]>([initialBlocks]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Autosave on every block change
  useEffect(() => {
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(blocks));
  }, [blocks]);

  const pushHistory = useCallback((newBlocks: EmailBlock[]) => {
    setHistory(prev => {
      const trimmed = prev.slice(0, historyIndex + 1);
      return [...trimmed, newBlocks];
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const selectedBlock = blocks.find(b => b.id === selectedBlockId) || null;

  const addBlock = useCallback((type: BlockType, index?: number) => {
    const newBlock = defaultBlockContent[type]();
    setBlocks(prev => {
      const next = index !== undefined ? [...prev.slice(0, index), newBlock, ...prev.slice(index)] : [...prev, newBlock];
      pushHistory(next);
      return next;
    });
    setSelectedBlockId(newBlock.id);
  }, [pushHistory]);

  const updateBlock = useCallback((id: string, updates: Partial<EmailBlock>) => {
    setBlocks(prev => {
      const next = prev.map(b => b.id === id ? { ...b, ...updates, content: { ...b.content, ...updates.content }, styles: { ...b.styles, ...updates.styles } } : b);
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  const removeBlock = useCallback((id: string) => {
    setBlocks(prev => {
      const next = prev.filter(b => b.id !== id);
      pushHistory(next);
      return next;
    });
    if (selectedBlockId === id) setSelectedBlockId(null);
  }, [selectedBlockId, pushHistory]);

  const moveBlock = useCallback((fromIndex: number, toIndex: number) => {
    setBlocks(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  const duplicateBlock = useCallback((id: string) => {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id);
      if (idx === -1) return prev;
      const clone = { ...prev[idx], id: genId(), content: { ...prev[idx].content }, styles: { ...prev[idx].styles } };
      const next = [...prev.slice(0, idx + 1), clone, ...prev.slice(idx + 1)];
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  const loadTemplate = useCallback((template: typeof defaultTemplates[0]) => {
    setBlocks(template.blocks);
    setSelectedBlockId(null);
    pushHistory(template.blocks);
  }, [pushHistory]);

  const loadBlocks = useCallback((newBlocks: EmailBlock[]) => {
    setBlocks(newBlocks);
    setSelectedBlockId(null);
    pushHistory(newBlocks);
  }, [pushHistory]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      setBlocks(history[newIdx]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      setBlocks(history[newIdx]);
    }
  }, [history, historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const exportHTML = useCallback(() => {
    const renderBlock = (b: EmailBlock): string => {
      const s = (key: string) => b.styles[key] || '';
      switch (b.type) {
        case 'heading':
          return `<h1 style="font-size:${s('fontSize')};color:${s('color')};text-align:${s('textAlign') || 'left'};font-weight:${s('fontWeight')};margin:0;">${b.content.text}</h1>`;
        case 'text':
          return `<p style="font-size:${s('fontSize')};color:${s('color')};line-height:${s('lineHeight')};text-align:${s('textAlign') || 'left'};margin:0;">${b.content.text?.replace(/\n/g, '<br>')}</p>`;
        case 'image':
          return `<img src="${b.content.src}" alt="${b.content.alt || ''}" style="width:${s('width')};border-radius:${s('borderRadius')};display:block;max-width:100%;" />`;
        case 'button':
          return `<table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;"><tr><td style="background-color:${s('backgroundColor')};border-radius:${s('borderRadius')};padding:${s('padding')};"><a href="${b.content.url || '#'}" style="color:${s('color')};font-size:${s('fontSize')};font-weight:${s('fontWeight')};text-decoration:none;display:inline-block;">${b.content.text}</a></td></tr></table>`;
        case 'divider':
          return `<hr style="border:none;border-top:1px solid ${s('borderColor')};margin:${s('margin')};" />`;
        case 'spacer':
          return `<div style="height:${s('height')};"></div>`;
        case 'columns':
          return `<table width="100%" cellpadding="0" cellspacing="0"><tr><td width="50%" style="padding-right:${parseInt(s('gap') || '16') / 2}px;vertical-align:top;">${b.content.left || ''}</td><td width="50%" style="padding-left:${parseInt(s('gap') || '16') / 2}px;vertical-align:top;">${b.content.right || ''}</td></tr></table>`;
        default:
          return '';
      }
    };

    const body = blocks.map(renderBlock).join('\n');
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Email</title></head><body style="margin:0;padding:0;background-color:#f9fafb;font-family:Arial,Helvetica,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:40px 20px;"><table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border-radius:8px;"><tr><td style="padding:40px;">${body}</td></tr></table></td></tr></table></body></html>`;
  }, [blocks]);

  return {
    blocks, selectedBlock, selectedBlockId, device, canUndo, canRedo,
    setSelectedBlockId, setDevice, addBlock, updateBlock, removeBlock,
    moveBlock, duplicateBlock, loadTemplate, loadBlocks, undo, redo, exportHTML,
  };
}
