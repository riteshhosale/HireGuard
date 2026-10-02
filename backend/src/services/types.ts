export interface NetworkEvent {
  type:
    | "REQUEST"
    | "RESPONSE"
    | "REQUEST_FINISHED"
    | "REQUEST_FAILED";

  timestamp: string;

  url: string;

  method?: string;

  status?: number;

  resourceType?: string;

  failure?: string;
}

export interface RedirectEvent {
  from: string;
  to: string;
  timestamp: string;
}

export interface FormField {
  name: string;
  type: string;
  placeholder?: string;
  autocomplete?: string;
}

export interface FormEvidence {
  action: string;
  method: string;
  fields: FormField[];
}

export interface StopGuardEvidence {
  triggered: boolean;
  reason?: string;
  evidence?: string;
}

export interface PageEvidence {
  url: string;

  title: string;

  text: string;

  forms: FormEvidence[];

  network: NetworkEvent[];

  redirects: RedirectEvent[];

  stopGuard: StopGuardEvidence;
}

export interface ScanEvidence {
  initialUrl: string;

  finalUrl: string;

  pages: PageEvidence[];
}