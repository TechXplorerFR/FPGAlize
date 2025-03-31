import { type Element } from "@/lib/types/types";

export let elementList: Element[] = [
    {
        id: 1,
        name: "FF1",
        icon: "path-to-an-icon",
        x: 100,
        y: 50,
        isDragging: false,
        connectedTo: [2, 3, 4]
    },
    {
        id: 2,
        name: "D_output",
        icon: "path-to-an-icon",
        x: 200,
        y: 100,
        isDragging: false,
        connectedTo: [1, 5, 6]
    },
    {
        id: 3,
        name: "clk_output",
        icon: "path-to-an-icon",
        x: 300,
        y: 150,
        isDragging: false,
        connectedTo: [1, 6]
    },
    {
        id: 4,
        name: "async_reset_output",
        icon: "path-to-an-icon",
        x: 400,
        y: 200,
        isDragging: false,
        connectedTo: [1, 7]
    },
    {
        id: 5,
        name: "latch_Q_output",
        icon: "path-to-an-icon",
        x: 500,
        y: 250,
        isDragging: false,
        connectedTo: [2, 6]
    },
    {
        id: 6,
        name: "latch_Q_output",
        icon: "path-to-an-icon",
        x: 600,
        y: 300,
        isDragging: false,
        connectedTo: [2, 3]
    },
    {
        id: 7,
        name: "lut",
        icon: "path-to-an-icon",
        x: 700,
        y: 350,
        isDragging: false,
        connectedTo: [3, 5]
    },
    {
        id: 8,
        name: "LUT_K",
        icon: "path-to-an-icon",
        x: 800,
        y: 400,
        isDragging: false,
        connectedTo: [4, 5]
    },
    {
        id: 9,
        name: "latch_Q",
        icon: "path-to-an-icon",
        x: 900,
        y: 450,
        isDragging: false,
        connectedTo: [2, 7]
    }
];