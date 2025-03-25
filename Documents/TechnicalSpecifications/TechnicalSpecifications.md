<div align="center">

# Technical Specification  
**Project:** Web FPGA Signal Propagation Simulator  
**Version:** 1.4
**Date:** 2025-03-25

Document Revision History

| Version | Date       | Author              | Summary of Changes                                               |
|---------|------------|---------------------|------------------------------------------------------------------|
| 0.1     | 2025-02-26 | Abderrazaq Makran   | Initial structure and outline created                            |
| 0.2     | 2025-03-01 | Abderrazaq Makran   | Added system overview, architecture diagram, and tech stack      |
| 0.3     | 2025-03-05 | Abderrazaq Makran   | Drafted functional requirements and FPGA visualization model     |
| 0.4     | 2025-03-10 | Abderrazaq Makran   | Integrated simulation engine specs and interaction flows         |
| 1.0     | 2025-03-17 | Abderrazaq Makran   | First complete version; added error handling and UI wireframes   |
| 1.2     | 2025-03-22 | Abderrazaq Makran   | Refactored structure, improved code guidelines and diagrams      |
| 1.3     | 2025-03-24 | Abderrazaq Makran   | Pre-final version |
| 1.4     | 2025-03-25 | Abderrazaq Makran   | Final version with appendices, glossary, and performance details |


</div>

---

## Table of Contents

