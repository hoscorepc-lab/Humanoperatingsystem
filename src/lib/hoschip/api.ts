import { projectId, publicAnonKey } from '../../utils/supabase/info';
import {
  NeuralArchiveEntry,
  ModulePerformanceMetric,
  EvaluationCycle,
  ConfigUpdate,
  SelfPatchLog,
  ModuleConfig,
  CommunicationLog,
  ChipMetrics,
  ReinforcementSignal,
  HOSChipConfig
} from '../../types/hoschip';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-8d51d9e2`;

export class HOSChipAPI {
  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API request failed: ${error}`);
    }

    return response.json();
  }

  // Neural Archive
  async logInteraction(entry: Omit<NeuralArchiveEntry, 'id' | 'timestamp'>): Promise<NeuralArchiveEntry> {
    return this.request('/hoschip/neural-archive', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  }

  async getArchiveEntries(limit: number = 100): Promise<NeuralArchiveEntry[]> {
    return this.request(`/hoschip/neural-archive?limit=${limit}`);
  }

  async searchArchive(query: string): Promise<NeuralArchiveEntry[]> {
    return this.request('/hoschip/neural-archive/search', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }

  // Module Performance
  async getModuleMetrics(): Promise<ModulePerformanceMetric[]> {
    return this.request('/hoschip/module-metrics');
  }

  async updateModuleMetric(metric: Partial<ModulePerformanceMetric> & { moduleId: string }): Promise<void> {
    return this.request('/hoschip/module-metrics', {
      method: 'POST',
      body: JSON.stringify(metric),
    });
  }

  // Evaluation Cycles
  async startEvaluationCycle(): Promise<EvaluationCycle> {
    return this.request('/hoschip/evaluate', {
      method: 'POST',
    });
  }

  async getEvaluationCycles(limit: number = 10): Promise<EvaluationCycle[]> {
    return this.request(`/hoschip/evaluations?limit=${limit}`);
  }

  async getEvaluationCycle(id: string): Promise<EvaluationCycle> {
    return this.request(`/hoschip/evaluations/${id}`);
  }

  // Config Updates
  async getProposedUpdates(): Promise<ConfigUpdate[]> {
    return this.request('/hoschip/config-updates?status=proposed');
  }

  async approveUpdate(updateId: string): Promise<void> {
    return this.request(`/hoschip/config-updates/${updateId}/approve`, {
      method: 'POST',
    });
  }

  async rejectUpdate(updateId: string, reason: string): Promise<void> {
    return this.request(`/hoschip/config-updates/${updateId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async applyUpdates(updateIds: string[]): Promise<SelfPatchLog> {
    return this.request('/hoschip/apply-patches', {
      method: 'POST',
      body: JSON.stringify({ updateIds }),
    });
  }

  // Module Configs
  async getModuleConfig(moduleId: string): Promise<ModuleConfig> {
    return this.request(`/hoschip/module-configs/${moduleId}`);
  }

  async getAllModuleConfigs(): Promise<ModuleConfig[]> {
    return this.request('/hoschip/module-configs');
  }

  // Communication Logs
  async logCommunication(log: Omit<CommunicationLog, 'id' | 'timestamp'>): Promise<void> {
    return this.request('/hoschip/communications', {
      method: 'POST',
      body: JSON.stringify(log),
    });
  }

  async getCommunicationLogs(limit: number = 50): Promise<CommunicationLog[]> {
    return this.request(`/hoschip/communications?limit=${limit}`);
  }

  // System Metrics
  async getChipMetrics(): Promise<ChipMetrics> {
    return this.request('/hoschip/metrics');
  }

  // Reinforcement Learning
  async sendReinforcementSignal(signal: Omit<ReinforcementSignal, 'id' | 'timestamp'>): Promise<void> {
    return this.request('/hoschip/reinforcement', {
      method: 'POST',
      body: JSON.stringify(signal),
    });
  }

  // Self-Patch History
  async getPatchHistory(limit: number = 20): Promise<SelfPatchLog[]> {
    return this.request(`/hoschip/patch-history?limit=${limit}`);
  }

  async rollbackPatch(patchId: string): Promise<void> {
    return this.request(`/hoschip/patch-history/${patchId}/rollback`, {
      method: 'POST',
    });
  }

  // Configuration
  async getChipConfig(): Promise<HOSChipConfig> {
    return this.request('/hoschip/config');
  }

  async updateChipConfig(config: Partial<HOSChipConfig>): Promise<HOSChipConfig> {
    return this.request('/hoschip/config', {
      method: 'PATCH',
      body: JSON.stringify(config),
    });
  }
}

export const hosChipAPI = new HOSChipAPI();
