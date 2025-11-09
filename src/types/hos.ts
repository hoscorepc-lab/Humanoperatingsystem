export interface HOSModule {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'core' | 'human' | 'research' | 'genesis';
  status?: 'active' | 'idle' | 'learning' | 'processing';
  progress?: number;
}

export interface SystemStatus {
  version: string;
  status: 'running' | 'idle' | 'learning' | 'processing';
  uptime: string;
  modules: HOSModule[];
}
