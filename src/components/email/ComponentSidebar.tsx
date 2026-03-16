import { useState } from 'react';
import { Type, Image, MousePointerClick, Minus, ArrowUpDown, Columns, Heading, LayoutTemplate, Plus, Save, FolderOpen, Trash2, Pencil } from 'lucide-react';
import { BlockType, EmailTemplate, EmailBlock } from '@/types/email';
import { defaultTemplates } from '@/data/templates';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ComponentSidebarProps {
  onAddBlock: (type: BlockType) => void;
  onLoadTemplate: (t: EmailTemplate) => void;
  blocks: EmailBlock[];
  onLoadBlocks: (blocks: EmailBlock[]) => void;
}

const blockItems: { type: BlockType; icon: React.ElementType; label: string }[] = [
  { type: 'heading', icon: Heading, label: 'Heading' },
  { type: 'text', icon: Type, label: 'Text' },
  { type: 'image', icon: Image, label: 'Image' },
  { type: 'button', icon: MousePointerClick, label: 'Button' },
  { type: 'divider', icon: Minus, label: 'Divider' },
  { type: 'spacer', icon: ArrowUpDown, label: 'Spacer' },
  { type: 'columns', icon: Columns, label: 'Columns' },
];

interface SavedTemplate {
  id: string;
  name: string;
  blocks: EmailBlock[];
  savedAt: string;
}

function getSavedTemplates(): SavedTemplate[] {
  try {
    return JSON.parse(localStorage.getItem('mailcraft-saved-templates') || '[]');
  } catch {
    return [];
  }
}

function setSavedTemplates(templates: SavedTemplate[]) {
  localStorage.setItem('mailcraft-saved-templates', JSON.stringify(templates));
}

export function ComponentSidebar({ onAddBlock, onLoadTemplate, blocks, onLoadBlocks }: ComponentSidebarProps) {
  const [tab, setTab] = useState<'blocks' | 'templates' | 'saved'>('blocks');
  const [savedTemplates, setSavedTemplatesState] = useState<SavedTemplate[]>(getSavedTemplates);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [editingTemplate, setEditingTemplate] = useState<SavedTemplate | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameName, setRenameName] = useState('');

  const handleSave = () => {
    if (!saveName.trim() || blocks.length === 0) return;
    const newTemplate: SavedTemplate = {
      id: `saved-${Date.now()}`,
      name: saveName.trim(),
      blocks: JSON.parse(JSON.stringify(blocks)),
      savedAt: new Date().toISOString(),
    };
    const updated = [...getSavedTemplates(), newTemplate];
    setSavedTemplates(updated);
    setSavedTemplatesState(updated);
    setSaveName('');
    setSaveDialogOpen(false);
  };

  const handleOverwrite = (id: string) => {
    if (blocks.length === 0) return;
    const updated = getSavedTemplates().map(t =>
      t.id === id ? { ...t, blocks: JSON.parse(JSON.stringify(blocks)), savedAt: new Date().toISOString() } : t
    );
    setSavedTemplates(updated);
    setSavedTemplatesState(updated);
  };

  const handleRename = () => {
    if (!renameName.trim() || !editingTemplate) return;
    const updated = getSavedTemplates().map(t =>
      t.id === editingTemplate.id ? { ...t, name: renameName.trim() } : t
    );
    setSavedTemplates(updated);
    setSavedTemplatesState(updated);
    setRenameDialogOpen(false);
    setEditingTemplate(null);
    setRenameName('');
  };

  const openRenameDialog = (t: SavedTemplate) => {
    setEditingTemplate(t);
    setRenameName(t.name);
    setRenameDialogOpen(true);
  };

  const handleDeleteSaved = (id: string) => {
    const updated = getSavedTemplates().filter(t => t.id !== id);
    setSavedTemplates(updated);
    setSavedTemplatesState(updated);
  };

  const handleStartFromScratch = () => {
    onLoadBlocks([]);
  };

  return (
    <>
    <aside className="w-60 bg-card border-r border-border flex flex-col shrink-0 overflow-hidden">
      <div className="flex border-b border-border">
        <button
          onClick={() => setTab('blocks')}
          className={`flex-1 py-2.5 text-xs font-medium transition-colors ${tab === 'blocks' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Blocks
        </button>
        <button
          onClick={() => setTab('templates')}
          className={`flex-1 py-2.5 text-xs font-medium transition-colors ${tab === 'templates' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Templates
        </button>
        <button
          onClick={() => setTab('saved')}
          className={`flex-1 py-2.5 text-xs font-medium transition-colors ${tab === 'saved' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Saved
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {tab === 'blocks' ? (
          <div className="grid grid-cols-2 gap-2">
            {blockItems.map(({ type, icon: Icon, label }) => (
              <motion.button
                key={type}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onAddBlock(type)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-secondary/60 hover:bg-secondary text-foreground transition-colors border border-transparent hover:border-border"
              >
                <Icon className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs font-medium font-body">{label}</span>
              </motion.button>
            ))}
          </div>
        ) : tab === 'templates' ? (
          <div className="space-y-2">
            {/* Start from scratch */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartFromScratch}
              className="w-full text-left p-3 rounded-lg border-2 border-dashed border-primary/40 hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Start from Scratch</p>
                  <p className="text-xs text-muted-foreground font-body">Blank canvas</p>
                </div>
              </div>
            </motion.button>

            {defaultTemplates.map((t) => (
              <motion.button
                key={t.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onLoadTemplate(t)}
                className="w-full text-left p-3 rounded-lg bg-secondary/60 hover:bg-secondary border border-transparent hover:border-border transition-colors"
              >
                <div className="flex items-center gap-2">
                  <LayoutTemplate className="h-4 w-4 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground font-body">{t.category}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {/* Save current button */}
            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full gap-2" disabled={blocks.length === 0}>
                  <Save className="h-4 w-4" />
                  Save Current Template
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 pt-2">
                  <Input
                    placeholder="Template name..."
                    value={saveName}
                    onChange={e => setSaveName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSave()}
                  />
                  <Button onClick={handleSave} disabled={!saveName.trim()} className="w-full">
                    Save
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {savedTemplates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-body">No saved templates yet</p>
              </div>
            ) : (
              savedTemplates.map((t) => (
                <div key={t.id} className="space-y-1">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onLoadBlocks(t.blocks)}
                    className="w-full text-left p-3 rounded-lg bg-secondary/60 hover:bg-secondary border border-transparent hover:border-border transition-colors"
                  >
                    <p className="text-sm font-medium text-foreground truncate">{t.name}</p>
                    <p className="text-xs text-muted-foreground font-body">
                      {new Date(t.savedAt).toLocaleDateString()}
                    </p>
                  </motion.button>
                  <div className="flex items-center gap-1 px-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                      onClick={() => openRenameDialog(t)}
                    >
                      <Pencil className="h-3 w-3" />
                      Rename
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                      onClick={() => handleOverwrite(t.id)}
                      disabled={blocks.length === 0}
                    >
                      <Save className="h-3 w-3" />
                      Overwrite
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1 text-destructive hover:text-destructive ml-auto"
                      onClick={() => handleDeleteSaved(t.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </aside>

    {/* Rename Dialog */}
    <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Template</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <Input
            placeholder="New name..."
            value={renameName}
            onChange={e => setRenameName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleRename()}
          />
          <Button onClick={handleRename} disabled={!renameName.trim()} className="w-full">
            Rename
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
