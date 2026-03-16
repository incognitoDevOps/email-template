import { useState } from 'react';
import { Undo2, Redo2, Monitor, Smartphone, Download, Mail, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DevicePreview } from '@/types/email';

interface TopBarProps {
  device: DevicePreview;
  onDeviceChange: (d: DevicePreview) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
  getHTML: () => string;
}

export function TopBar({ device, onDeviceChange, canUndo, canRedo, onUndo, onRedo, onExport, getHTML }: TopBarProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHTML, setPreviewHTML] = useState('');

  const handlePreview = () => {
    setPreviewHTML(getHTML());
    setPreviewOpen(true);
  };

  return (
    <>
      <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground text-lg tracking-tight">MailCraft</span>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={onUndo} disabled={!canUndo} className="text-muted-foreground">
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onRedo} disabled={!canRedo} className="text-muted-foreground">
            <Redo2 className="h-4 w-4" />
          </Button>

          <div className="ml-3 flex items-center bg-secondary rounded-md p-0.5">
            <Button
              variant={device === 'desktop' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onDeviceChange('desktop')}
              className="h-7 px-2"
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant={device === 'mobile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onDeviceChange('mobile')}
              className="h-7 px-2"
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePreview} className="gap-1.5">
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button size="sm" onClick={onExport} className="bg-success hover:bg-success/90 text-success-foreground gap-1.5">
            <Download className="h-4 w-4" />
            Export HTML
          </Button>
        </div>
      </header>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl w-[90vw] h-[85vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle>Email Preview</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden px-6 pb-6">
            <iframe
              srcDoc={previewHTML}
              className="w-full h-full rounded-lg border border-border"
              sandbox="allow-same-origin"
              title="Email Preview"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
