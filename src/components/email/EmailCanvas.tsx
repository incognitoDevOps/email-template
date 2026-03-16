import { EmailBlock, DevicePreview } from '@/types/email';
import { EmailBlockRenderer } from './EmailBlockRenderer';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableBlock } from './SortableBlock';

interface EmailCanvasProps {
  blocks: EmailBlock[];
  device: DevicePreview;
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
  onMoveBlock: (from: number, to: number) => void;
}

export function EmailCanvas({ blocks, device, selectedBlockId, onSelectBlock, onMoveBlock }: EmailCanvasProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIdx = blocks.findIndex(b => b.id === active.id);
      const newIdx = blocks.findIndex(b => b.id === over.id);
      if (oldIdx !== -1 && newIdx !== -1) onMoveBlock(oldIdx, newIdx);
    }
  };

  return (
    <div className="flex-1 bg-background overflow-auto flex justify-center py-8 px-4" onClick={() => onSelectBlock(null)}>
      <div
        className="bg-canvas email-canvas-shadow rounded-lg transition-all duration-200"
        style={{ width: device === 'desktop' ? 600 : 375, minHeight: 400 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-8">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
              {blocks.map((block) => (
                <SortableBlock key={block.id} id={block.id}>
                  <div
                    onClick={(e) => { e.stopPropagation(); onSelectBlock(block.id); }}
                    className={`relative group cursor-pointer transition-all rounded ${selectedBlockId === block.id ? 'ring-2 ring-primary ring-offset-2' : 'hover:ring-1 hover:ring-border hover:ring-offset-1'}`}
                  >
                    <EmailBlockRenderer block={block} />
                  </div>
                </SortableBlock>
              ))}
            </SortableContext>
          </DndContext>

          {blocks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <p className="text-sm font-body">Drop blocks here or select a template to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
