
export interface Lead {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  group: string;
  lastUpdate: string;
  value?: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Stage {
  id: string;
  name: string;
  color: string;
  leads: Lead[];
}
