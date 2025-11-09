import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { EvolutionCycle, EvolverConfig, SystemMetrics } from '../../types/evolver';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-8d51d9e2`;

export class EvolverAPI {
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

  async getEvolutionCycles(): Promise<EvolutionCycle[]> {
    return this.request('/evolver/cycles');
  }

  async getEvolutionCycle(id: string): Promise<EvolutionCycle> {
    return this.request(`/evolver/cycles/${id}`);
  }

  async createEvolutionCycle(cycle: Partial<EvolutionCycle>): Promise<EvolutionCycle> {
    return this.request('/evolver/cycles', {
      method: 'POST',
      body: JSON.stringify(cycle),
    });
  }

  async updateEvolutionCycle(id: string, updates: Partial<EvolutionCycle>): Promise<EvolutionCycle> {
    return this.request(`/evolver/cycles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async startEvolutionCycle(): Promise<EvolutionCycle> {
    return this.request('/evolver/cycles/start', {
      method: 'POST',
    });
  }

  async approveProposal(cycleId: string, proposalId: string): Promise<void> {
    return this.request(`/evolver/cycles/${cycleId}/proposals/${proposalId}/approve`, {
      method: 'POST',
    });
  }

  async rejectProposal(cycleId: string, proposalId: string, reason: string): Promise<void> {
    return this.request(`/evolver/cycles/${cycleId}/proposals/${proposalId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async getConfig(): Promise<EvolverConfig> {
    return this.request('/evolver/config');
  }

  async updateConfig(config: Partial<EvolverConfig>): Promise<EvolverConfig> {
    return this.request('/evolver/config', {
      method: 'PATCH',
      body: JSON.stringify(config),
    });
  }

  async getMetrics(): Promise<SystemMetrics> {
    return this.request('/evolver/metrics');
  }

  async rollbackCycle(cycleId: string): Promise<void> {
    return this.request(`/evolver/cycles/${cycleId}/rollback`, {
      method: 'POST',
    });
  }
}

export const evolverAPI = new EvolverAPI();
