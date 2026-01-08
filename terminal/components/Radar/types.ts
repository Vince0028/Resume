export interface Target {
    id: string;
    angle: number;
    distance: number;
    type: 'FRIENDLY' | 'HOSTILE';
    speed: number;
    altitude: number;
    opacity?: number;
}

export interface TelemetryData {
    label: string;
    value: string | number;
    unit?: string;
}
