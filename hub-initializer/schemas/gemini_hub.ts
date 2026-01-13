// hub-initializer/schemas/gemini_hub.ts

export type GoogleService = 
  | 'gemini'
  | 'vertex'
  | 'firebase'
  | 'drive'
  | 'bigquery'
  | 'sheets'
  | 'appscript'
  | 'nano'
  | 'cloudfunctions';

export interface GeminiHubRequest {
  service: GoogleService;
  action: string;
  payload: any;
}

export interface GeminiHubResponse {
  service: GoogleService;
  status: 'success' | 'error';
  data: any;
  error?: string;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
}