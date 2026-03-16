import { TopBar } from '@/components/email/TopBar';
import { ComponentSidebar } from '@/components/email/ComponentSidebar';
import { EmailCanvas } from '@/components/email/EmailCanvas';
import { PropertyPanel } from '@/components/email/PropertyPanel';
import { useEmailEditor } from '@/hooks/useEmailEditor';
import { toast } from 'sonner';

const Index = () => {
  const editor = useEmailEditor();

  const handleExport = () => {
    const html = editor.exportHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'email-template.html';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Email template exported successfully!');
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
        <TopBar
          device={editor.device}
          onDeviceChange={editor.setDevice}
          canUndo={editor.canUndo}
          canRedo={editor.canRedo}
          onUndo={editor.undo}
          onRedo={editor.redo}
          onExport={handleExport}
          getHTML={editor.exportHTML}
        />
      <div className="flex flex-1 overflow-hidden">
        <ComponentSidebar
          onAddBlock={editor.addBlock}
          onLoadTemplate={editor.loadTemplate}
          blocks={editor.blocks}
          onLoadBlocks={editor.loadBlocks}
        />
        <EmailCanvas
          blocks={editor.blocks}
          device={editor.device}
          selectedBlockId={editor.selectedBlockId}
          onSelectBlock={editor.setSelectedBlockId}
          onMoveBlock={editor.moveBlock}
        />
        <PropertyPanel
          block={editor.selectedBlock}
          onUpdate={editor.updateBlock}
          onRemove={editor.removeBlock}
          onDuplicate={editor.duplicateBlock}
          onDeselect={() => editor.setSelectedBlockId(null)}
        />
      </div>
    </div>
  );
};

export default Index;
