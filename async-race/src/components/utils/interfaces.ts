export interface Car {
  id: number;
  name: string;
  color: string;
  engineStarted?: boolean;
}

export interface CarResponse {
  cars: Car[];
  totalCount: string | null;
}

export interface Winner {
  id: number;
  wins: number;
  time: number;
  car: { name: string; color: string };
}

export interface WinnerResponse {
  winners: Winner[];
  totalCount: string | null;
}
