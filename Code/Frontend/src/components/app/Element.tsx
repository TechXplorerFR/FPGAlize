export type Element = {
  id: number;
  x: number;
  y: number;
  isDragging: boolean;
}

export let elementList: Element[] = [
    { id: 1, x: 50, y: 50, isDragging: false },
    { id: 2, x: 300, y: 700, isDragging: false },
    { id: 3, x: 800, y: 370, isDragging: false },
];