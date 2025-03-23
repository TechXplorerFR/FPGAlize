
<div align="center">

# Technical Specification  
**Project:** Web FPGA Signal Propagation Simulator  
**Version:** 1.1  
**Date:** 23/03/2025

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
  - [2. System Overview](#2-system-overview)
    - [2.1. Technology Stack](#21-technology-stack)
    - [2.2. Architecture](#22-architecture)
    - [2.3. Data Model](#23-data-model)
      - [2.3.1. FPGA Visualization JSON](#231-fpga-visualization-json)
    - [2.4. Communication Flow](#24-communication-flow)
    - [2.5. Deployment Strategy](#25-deployment-strategy)
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
    - [8.5. JSON Model Structure](#85-json-model-structure)
  - [9. Dependencies](#9-dependencies)
  - [10. Testing \& Validation](#10-testing--validation)
  - [11. Conclusion](#11-conclusion)

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

| Term           | Definition                                                                                       |
|----------------|--------------------------------------------------------------------------------------------------|
| **FPGA**       | Field-Programmable Gate Array; a reconfigurable integrated circuit for custom digital logic.     |
| **BEL**        | Basic Element; a fundamental component within an FPGA (e.g., LUT, flip-flop, Block RAM).         |
| **SDF**        | Standard Delay Format; a file format containing timing delay information.                        |
| **Verilog**    | A hardware description language used to design and simulate digital circuits.                    |
| **Netlist**    | A structural representation of an FPGA design, detailing its components and connections.         |
| **Synthesis**  | The process of converting Verilog code into a netlist.                                           |
| **P&R**        | Place and Route; mapping netlist components onto FPGA resources and determining routing paths.   |
| **Simulation** | Modeling signal propagation over time to test and validate digital designs.                      |
| **JSON Model** | A structured data format representing FPGA components and signals for visualization purposes.    |

---

## 2. System Overview

### 2.1. Technology Stack
**Frontend:**
- React + Vite (TypeScript)
- TailwindCSS
- HTML Canvas (for 2D FPGA layout rendering)
- Socket.io (optional for real-time updates)

**Backend:**
- Node.js + Express.js (TypeScript)
- File Parsing Libraries (for `.v` and `.sdf` files)

**Deployment:**
- Local deployment via Vite (frontend) and Express.js (backend)
- Option for static deployment on Vercel for the frontend
- Optional Docker for containerized testing

### 2.2. Architecture
Text Diagram:
```
[Web Browser UI]
       │
       ▼
[React Application (Vite)]
       │
       ▼
[Express.js Backend (Node.js)]
       │
       ▼
[File Parser (.v, .sdf)]
```
- **Frontend:** Handles UI interactions, code editing, simulation control, and renders FPGA layouts using HTML Canvas.
- **Backend:** Processes file uploads, parses `.v` and `.sdf` files, and returns a JSON model.
- **Communication:** Uses HTTP for data transfer and optionally Socket.io for live updates.

### 2.3. Data Model

#### 2.3.1. FPGA Visualization JSON
Text Diagram:
```
Elements  -->  Connections
```
**Example Structure:**
```
{
  "elements": [
    {
      "id": 0,
      "name": "LUT4",
      "type": "logic_gate",
      "icon": "path/to/icon.png",
      "inputs": [
        { "connectionId": 1, "name": "A" },
        { "connectionId": 2, "name": "B" }
      ],
      "outputs": [
        { "connectionId": 3, "name": "OUT" }
      ]
    }
  ],
  "connections": [
    {
      "id": 1,
      "from": "input_id_A",
      "to": "output_id_BEL1",
      "color": "blue",
      "time": 2
    }
  ]
}
```
- **elements:** Describes FPGA components.
- **connections:** Describes wiring between components with timing data.

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
  - Integrated editor (e.g., Monaco) with Verilog syntax highlighting.
  - Supports real-time or on-demand compilation to update the FPGA visualization.
- **Simulation Controls:**  
  - **Play:** Start simulation.
  - **Pause:** Halt simulation.
  - **Step:** Advance simulation by one time unit.
  - **Speed:** Adjust playback rate (x1, x2, x4, etc.).
  - **Reset:** Return the simulation to its initial state.
  - Clear error messages are shown if compilation or simulation fails.

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

- **Header:** Contains navigation options (e.g., "Code", "Simulation") and control buttons (Play, Pause, Step, Speed, Export).
- **Left Panel:** Displays the code editor for Verilog, showing preloaded examples or uploaded files.
- **Right Panel:** Renders the FPGA layout on HTML Canvas.
- **Footer:** Provides additional controls (zoom, pan) and displays status messages.

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
- **Input Validation:**  
  - Validate file types before upload (only `.v` and `.sdf` allowed).
  - Provide immediate, user-friendly error messages (e.g., "Unsupported file format. Please upload a `.v` or `.sdf` file.").
- **UI Fallbacks:**  
  - Display alerts or error banners if file parsing fails or simulation errors occur.
  - Utilize global error boundaries to capture unexpected issues.
- **Logging:**  
  - Capture and log client-side errors (using tools like Sentry) for debugging.

### 5.2. Backend Error Handling
- **HTTP Error Responses:**  
  - Return structured error responses with appropriate status codes (400, 404, 500) in JSON format.
  - Include detailed messages (e.g., "Error: Invalid `.sdf` file format.").
- **File Parsing Validation:**  
  - Validate the syntax and structure of `.v` and `.sdf` files; return detailed errors if invalid.
- **WebSocket Management:**  
  - If used, implement automatic reconnection and handle malformed messages gracefully.
- **Logging:**  
  - Log error details (e.g., file names, request IDs) locally for troubleshooting.

---

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
   - Offer export/backup functionality.
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
Text Diagram:
```
[Web Browser UI]
       │
       ▼
[React Application (Vite)]
       │
       ▼
[Express.js Backend (Node.js)]
       │
       ▼
[File Parser (.v, .sdf)]
```

### 8.2. File Processing Flow
Text Diagram:
```
[Upload Files] → [Validate Format] → [Parse Content] → [Generate JSON Model] → [Return JSON to Frontend]
```

### 8.3. User Interaction Flow
Text Diagram:
```
[Select Example / Upload Files] → [Receive Processing Feedback] → [Display Code in Editor] → [Render FPGA Layout on Canvas] → [Control Simulation (Play, Pause, Step, Speed)]
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

### 8.5. JSON Model Structure
Text Diagram:
```
[metadata] → [components] → [signals]
```
Example Structure:
```
{
  "metadata": {
    "name": "example_design",
    "components": 42,
    "signals": 156,
    "timeUnits": "ns",
    "totalDuration": 100
  },
  "components": [
    {
      "id": "comp1",
      "type": "FF",
      "x": 10,
      "y": 20,
      "width": 5,
      "height": 5,
      "connections": ["sig1", "sig2"]
    }
  ],
  "signals": [
    {
      "id": "sig1",
      "source": "comp1",
      "target": "comp2",
      "path": [[10, 20], [15, 20], [15, 30]],
      "timing": [
        {"time": 0, "value": 0},
        {"time": 5, "value": 1},
        {"time": 10, "value": 0}
      ]
    }
  ]
}
```

---

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

- **Unit Tests:**  
  - Validate file parsing from `.v` and `.sdf` to JSON.  
  - Test simulation control logic (play, pause, step, speed).  
  - Verify error handling for invalid file formats and inputs.
- **Integration Tests:**  
  - Ensure complete workflow: file upload → parse → visualize → simulate.  
  - Confirm correct responses from API endpoints and, if applicable, real-time updates.
- **User Acceptance Tests (UAT):**  
  - Teachers and students test the system by loading examples, editing code, and running simulations.  
  - Ensure clear, descriptive error messages and a responsive UI.
- **Performance Tests:**  
  - Assess rendering performance with typical FPGA designs.  
  - Evaluate responsiveness with large file inputs and multiple interactions.

---

## 11. Conclusion

This Technical Specification outlines a comprehensive, local-first FPGA signal propagation simulator designed for educational use. Teachers can select from preloaded FPGA examples or upload custom `.v` and `.sdf` files, which are processed into a JSON model and rendered on an HTML Canvas. The solution features an integrated code editor, robust simulation controls, detailed error handling, and efficient performance optimizations. Developed in TypeScript and deployable locally via Vite and Express.js—with optional static hosting on Vercel—the simulator effectively bridges FPGA theory with practical, visual learning while ensuring data privacy.

End of Document
