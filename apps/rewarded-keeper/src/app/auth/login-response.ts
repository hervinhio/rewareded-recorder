export type LoginResponse = {
  url?: string;
  message?: string;
  jwt?: string;
  gt?: string;
  ok: boolean;
  action?: 'register' | 'continue';
};
