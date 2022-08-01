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
