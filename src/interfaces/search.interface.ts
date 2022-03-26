import { User } from "./users.interface";

export interface SearchResult {
  id: string;
  name: string;
  icon: string;
  like: number;
  sortDescription: string;
  members?: number;
  servers?: number;
  type: 'server' | 'bot';
  update: boolean;
  discriminator?: string;
  invite?: string;
}

export interface SearchResultReturn {
  bots: SearchResult[];
  servers: SearchResult[];
  totalPage: number;
}