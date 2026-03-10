import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface Player {
  id: number;
  name: string;
  gaming_id: string;
  photo_url: string;
  matches?: Match[];
}

export interface Season {
  id: number;
  name: string;
  status: 'active' | 'archived';
  type: 'league' | 'knockout';
}

export interface Match {
  id: number;
  season_id: number;
  player1_id: number;
  player2_id: number;
  player1_score: number;
  player2_score: number;
  status: 'scheduled' | 'completed';
  match_date: string;
  player1_name: string;
  player1_photo: string;
  player2_name: string;
  player2_photo: string;
}

export interface Standing {
  id: number;
  name: string;
  photo_url: string;
  gaming_id: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
}
