export interface Screenshot {
  id: string;
  name: string;
  file: File;
  preview: string;
  status: 'uploading' | 'analyzing' | 'generating' | 'completed' | 'error';
  progress: number;
  createdAt: Date;
  code?: GeneratedCode;
  metadata?: ScreenshotMetadata;
  error?: string;
}

export interface GeneratedCode {
  html: string;
  react: string;
  vue: string;
  tailwind: string;
  css: string;
}

export interface ScreenshotMetadata {
  width: number;
  height: number;
  framework: CodeFramework;
  components: number;
  elements: number;
  colors: string[];
  fonts: string[];
  layout: LayoutInfo;
}

export type CodeFramework = 'html' | 'react' | 'vue' | 'tailwind';

export interface LayoutInfo {
  type: 'single-page' | 'multi-section' | 'dashboard' | 'form' | 'landing';
  sections: LayoutSection[];
  responsive: boolean;
}

export interface LayoutSection {
  id: string;
  type: 'header' | 'hero' | 'content' | 'sidebar' | 'footer' | 'card' | 'form';
  position: { x: number; y: number; width: number; height: number };
  elements: DetectedElement[];
}

export interface DetectedElement {
  id: string;
  type: 'button' | 'input' | 'text' | 'image' | 'icon' | 'card' | 'list' | 'nav';
  content?: string;
  styles: {
    color?: string;
    background?: string;
    fontSize?: string;
    fontWeight?: string;
    padding?: string;
    margin?: string;
  };
  position: { x: number; y: number; width: number; height: number };
}

export interface ConversionOptions {
  framework: CodeFramework;
  styling: 'tailwind' | 'css' | 'inline';
  typescript: boolean;
  responsive: boolean;
  accessibility: boolean;
  comments: boolean;
  extractColors: boolean;
  optimizeImages: boolean;
}
