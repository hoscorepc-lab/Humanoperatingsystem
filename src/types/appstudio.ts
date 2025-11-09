export interface ClonedApp {
  id: string;
  name: string;
  sourceUrl: string;
  description: string;
  thumbnail?: string;
  status: 'analyzing' | 'generating' | 'completed' | 'error';
  progress: number;
  createdAt: Date;
  code?: {
    components: ComponentCode[];
    styles: string;
    assets: AssetFile[];
  };
  metadata?: {
    framework: 'react' | 'next' | 'vite';
    tailwind: boolean;
    typescript: boolean;
    components: number;
    pages: number;
  };
  error?: string;
}

export interface ComponentCode {
  id: string;
  name: string;
  path: string;
  code: string;
  type: 'component' | 'page' | 'layout' | 'util';
  dependencies: string[];
}

export interface AssetFile {
  id: string;
  name: string;
  type: 'image' | 'svg' | 'icon' | 'font';
  url: string;
  size: number;
}

export interface CloneRequest {
  url: string;
  options: CloneOptions;
}

export interface CloneOptions {
  framework: 'react' | 'next' | 'vite';
  typescript: boolean;
  tailwind: boolean;
  extractImages: boolean;
  extractStyles: boolean;
  componentize: boolean;
  responsive: boolean;
}

export interface AnalysisResult {
  title: string;
  description: string;
  colors: string[];
  fonts: string[];
  sections: PageSection[];
  components: string[];
  images: number;
  structure: DOMNode;
}

export interface PageSection {
  id: string;
  type: 'header' | 'hero' | 'features' | 'cta' | 'footer' | 'content';
  name: string;
  description: string;
}

export interface DOMNode {
  tag: string;
  classes: string[];
  children: DOMNode[];
  text?: string;
  attributes: Record<string, string>;
}
