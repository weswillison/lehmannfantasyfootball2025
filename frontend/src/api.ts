import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export interface Team {
  id: number;
  name: string;
  city: string;
  category: 'good' | 'bad' | 'ugly';
  vegas_wins: number;
  conference: string;
  division: string;
}

export interface User {
  id: number;
  name: string;
  created_at?: string;
}

export interface UserPicks {
  id?: number;
  user_id: number;
  season_id: number;
  good_team_id: number;
  bad_team_id: number;
  ugly_team_1_id: number;
  ugly_team_2_id: number;
  ugly_team_3_id: number;
  good_team_name?: string;
  good_team_city?: string;
  bad_team_name?: string;
  bad_team_city?: string;
  ugly_team_1_name?: string;
  ugly_team_1_city?: string;
  ugly_team_2_name?: string;
  ugly_team_2_city?: string;
  ugly_team_3_name?: string;
  ugly_team_3_city?: string;
}

export interface Season {
  id: number;
  year: number;
  current_week: number;
  season_started: boolean;
  playoffs_started: boolean;
  super_bowl_complete: boolean;
  picks_locked: boolean;
}

export interface LeaderboardEntry {
  name: string;
  regular_season_points: number;
  playoff_points: number;
  super_bowl_points: number;
  total_points: number;
  good_team: string;
  bad_team: string;
  ugly_team_1: string;
  ugly_team_2: string;
  ugly_team_3: string;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  picksRevealed: boolean;
  message?: string;
}

export interface PicksStatus {
  picksRevealed: boolean;
  firstGameDate: string;
  message: string;
}

export interface ScoringRules {
  rules: string[];
}

class FantasyFootballAPI {
  private api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  async getTeamsByCategory(category: 'good' | 'bad' | 'ugly'): Promise<Team[]> {
    const response = await this.api.get(`/teams/${category}`);
    return response.data;
  }

  async getCurrentSeason(): Promise<Season> {
    const response = await this.api.get('/season/current');
    return response.data;
  }

  async createUser(name: string): Promise<User> {
    const response = await this.api.post('/users', { name });
    return response.data;
  }

  async getUserByName(name: string): Promise<User> {
    const response = await this.api.get(`/users/${name}`);
    return response.data;
  }

  async saveUserPicks(picks: {
    userId: number;
    goodTeam: number;
    badTeam: number;
    uglyTeams: number[];
  }): Promise<{ success: boolean }> {
    const response = await this.api.post('/picks', picks);
    return response.data;
  }

  async getUserPicks(userId: number): Promise<UserPicks | null> {
    try {
      const response = await this.api.get(`/picks/${userId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async getLeaderboard(): Promise<LeaderboardResponse> {
    const response = await this.api.get('/leaderboard');
    return response.data;
  }

  async getPicksStatus(): Promise<PicksStatus> {
    const response = await this.api.get('/picks-status');
    return response.data;
  }

  async getScoringRules(): Promise<ScoringRules> {
    const response = await this.api.get('/rules');
    return response.data;
  }
}

export const api = new FantasyFootballAPI();
export default api;