
export interface Particle {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  angle: number;
  distance: number;
  speed: number;
  radialSpeed: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
}

export enum PortalState {
  IDLE = 'IDLE',
  OPENING = 'OPENING',
  OPEN = 'OPEN'
}

export interface OracleMessage {
  role: 'user' | 'model';
  text: string;
}
