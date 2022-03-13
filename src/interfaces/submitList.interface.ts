export interface submitList {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: submitCategory;
  update: boolean;
  published_date: Date;
  discriminator?: string;
}

type submitCategory = "bot" | "server"