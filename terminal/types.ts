export enum MessageType {
  USER = 'USER',
  SYSTEM = 'SYSTEM',
  INFO = 'INFO',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS'
}

export interface TerminalLine {
  id: string;
  type: MessageType;
  content: string;
  timestamp: number;
}

export interface FileItem {
  name: string;
  type: 'FILE' | 'DIR';
  size?: string;
  permissions: string;
  date: string;
  content?: string;
}

export interface SystemStats {
  cpu: number;
  memory: number;
  network: number;
  temp: number;
}