- [Technical Specification](#technical-specification)
  - [Table of Contents](#table-of-contents)
  - [1. Introduction](#1-introduction)
    - [1.1. Problem Statement](#11-problem-statement)
    - [1.2. Target Users](#12-target-users)
    - [1.3. User Experience Goals](#13-user-experience-goals)
    - [1.4. Educational Impact](#14-educational-impact)
    - [1.5. Glossary](#15-glossary)
    - [1.6. System Requirements](#16-system-requirements)
      - [1.6.1. Browser Compatibility](#161-browser-compatibility)
      - [1.6.2. Error Recovery \& Data Persistence](#162-error-recovery--data-persistence)
  - [2. System Overview](#2-system-overview)
    - [2.1. Technology Stack](#21-technology-stack)
    - [2.2. Architecture](#22-architecture)
    - [2.3. Data Model](#23-data-model)
      - [2.3.1. FPGA Visualization JSON](#231-fpga-visualization-json)
    - [2.4. Communication Flow](#24-communication-flow)
    - [2.5. Deployment Strategy](#25-deployment-strategy)
    - [2.6. Project Structure](#26-project-structure)
    - [2.7 Appendices](#27-appendices)
      - [2.7.1 Typography \& Styling Guidelines](#271-typography--styling-guidelines)
      - [2.7.2 Documentation Guidelines](#272-documentation-guidelines)
      - [2.7.3 Code Style Guidelines](#273-code-style-guidelines)
  - [3. Functional Requirements](#3-functional-requirements)
    - [3.1. File Management](#31-file-management)
    - [3.2. Code Editor \& Simulation Controls](#32-code-editor--simulation-controls)
    - [3.3. FPGA Visualization](#33-fpga-visualization)
    - [3.4. Simulation Engine](#34-simulation-engine)
  - [4. UI \& Interaction](#4-ui--interaction)
    - [4.1. Main Interface Layout (MVP)](#41-main-interface-layout-mvp)
    - [4.2. Interaction Flows](#42-interaction-flows)
  - [5. Error Handling \& Logging](#5-error-handling--logging)
    - [5.1. Frontend Error Handling](#51-frontend-error-handling)
    - [5.2. Backend Error Handling](#52-backend-error-handling)
  - [6. Performance \& Scalability](#6-performance--scalability)
    - [6.1. Rendering Optimization](#61-rendering-optimization)
    - [6.2. File Size Limitations](#62-file-size-limitations)
    - [6.3. Caching Strategy](#63-caching-strategy)
    - [6.4. User Concurrency](#64-user-concurrency)
  - [7. Deployment \& Environment](#7-deployment--environment)
    - [7.1. Development Setup](#71-development-setup)
    - [7.2. Local Storage Strategy](#72-local-storage-strategy)
    - [7.3. Containerization](#73-containerization)
    - [7.4. Static Deployment](#74-static-deployment)
    - [7.5. Logging \& Debugging](#75-logging--debugging)
  - [8. Diagrams \& Flowcharts](#8-diagrams--flowcharts)
    - [8.1. System Architecture Diagram](#81-system-architecture-diagram)
    - [8.2. File Processing Flow](#82-file-processing-flow)
    - [8.3. User Interaction Flow](#83-user-interaction-flow)
    - [8.4. API Endpoints](#84-api-endpoints)
  - [9. Dependencies](#9-dependencies)
  - [10. Testing \& Validation](#10-testing--validation)
    - [10.1. Unit Testing](#101-unit-testing)
    - [10.2. Integration Testing](#102-integration-testing)
    - [10.3. Performance Testing](#103-performance-testing)
    - [10.4. User Acceptance Testing](#104-user-acceptance-testing)
  - [11. Security Considerations](#11-security-considerations)
  - [12. Conclusion](#12-conclusion)

---

## 1. Introduction

### 1.1. Problem Statement
Understanding signal propagation in FPGAs is inherently complex. This simulator provides an interactive, visual environment that enables users to observe and manipulate FPGA signal behavior in real time without the need for specialized hardware.

> **Core Question:** How can we make the intricate workings of an FPGA accessible and comprehensible to both novice and experienced users?

### 1.2. Target Users
- **Teachers:** Responsible for selecting preloaded FPGA examples or uploading custom `.v` and `.sdf` files, then managing simulation sessions.
- **Students:** Engage with real-time FPGA simulations through a user-friendly web interface.

### 1.3. User Experience Goals
- **Intuitive Navigation:** Minimal training required.
- **Real-Time Feedback:** Immediate visual response to user actions.
- **Interactive Learning:** Ability to control simulation speed, step through the simulation, and inspect details.
- **Self-Guided Exploration:** Tools that encourage experimentation with FPGA designs.
- **Accessibility:** Support across multiple devices and include necessary accessibility features.

### 1.4. Educational Impact
The simulator bridges theory and practice by:
- Visualizing abstract FPGA internals.
- Enabling hands-on experimentation without physical hardware.
- Supporting self-paced, interactive learning.
- Connecting theoretical concepts with practical simulation outcomes.

### 1.5. Glossary
| Term             | Definition                                                                                       |
|------------------|--------------------------------------------------------------------------------------------------|
| **API**          | Application Programming Interface; enables communication between different software components.  |
| **BEL**          | Basic Element; a fundamental component within an FPGA (e.g., LUT, flip-flop, Block RAM) that will be visualized in the simulation canvas.         |
| **Canvas**       | HTML element used for drawing graphics and animations via JavaScript.                            |
| **Docker**       | Platform for developing, shipping, and running applications in containers.                       |
| **Express.js**   | Minimal and flexible Node.js web application framework for building APIs.                        |
| **FPGA**         | Field-Programmable Gate Array; a reconfigurable integrated circuit for custom digital logic.     |
| **IndexedDB**    | Low-level JavaScript API for client-side storage of significant amounts of structured data.      |
| **JSON Model**   | A structured data format representing FPGA components and signals for visualization purposes.    |
| **Monaco**       | Code editor that powers VS Code, used for syntax highlighting and code editing.                  |
| **Netlist**      | A structural representation of an FPGA design, detailing its components and connections.         |
| **Node.js**      | JavaScript runtime built on Chrome's V8 JavaScript engine for server-side execution.             |
| **P&R**          | Place and Route; mapping netlist components onto FPGA resources and determining routing paths.   |
| **React**        | JavaScript library for building user interfaces with component-based architecture.               |
| **SDF**          | Standard Delay Format; a file format containing timing delay information.                        |
| **Simulation**   | Modeling signal propagation over time to test and validate digital designs.                      |
| **Socket.io**    | Library enabling real-time, bidirectional communication between web clients and servers.         |
| **Synthesis**    | The process of converting Verilog code into a netlist.                                           |
| **TailwindCSS**  | Utility-first CSS framework for rapidly building custom user interfaces.                         |
| **TypeScript**   | JavaScript superset that adds static typing and other features to enhance code quality.          |
| **Vercel**       | Platform for static site deployment and serverless functions with global CDN.                    |
| **Verilog**      | A hardware description language used to design and simulate digital circuits.                    |
| **Vite**         | Modern frontend build tool providing faster development experience through native ES modules.    |

### 1.6. System Requirements

#### 1.6.1. Browser Compatibility
| Browser            | Minimum Version | Notes                                    |
|-------------------|-----------------|------------------------------------------|
| Chrome            | 88+            | Recommended for best performance         |
| Firefox           | 85+            | Full WebGL 2.0 support required          |
| Safari            | 14+            | Limited canvas performance on iOS        |
| Edge (Chromium)   | 88+            | Full feature support                     |

**WebGL Requirements:**
- WebGL 2.0 support required for canvas rendering
- Hardware acceleration recommended
- Minimum 2GB video memory for large FPGA layouts

#### 1.6.2. Error Recovery & Data Persistence

| Error Scenario           | Recovery Procedure                          | Data Persistence                          |
|-------------------------|--------------------------------------------|--------------------------------------------|
| Browser Crash           | Auto-save to IndexedDB every 30 seconds    | Restore last saved state on reload         |
| Network Failure         | Queue operations for retry                 | Cache parsed models locally                |
| File Corruption         | Maintain backup of last valid state        | Version history of last 5 changes          |
| Memory Exhaustion       | Clear non-essential caches                 | Persist critical simulation data           |

**Recovery Features:**
- Automatic state saving during simulation
- Manual save points for critical operations
- Background sync for unsaved changes
- Conflict resolution for multi-tab editing
---

## 2. System Overview

### 2.1. Technology Stack
**Frontend:**
- React + Vite (TypeScript)
- TailwindCSS
- HTML Canvas (for 2D FPGA layout rendering)

**Backend:**
- Node.js + Express.js (TypeScript)
- File Parsing Libraries (for `.v` and `.sdf` files)

**Deployment:**
- Local deployment via Vite (frontend) and Express.js (backend)
- Option for static deployment on Vercel for the frontend
- Optional Docker for containerized testing

### 2.2. Architecture

```
┌───────────────────────────────────────────────────────────┐
│                      Web Browser UI                       │
└───────────────────────────────────────┬───────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────────────────────┐
│                 React Application (Vite)                  │
│  ┌───────────────┐  ┌──────────────┐  ┌───────────────┐   │
│  │  Code Editor  │  │ Simulation   │  │ FPGA Canvas   │   │
│  │  (Monaco)     │  │ Controls     │  │ Renderer      │   │
│  └───────────────┘  └──────────────┘  └───────────────┘   │
└────────────────────────────┬──────────────────────────────┘
               │ HTTP/Fetch API
               ▼
┌───────────────────────────────────────────────────────────┐
│               Express.js Backend (Node.js)                │
│  ┌───────────────┐  ┌──────────────┐  ┌───────────────┐   │
│  │ File Upload   │  │ Processing   │  │ JSON Model    │   │
│  │ API Endpoints │  │ Controller   │  │ Generation    │   │
│  └───────────────┘  └──────────────┘  └───────────────┘   │
└────────────────────────────┬──────────────────────────────┘
               │
               ▼
┌───────────────────────────────────────────────────────────┐
│                      File Parsers                         │
│  ┌───────────────┐                    ┌───────────────┐   │
│  │ Verilog (.v)  │                    │ SDF (.sdf)    │   │
│  │ Parser        │                    │ Parser        │   │
│  └───────────────┘                    └───────────────┘   │
└───────────────────────────────────────────────────────────┘
```

- **Frontend Layer:**
  - **React Application:** Built with Vite and TypeScript, managing application state and UI rendering
  - **Code Editor:** Monaco-based editor for Verilog with syntax highlighting
  - **Simulation Controls:** Interface for controlling simulation playback (play, pause, step)
  - **FPGA Canvas Renderer:** HTML Canvas implementation that visualizes the FPGA layout and signal propagation

- **Communication Layer:**
  - **HTTP/Fetch API:** Primary method for data exchange between frontend and backend
  - **JSON Data Model:** Standardized format for representing FPGA components and connections
  - **Optional WebSockets:** For real-time updates during simulation (Socket.io implementation)

- **Backend Layer:**
  - **Express.js Server:** Handles HTTP requests, file uploads, and processing coordination
  - **File Upload Endpoints:** Manages multipart form uploads for .v and .sdf files
  - **Processing Controller:** Orchestrates the parsing workflow and error handling
  - **JSON Model Generator:** Creates the visualization model from parsed data

- **Processing Layer:**
  - **Verilog Parser:** Extracts FPGA component definitions, connections, and logic
  - **SDF Parser:** Processes timing information for signal propagation simulation
  - **Combined Processing:** Merges data from both parsers to create a comprehensive model

### 2.3. Data Model

#### 2.3.1. FPGA Visualization JSON

The FPGA visualization is based on a structured JSON model that defines both the elements (components) and their connections:

```
Elements (BELs) <---> Connections (Wires)
```

**JSON Model Structure:**
```json
{
  "elements": [
    {
      "id": 0,
      "name": "LUT4",
      "type": "logic_gate",
      "position": { "x": 100, "y": 150 },
      "inputs": [
        { "connectionId": 1, "name": "A" },
        { "connectionId": 2, "name": "B" }
      ],
      "outputs": [
        { "connectionId": 3, "name": "OUT" }
      ],
      "state": {
        "active": false,
        "value": 0
      }
    },
    {
      "id": 1,
      "name": "FF1",
      "type": "flip_flop",
      "position": { "x": 200, "y": 150 },
      "inputs": [
        { "connectionId": 3, "name": "D" },
        { "connectionId": 4, "name": "CLK" }
      ],
      "outputs": [
        { "connectionId": 5, "name": "Q" }
      ],
      "state": {
        "active": false,
        "value": 0
      }
    }
  ],
  "connections": [
    {
      "id": 1,
      "from": "INPUT_A",
      "to": "0.A",
      "path": [[50, 150], [75, 150], [100, 150]],
      "color": "blue",
      "delay": 2,
      "state": {
        "active": false,
        "value": 0,
        "propagating": false
      }
    },
    {
      "id": 3,
      "from": "0.OUT",
      "to": "1.D",
      "path": [[150, 150], [175, 150], [200, 150]],
      "color": "green",
      "delay": 1.5,
      "state": {
        "active": false,
        "value": 0,
        "propagating": false
      }
    }
  ],
  "metadata": {
    "name": "2ffs_VTR",
    "description": "Two flip-flops in series",
    "timeUnit": "ns",
    "gridSize": 10,
    "canvasWidth": 800,
    "canvasHeight": 600
  }
}
```

**Key Components:**

1. **elements**: Array of FPGA basic elements (BELs)
   - `id`: Unique identifier for the element
   - `name`: Display name
   - `type`: Element type (e.g., "logic_gate", "flip_flop", "buffer")
   - `position`: X/Y coordinates on the canvas
   - `inputs/outputs`: Arrays of connection points
     - `connectionId`: Reference to a specific connection in the connections array
     - `name`: Label for the input/output (e.g., "A", "CLK", "OUT")
   - `state`: Current element state for simulation

2. **connections**: Array of wires connecting elements
   - `id`: Unique identifier for the connection
   - `from`: Source element and output (format: "elementId.outputName")
   - `to`: Target element and input (format: "elementId.inputName")
   - `path`: Array of coordinate pairs defining wire routing
   - `color`: Visual representation color
   - `delay`: Signal propagation time in nanoseconds
   - `state`: Current connection state for simulation

3. **metadata**: Additional information about the design
   - `name`: Design name
   - `description`: Short description
   - `timeUnit`: Time unit for simulation (typically "ns")
   - `canvasWidth/canvasHeight`: Visualization dimensions

This model provides a complete representation of the FPGA circuit for visualization and simulation, with the elements representing components and connections representing the signal paths between them.

### 2.4. Communication Flow
1. **File Upload:** Users upload `.v` and `.sdf` files via HTTP POST.  
2. **Processing:** The backend validates and parses the files into a JSON model.  
3. **Data Delivery:** The JSON model is returned to the frontend.  
4. **Visualization:** The frontend renders the FPGA layout on HTML Canvas.  
5. **Simulation:** Users control simulation playback (play, pause, step, speed).  
6. **Error Reporting:** Descriptive error messages are provided if issues occur.

### 2.5. Deployment Strategy
- **Local Environment:**  
  - Frontend served via Vite (`npm run dev`).  
  - Backend runs on Express.js locally (`npm run dev`).
- **Static Deployment:**  
  - Optionally deploy the frontend on Vercel or GitHub Pages.
- **Containerization:**  
  - Optional Docker for consistent local testing.
- **Data Privacy:**  
  - All processing is local; no data is transmitted externally.

### 2.6. Project Structure
The project follows a modular organization reflecting the implementation:

```
Project Root
├── Code/
│   ├── Frontend/                # React frontend application
│   │   ├── public/              # Static assets
│   │   │   ├── data/            # Sample FPGA data files
│   │   │   │   └── samples/     # Example .v and .sdf files
│   │   │   │       ├── 1ff_no_rst_VTR/
│   │   │   │       ├── 1ff_VTR/
│   │   │   │       ├── 2ffs_no_rst_VTR/
│   │   │   │       ├── 2ffs_VTR/
│   │   │   │       ├── 5ffs_VTR/
│   │   │   │       ├── FULLLUT_VTR/
│   │   │   │       └── LUT_VTR/
│   │   ├── src/                 # Frontend source code
│   │   │   ├── components/      # React components
│   │   │   │   ├── app/         # Application-specific components
│   │   │   │   │   ├── AddExampleModal.tsx  # Modal for importing files
│   │   │   │   │   ├── CanvasActionBar.tsx  # Controls for canvas actions
│   │   │   │   │   ├── CodeEditor.tsx       # Monaco-based code editor
│   │   │   │   │   ├── Example.tsx          # Example list item component
│   │   │   │   │   ├── ExamplesDrawer.tsx   # Left-side drawer for examples
│   │   │   │   │   ├── Navbar.tsx           # Top navigation bar
│   │   │   │   │   ├── SimulationCanvas.tsx # Main canvas for FPGA visualization
│   │   │   │   │   ├── TabDisplayer.tsx     # Handles view mode display
│   │   │   │   │   └── TabsBar.tsx          # File tabs management
│   │   │   │   ├── theme-provider.tsx       # Theme handling (light/dark)
│   │   │   │   └── ui/                      # Reusable UI components
│   │   │   │       ├── button.tsx
│   │   │   │       ├── dialog.tsx
│   │   │   │       ├── drawer.tsx
│   │   │   │       ├── separator.tsx
│   │   │   │       ├── skeleton.tsx         # Loading skeleton component
│   │   │   │       ├── sonner.tsx           # Toast notifications
│   │   │   │       └── toggle.tsx
│   │   │   ├── data/            # Static data
│   │   │   │   └── sample-elements.ts       # FPGA element data structures
│   │   │   ├── lib/             # Core library code
│   │   │   │   ├── services/    # Application services
│   │   │   │   │   └── canvas-history.ts    # Implements undo/redo for canvas
│   │   │   │   ├── types/       # TypeScript type definitions
│   │   │   │   │   └── types.ts             # Core type definitions
│   │   │   │   └── utils.ts                 # Utility functions
│   │   │   ├── App.tsx          # Main application component
│   │   │   └── main.tsx         # Application entry point
│   │   ├── package.json         # Frontend dependencies
│   │   ├── tsconfig.json        # TypeScript configuration
│   │   ├── vercel.json          # Vercel deployment configuration
│   │   ├── vite.config.ts       # Vite configuration
│   │   └── tailwind.config.js   # TailwindCSS configuration
│   ├── Backend/                # Node.js backend for file processing
│   │   ├── src/                # Backend source code
│   │   │   ├── controllers/    # Request handlers
│   │   │   │   ├── fileController.ts       # Handles file uploads and processing
│   │   │   │   └── exampleController.ts    # Manages example files
│   │   │   ├── routes/         # API routes
│   │   │   │   ├── fileRoutes.ts           # File upload/processing endpoints
│   │   │   │   └── exampleRoutes.ts        # Example file endpoints
│   │   │   ├── services/       # Business logic services
│   │   │   │   ├── parserService.ts        # File parsing orchestration
│   │   │   │   └── storageService.ts       # File storage management
│   │   │   ├── parsers/        # File parsers
│   │   │   │   ├── verilogParser.ts        # Parses .v files
│   │   │   │   └── sdfParser.ts            # Parses .sdf files
│   │   │   ├── utils/          # Utility functions
│   │   │   │   └── fileUtils.ts            # File handling utilities
│   │   │   └── server.ts       # Express server setup
│   │   ├── package.json        # Backend dependencies
│   │   └── tsconfig.json       # TypeScript configuration
│
├── Documents/                   # Project documentation
│   ├── FunctionalSpecifications/
│   ├── TechnicalSpecifications/
│   ├── Management/
│   ├── QA/
│   └── UserManual/
├── README.md                    # Project overview
└── Scripts/                     # Utility scripts
```

**Key Components and Their Functions:**

**Core Frontend Components:**
- **App.tsx**: Main application component managing state (activeView, tabs, examples)
- **TabDisplayer.tsx**: Controls the view mode switching between Code and Simulation
- **SimulationCanvas.tsx**: Main canvas for rendering FPGA visualizations
- **CodeEditor.tsx**: Monaco-based editor with Verilog syntax highlighting

**File Management:**
- **ExamplesDrawer.tsx**: Side drawer showing available examples with metadata
- **Example.tsx**: Individual example component with click handling
- **AddExampleModal.tsx**: Modal for importing new example files

**Navigation and Controls:**
- **Navbar.tsx**: Top navigation with export functionality and view mode controls 
- **TabsBar.tsx**: Multi-tab interface for switching between open files
- **CanvasActionBar.tsx**: Controls for simulation playback and canvas manipulation

**Parser Services:**
- **v-parser.ts**: Parses Verilog (.v) files into structured JSON data
- **sdf-parser.ts**: Parses Standard Delay Format (.sdf) files
- **parser.ts**: Combines results from both parsers into a unified data model

**Data Types and Models:**
- **types.ts**: Core TypeScript type definitions for the application
- **sample-elements.ts**: Example data structures for FPGA elements

**UI Infrastructure:**
- **theme-provider.tsx**: Handles light/dark theme switching
- **ui/**: Reusable UI components built on Radix UI primitives
  - button.tsx, dialog.tsx, drawer.tsx, dropdown-menu.tsx, etc.
  - skeleton.tsx: Loading placeholder components
  - sonner.tsx: Toast notification system
  - tabs.tsx: Tab component for switching between views

**Utility Functions:**
- **utils.ts**: Helper functions for CSS class management, file handling, etc.
- **services/canvas-history.ts**: Undo/redo functionality for canvas operations

**Backend Integration:**
- The frontend communicates with the backend for file parsing and processing
- File upload handling via HTTP endpoints
- JSON model retrieval for visualization

### 2.7 Appendices

#### 2.7.1 Typography & Styling Guidelines

- **Fonts:** Use sans-serif fonts such as Inter, Roboto, or Helvetica for readability.
- **Headings:**  
  - Use `#` (H1) only for the main document title.  
  - Use `##` (H2) for major sections, and `###` (H3) for subsections.
- **Code Blocks:**  
  - Use backticks (` ``` `) for code snippets with proper language tagging (e.g., `tsx`, `ts`, `json`).
- **Tables:**  
  - Alternate row colors and consistent column widths for readability.
- **Diagrams:**  
  - Diagrams should be vector-based or SVG for scalability, with clear labels and color-coded components.

---

#### 2.7.2 Documentation Guidelines

- **File Naming Convention:**  
  - Use `PascalCase` for documentation files. Example: `TechnicalSpecification.md`
- **Content Style:**  
  - Use concise and objective language.  
  - Prefer active voice (“The user clicks…” vs. “The button is clicked…”).  
  - Maintain consistent terminology for key concepts like “BEL”, “canvas”, “example”.
- **Versioning:**  
  - Maintain a version log in the header with dates and author notes.

---

#### 2.7.3 Code Style Guidelines

- **Languages:** TypeScript for both frontend and backend.
- **Conventions:**  
  - Use `camelCase` for variables and functions (`loadExample`, `uploadFile`)  
  - Use `PascalCase` for components (`SimulationCanvas.tsx`, `ExampleDrawer.tsx`)  
  - Constants in `UPPER_SNAKE_CASE`
- **Formatting:**  
  - Enforce formatting with Prettier (`.prettierrc`).  
  - Use ESLint (`.eslintrc`) to maintain code quality.
- **Comments & Docstrings:**  
  - Use JSDoc for function documentation.
  - Comment complex logic or non-obvious code decisions.

---

## 3. Functional Requirements

### 3.1. File Management
- **Preloaded Examples:**  
  - A library of preloaded FPGA examples (`.v` and `.sdf`) is provided.
- **File Upload:**  
  - Teachers can upload new files to create custom examples.
- **Export:**  
  - Users can export the current design as a `.zip` file containing the associated `.v` and `.sdf` files.

### 3.2. Code Editor & Simulation Controls
- **Code Editor:**  
  - Integrated Monaco editor with Verilog syntax highlighting.
  - Supports real-time update of the FPGA visualization.
  - Displays line numbers and syntax error highlighting.
- **Simulation Controls:**  
  - **Play:** Start simulation with continuous frame updates.
  - **Pause:** Halt simulation while preserving current state.
  - **Step:** Advance simulation by one time unit (asynchronous operation).
  - **Speed:** Adjust playback rate (x0.5, x1, x2, x4) affecting the timing calculations.
  - **Reset:** Return the simulation to its initial state (all signals and components).
  - **Processing Mode**: Toggle between synchronous (blocking UI) and asynchronous (background) simulation processing, providing clear visual feedback during simulation execution.
### 3.3. FPGA Visualization
- **2D Layout Rendering:**  
  - Renders FPGA components (BELs) and signal connections on HTML Canvas.
  - Highlights active elements and uses color coding for signals.
- **Navigation:**  
  - Supports zooming and panning.
- **Interaction:**  
  - Displays tooltips or info panels on hover.
  - Optionally allows dragging of components for layout adjustments.

### 3.4. Simulation Engine
- **Data Input:**  
  - Uses the JSON model generated from parsed `.v` and `.sdf` files.
- **Animation & Timing:**  
  - Animates signal propagation based on timing data.
- **Control Flow:**  
  - Advances simulation in discrete time steps and updates the Canvas in real time.

---

## 4. UI & Interaction

### 4.1. Main Interface Layout (MVP)
A typical MVP screen includes:

- **Header:** Project Title, Navigation, Simulation Controls  
- **Left Panel:** Code Editor (Verilog display, error logs)  
- **Right Panel:** FPGA Visualization (HTML Canvas rendering)  
- **Footer:** Zoom controls, status/error messages

### 4.2. Interaction Flows
1. **Loading an Example:**  
   - User selects a preloaded example.
   - The code editor loads the example; FPGA visualization updates accordingly.
2. **Uploading Files:**  
   - User clicks "Import" and selects `.v` and `.sdf` files.
   - The backend processes the files; on success, the visualization and code editor update; on error, descriptive messages are displayed.
3. **Running the Simulation:**  
   - Teacher clicks "Play" to start the simulation.
   - The animation displays signal propagation; simulation controls (Pause, Step, Speed) adjust the simulation.
4. **Exporting the Design:**  
   - User clicks "Export" to download a `.zip` file containing the current `.v` and `.sdf` files.

---

## 5. Error Handling & Logging

### 5.1. Frontend Error Handling

| Error Category | Error Types | Example Message | User Experience |
|----------------|-------------|-----------------|-----------------|
| **File Upload** | Invalid Format | ❌ "Unsupported file format (.txt). Please upload only .v or .sdf files." | Toast notification with red icon |
| | Size Exceeded | ❌ "File size exceeds 50MB limit. Please reduce file complexity or split into multiple files." | Modal dialog with warning icon |
| | Corrupt File | ⚠️ "File appears to be corrupted or incomplete. Please check and re-upload." | Toast notification with guidance |
| **Code Editor** | Syntax Error | 🔍 "Line 42: Unexpected token '{'. Expected ';' at end of line 41." | Inline editor highlighting with fix suggestion |
| | Reference Error | 🔍 "Line 87: 'clock_in' used but not declared." | Squiggly underline with hover details |
| | Missing Module | ⚠️ "Module 'counter' referenced but not defined in this file." | Warning banner above editor |
| **Simulation** | Timing Conflict | ⚠️ "Signal timing conflict detected in 'clk_out' path." | Highlighted wire in visualization |
| | Missing Connection | ❌ "Cannot simulate: missing connection between FF1.Q and LUT2.A" | Error panel with visual indicator on canvas |
| | State Error | ⚠️ "Unexpected signal state at component 'FF3'. Simulation may be unstable." | Warning badge on component |
| **Rendering** | Canvas Error | ⚠️ "Unable to render all components. Try reducing zoom level." | Status message in footer |
| | Layout Overflow | ℹ️ "Design too large for viewport. Use zoom controls to adjust view." | Info badge with zoom controls highlight |

### 5.2. Backend Error Handling

| Error Category | HTTP Status | Error Code | Example Response |
|----------------|-------------|------------|------------------|
| **File Processing** | 400 | `FILE_PARSE_ERROR` | ```{"error":true,"code":"FILE_PARSE_ERROR","message":"Invalid SDF timing format on line 156","details":"Expected numeric value but found 'x'","status":400}``` |
| | 413 | `FILE_SIZE_EXCEEDED` | ```{"error":true,"code":"FILE_SIZE_EXCEEDED","message":"File size exceeds 50MB limit","details":"Maximum allowed size is 50MB, received 68MB","status":413}``` |
| | 415 | `UNSUPPORTED_FORMAT` | ```{"error":true,"code":"UNSUPPORTED_FORMAT","message":"Unsupported file format","details":"Only .v and .sdf files are supported","status":415}``` |
| **Resource Access** | 404 | `EXAMPLE_NOT_FOUND` | ```{"error":true,"code":"EXAMPLE_NOT_FOUND","message":"Example '2ffs_VTR' not found","details":"Verify example name or browse available examples","status":404}``` |
| **Data Validation** | 422 | `VALIDATION_ERROR` | ```{"error":true,"code":"VALIDATION_ERROR","message":"Invalid simulation parameters","details":"Time step must be positive integer","status":422}``` |
| **Server Errors** | 500 | `SERVER_ERROR` | ```{"error":true,"code":"SERVER_ERROR","message":"Internal server error occurred","details":"Error reference: #E12345","status":500}``` |
| | 503 | `SERVICE_UNAVAILABLE` | ```{"error":true,"code":"SERVICE_UNAVAILABLE","message":"Service temporarily unavailable","details":"Try again later","status":503}``` |

Each error includes:
- Clear error identification
- Actionable guidance for resolution
- Reference codes for support (where applicable)
- Appropriate visual indicators based on severity

## 6. Performance & Scalability

### 6.1. Rendering Optimization
- **HTML Canvas Rendering:**  
  - Use `requestAnimationFrame` for smooth animations.
  - Render only visible or active elements based on current zoom and pan.
- **Batch Updates:**  
  - Minimize re-renders by batching simulation frame updates.

### 6.2. File Size Limitations

| File Type | Recommended Limit | Maximum Limit | Handling Strategy                     |
|-----------|-------------------|---------------|---------------------------------------|
| .sdf      | 10MB              | 50MB          | Warn user; use chunked processing     |
| .v        | 5MB               | 25MB          | Warn user; display performance notice |

- **Exceeding Maximum Limits:**
  - Files exceeding maximum limits will be rejected with a clear error message
  - Users will receive guidance on how to split or reduce file size
  - Example error: "File size exceeds 50MB limit. Please reduce file complexity or split into multiple files."

- **Processing Strategy:**
  - Large files within limits use progressive loading indicators
  - Memory usage monitoring prevents browser crashes
  - Automatic background processing for files near maximum limits

### 6.3. Caching Strategy
- **Local Storage:**  
  - Cache JSON models, user settings, and preloaded examples in localStorage.
- **File Fingerprinting:**  
  - Detect file changes to prevent redundant parsing.
- **Rendering Cache:**  
  - Cache precomputed layouts for fast re-rendering.

### 6.4. User Concurrency
- **Multiple Browser Tabs:**  
  - Supports usage across multiple tabs (primarily single-user local use).
- **Session Persistence:**  
  - Maintain user settings (theme, zoom level, last used files) across reloads.

---

## 7. Deployment & Environment

### 7.1. Development Setup
To set up the development environment, run the following commands:

For the frontend:
```
cd code/frontend
npm install
npm run dev
```

For the backend:
```
cd code/backend
npm install
npm run dev
```
### 7.2. Local Storage Strategy
1. **File Storage:**  
   - Store uploaded files in IndexedDB.  
   - Cache JSON models and user preferences in localStorage.
2. **Data Lifecycle:**  
   - Provide options to clear temporary files; auto-cleanup of unused files.
   - Offer export functionality.
3. **Privacy:**  
   - All processing occurs locally; no data is transmitted externally.

### 7.3. Containerization
Example Dockerfile for containerized deployment (text diagram):
```
# Use node as the base image
FROM node:23-alpine

# Set working directory
WORKDIR /app

RUN pwd
RUN ls

# Copy package files
COPY Code/Frontend/package.json Code/Frontend/package-lock.json ./

# Install dependencies
RUN npm ci

# Copy app source
COPY Code/Frontend ./

# Build the app
RUN npm run build

# Expose the port
EXPOSE 4173

# Run preview server
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]
```

### 7.4. Static Deployment
1. **Build Process:**
```
npm run build
```
2. **Deployment Configuration:**
   - Configure GitHub Actions for automated deployment.
   - Set proper base paths and SPA routing.
   - Configure caching headers.
3. **Backend Considerations:**
   - Provide API documentation.
   - Include fallback processing methods on the frontend.

### 7.5. Logging & Debugging
- **Development Logging:**  
  - Detailed console logs, performance metrics, and API request/response data.
- **Production Logging:**  
  - Error-only logging with optional verbose logs.
  - Local log storage with rotation and export options.
- **Crash Reporting:**  
  - Capture unhandled exceptions and generate crash reports.
  - Option for anonymous crash data reporting (opt-in).

---

## 8. Diagrams & Flowcharts

### 8.1. System Architecture Diagram
```
graph TD
  A["Web Browser UI"] --> B["React Application (Vite)"]
  B --> C["Express.js Backend (Node.js)"]
  C --> D["File Parsers (.v, .sdf)"]
```

### 8.2. File Processing Flow
```
graph LR
    A[Upload Files] --> B[Validate Format]
    B --> C[Parse Content]
    C --> D[Generate JSON Model]
    D --> E[Return JSON to Frontend]

```

### 8.3. User Interaction Flow
```
graph TD
  A["Select Example / Upload Files"] --> B["Receive Processing Feedback"]
  B --> C["Display Code in Editor"]
  C --> D["Render FPGA Layout on Canvas"]
  D --> E["Control Simulation (Play, Pause, Step, Speed)"]

```

### 8.4. API Endpoints
Text Table:
| Endpoint             | Method | Purpose                          | Request Body         | Response                |
|----------------------|--------|----------------------------------|----------------------|-------------------------|
| /api/upload          | POST   | Upload .sdf and .v files         | Multipart form data  | Processing status, ID   |
| /api/model/:id       | GET    | Retrieve generated JSON model    | -                    | JSON model data         |
| /api/status/:id      | GET    | Check processing progress        | -                    | Status information      |
| /api/examples        | GET    | List available example files     | -                    | List of examples        |
| /api/example/:name   | GET    | Retrieve specific example model  | -                    | JSON model data         |

## 9. Dependencies

**Runtime Dependencies:**
- @monaco-editor/react: ^4.7.0  
- @radix-ui/react-dialog: ^1.1.6  
- @radix-ui/react-dropdown-menu: ^2.1.6  
- @radix-ui/react-label: ^2.1.2  
- @radix-ui/react-separator: ^1.1.2  
- @radix-ui/react-slot: ^1.1.2  
- @radix-ui/react-tabs: ^1.1.3  
- @radix-ui/react-toggle: ^1.1.2  
- @radix-ui/react-toggle-group: ^1.1.2  
- @radix-ui/react-tooltip: ^1.1.8  
- class-variance-authority: ^0.7.1  
- clsx: ^2.1.1  
- file-saver: ^2.0.5  
- fs: ^0.0.1-security  
- jszip: ^3.10.1  
- lucide-react: ^0.476.0  
- next-themes: ^0.4.6  
- react: ^19.0.0  
- react-dom: ^19.0.0  
- react-router: ^7.2.0  
- sonner: ^2.0.1  
- tailwind-merge: ^3.0.2  
- tailwindcss-animate: ^1.0.7  
- vaul: ^1.1.2  

**Development Dependencies:**
- @eslint/js: ^9.21.0  
- @tailwindcss/vite: ^4.0.9  
- @types/file-saver: ^2.0.7  
- @types/node: ^22.13.5  
- @types/react: ^19.0.10  
- @types/react-dom: ^19.0.4  
- @vitejs/plugin-react: ^4.3.4  
- @vitest/coverage-v8: ^3.0.7  
- @vitest/ui: ^3.0.7  
- autoprefixer: ^10.4.20  
- eslint: ^9.21.0  
- eslint-plugin-react-hooks: ^5.0.0  
- eslint-plugin-react-refresh: ^0.4.19  
- globals: ^15.15.0  
- postcss: ^8.5.3  
- tailwindcss: ^4.0.9  
- typescript: ~5.7.2  
- typescript-eslint: ^8.24.1  
- vite: ^6.2.0  
- vitest: ^3.0.7  

---

## 10. Testing & Validation

### 10.1. Unit Testing
- Test individual components and functions
- Validate file parsing logic
- Test simulation algorithms
- Verify UI component rendering

### 10.2. Integration Testing
- Test end-to-end workflow
- Verify file upload and processing
- Test simulation controls
- Validate FPGA visualization

### 10.3. Performance Testing
- Measure rendering performance
- Test with large files
- Evaluate memory usage
- Verify animation smoothness

### 10.4. User Acceptance Testing
- Test with sample users
- Gather feedback on usability
- Verify educational effectiveness
- Identify improvement areas

---

## 11. Security Considerations
- Input validation for all file uploads
- Sanitize user inputs
- Local processing to avoid data transmission
- Secure storage of user files

---


## 12. Conclusion

This Technical Specification outlines a comprehensive, local-first FPGA signal propagation simulator designed for educational use. Teachers can select from preloaded FPGA examples or upload custom `.v` and `.sdf` files, which are processed into a JSON model and rendered on an HTML Canvas. The solution features an integrated code editor, robust simulation controls, detailed error handling, and efficient performance optimizations. Developed in TypeScript and deployable locally via Vite and Express.js—with optional static hosting on Vercel—the simulator effectively bridges FPGA theory with practical, visual learning while ensuring data privacy.

End of Document
