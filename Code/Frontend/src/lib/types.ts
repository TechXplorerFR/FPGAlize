export type FileInformation = {
    name: string;
    lineCount: number;
    fileSize: number;
}

export type Tab = {
    name: string;
    id: string;
}

export type Element = {
    id: number;
    x: number;
    y: number;
    isDragging: boolean;
    connectedTo: number[];
  }
  