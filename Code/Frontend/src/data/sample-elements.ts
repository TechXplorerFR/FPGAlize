import { type Element } from "@/lib/types";

export let elementList: Element[] = [
    { 
        id: 1, 
        x: 300, 
        y: 50, 
        isDragging: false, 
        connectedTo: [3] 
    },
    { 
        id: 2, 
        x: 300, 
        y: 600, 
        isDragging: false, 
        connectedTo: [3] 
    },
    { 
        id: 3, 
        x: 300, 
        y: 350, 
        isDragging: false, 
        connectedTo: [4] 
    },
    {
        id: 4,
        x: 1000,
        y: 350,
        isDragging: false,
        connectedTo: []
    },
];