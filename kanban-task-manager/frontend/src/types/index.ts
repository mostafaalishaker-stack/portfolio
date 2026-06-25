export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  position: number;
  dueDate?: string;
  labels: string[];
  columnId: string;
}

export interface Column {
  id: string;
  title: string;
  position: number;
  cards: Card[];
}

export interface Board {
  id: string;
  title: string;
  columns: Column[];
}
