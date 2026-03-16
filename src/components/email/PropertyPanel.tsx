import { EmailBlock } from '@/types/email';
import { Trash2, Copy, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRef } from 'react';

interface PropertyPanelProps {
  block: EmailBlock | null;
  onUpdate: (id: string, updates: Partial<EmailBlock>) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDeselect: () => void;
}

export function PropertyPanel({ block, onUpdate, onRemove, onDuplicate, onDeselect }: PropertyPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!block) {
    return (
      <aside className="w-64 bg-card border-l border-border p-4 shrink-0 flex items-center justify-center">
        <p className="text-sm text-muted-foreground font-body text-center">Select a block to edit its properties</p>
      </aside>
    );
  }

  const updateContent = (key: string, value: string) => {
    onUpdate(block.id, { content: { ...block.content, [key]: value } } as Partial<EmailBlock>);
  };

  const updateStyle = (key: string, value: string) => {
    onUpdate(block.id, { styles: { ...block.styles, [key]: value } } as Partial<EmailBlock>);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      updateContent('src', dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <aside className="w-64 bg-card border-l border-border shrink-0 overflow-y-auto panel-pop-in">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground capitalize">{block.type} Block</span>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => onDuplicate(block.id)} className="h-7 w-7 p-0 text-muted-foreground">
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onRemove(block.id)} className="h-7 w-7 p-0 text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDeselect} className="h-7 w-7 p-0 text-muted-foreground">
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="p-3 space-y-4">
        {block.type === 'heading' && (
          <Field label="Text">
            <Input value={block.content.text || ''} onChange={e => updateContent('text', e.target.value)} />
          </Field>
        )}

        {block.type === 'text' && (
          <Field label="Text">
            <Textarea value={block.content.text || ''} onChange={e => updateContent('text', e.target.value)} rows={4} />
          </Field>
        )}

        {block.type === 'image' && (
          <>
            <Field label="Upload Image">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                Upload from Computer
              </Button>
            </Field>
            <Field label="Or Image URL">
              <Input value={block.content.src || ''} onChange={e => updateContent('src', e.target.value)} placeholder="https://..." />
            </Field>
            <Field label="Alt Text">
              <Input value={block.content.alt || ''} onChange={e => updateContent('alt', e.target.value)} placeholder="Describe the image" />
            </Field>
            {block.content.src && (
              <div className="rounded-md border border-border overflow-hidden">
                <img src={block.content.src} alt="Preview" className="w-full h-20 object-cover" />
              </div>
            )}
          </>
        )}

        {block.type === 'button' && (
          <>
            <Field label="Button Text">
              <Input value={block.content.text || ''} onChange={e => updateContent('text', e.target.value)} />
            </Field>
            <Field label="Link URL">
              <Input value={block.content.url || ''} onChange={e => updateContent('url', e.target.value)} placeholder="https://..." />
            </Field>
            <Field label="Background Color">
              <div className="flex gap-2 items-center">
                <input type="color" value={block.styles.backgroundColor || '#4F46E5'} onChange={e => updateStyle('backgroundColor', e.target.value)} className="w-8 h-8 rounded border border-border cursor-pointer" />
                <Input value={block.styles.backgroundColor || ''} onChange={e => updateStyle('backgroundColor', e.target.value)} className="flex-1" />
              </div>
            </Field>
            <Field label="Text Color">
              <div className="flex gap-2 items-center">
                <input type="color" value={block.styles.color || '#FFFFFF'} onChange={e => updateStyle('color', e.target.value)} className="w-8 h-8 rounded border border-border cursor-pointer" />
                <Input value={block.styles.color || ''} onChange={e => updateStyle('color', e.target.value)} className="flex-1" />
              </div>
            </Field>
          </>
        )}

        {block.type === 'columns' && (
          <>
            <Field label="Left Column">
              <Textarea value={block.content.left || ''} onChange={e => updateContent('left', e.target.value)} rows={3} />
            </Field>
            <Field label="Right Column">
              <Textarea value={block.content.right || ''} onChange={e => updateContent('right', e.target.value)} rows={3} />
            </Field>
          </>
        )}

        {block.type === 'spacer' && (
          <Field label="Height">
            <Input value={block.styles.height || '24px'} onChange={e => updateStyle('height', e.target.value)} placeholder="24px" />
          </Field>
        )}

        {block.type === 'divider' && (
          <Field label="Color">
            <div className="flex gap-2 items-center">
              <input type="color" value={block.styles.borderColor || '#E5E7EB'} onChange={e => updateStyle('borderColor', e.target.value)} className="w-8 h-8 rounded border border-border cursor-pointer" />
              <Input value={block.styles.borderColor || ''} onChange={e => updateStyle('borderColor', e.target.value)} className="flex-1" />
            </div>
          </Field>
        )}

        {(block.type === 'heading' || block.type === 'text') && (
          <>
            <Field label="Font Size">
              <Input value={block.styles.fontSize || '16px'} onChange={e => updateStyle('fontSize', e.target.value)} />
            </Field>
            <Field label="Color">
              <div className="flex gap-2 items-center">
                <input type="color" value={block.styles.color || '#111827'} onChange={e => updateStyle('color', e.target.value)} className="w-8 h-8 rounded border border-border cursor-pointer" />
                <Input value={block.styles.color || ''} onChange={e => updateStyle('color', e.target.value)} className="flex-1" />
              </div>
            </Field>
            <Field label="Alignment">
              <Select value={block.styles.textAlign || 'left'} onValueChange={v => updateStyle('textAlign', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </>
        )}

        {block.type === 'image' && (
          <Field label="Border Radius">
            <Input value={block.styles.borderRadius || '0px'} onChange={e => updateStyle('borderRadius', e.target.value)} />
          </Field>
        )}
      </div>
    </aside>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground font-body">{label}</Label>
      {children}
    </div>
  );
}
