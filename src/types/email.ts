export type BlockType = 'heading' | 'text' | 'image' | 'button' | 'divider' | 'spacer' | 'columns';

export interface EmailBlock {
  id: string;
  type: BlockType;
  content: Record<string, string>;
  styles: Record<string, string>;
}

export interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  blocks: EmailBlock[];
}

export type DevicePreview = 'desktop' | 'mobile';
