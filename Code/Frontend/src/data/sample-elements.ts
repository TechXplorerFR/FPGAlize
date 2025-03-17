import { type Element } from "@/lib/types";

export let elementList: Element[] = [
    { 
        id: 1, 
        x: 1000, 
        y: 50, 
        isDragging: false, 
        connectedTo: [2] 
    },
    { 
        id: 2, 
        x: 300, 
        y: 700, 
        isDragging: false, 
        connectedTo: [3] 
    },
    { 
        id: 3, 
        x: 800, 
        y: 370, 
        isDragging: false, 
        connectedTo: [1] 
    },
];