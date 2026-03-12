export interface Session {
  id: string;
  startTime: number;
  endTime: number | null;
  transcript: string;
  recognitionCount: number;
  accuracy: number;
}
