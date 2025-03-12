<div align="center">

# Functional Specifications 

---
**Title:** Web FPGA - Functional Specifications

**Team:** Team 7

**Author:** Aurélien FERNANDEZ

**Version:** 0.1

---

</div>


<br><details>
<summary><h2 id="toc"> Table of Contents</h2></summary>

- [Functional Specifications](#functional-specifications)
  - [1. Introduction](#1-introduction)
    - [1.1. Project Overview](#11-project-overview)
    - [1.2. Project Definitions](#12-project-definitions)
      - [1.2.1. Vision](#121-vision)
      - [1.2.2 Objectives](#122-objectives)
      - [1.2.3. Scope](#123-scope)
      - [1.2.4. Target Audience](#124-target-audience)
      - [1.2.5. Deliverables](#125-deliverables)
    - [1.3. Project Organisation](#13-project-organisation)
      - [1.3.1. Project Representatives](#131-project-representatives)
      - [1.3.2. Stakeholders](#132-stakeholders)
      - [1.3.3. Project Reviewers](#133-project-reviewers)
    - [1.4. Project Plan](#14-project-plan)
      - [1.4.1. Planning](#141-planning)
      - [1.4.2. Deliverables](#142-deliverables)
      - [1.4.3. Dependencies](#143-dependencies)
      - [1.4.4. Assumptions and Constraints](#144-assumptions-and-constraints)
        - [Assumptions](#assumptions)
        - [Constraints](#constraints)
  - [2. Mockups](#2-mockups)
  - [2.1. Color Codes](#21-color-codes)
    - [2.2. Simulation Display](#22-simulation-display)
      - [2.2.1. Extended](#221-extended)
      - [2.2.2. Collapsed](#222-collapsed)
    - [2.3. Code Display](#23-code-display)
      - [2.3.1. Expanded](#231-expanded)
      - [2.3.2. Collapsed](#232-collapsed)
    - [2.4. Mix Of Simulation And Code](#24-mix-of-simulation-and-code)
    - [2.5. Commands](#25-commands)
    - [2.6. Animations](#26-animations)
      - [2.6.1. Expanding Examples](#261-expanding-examples)
      - [2.6.2. Collapsing Examples](#262-collapsing-examples)
      - [2.6.3. Adding An Example](#263-adding-an-example)
    - [2.6.4. Exporting An example](#264-exporting-an-example)
    - [2.7. Running simulation](#27-running-simulation)
    - [2.8. Errors](#28-errors)
    - [2.9. FPGA Elements](#29-fpga-elements)
      - [2.9.1. Clock](#291-clock)
      - [2.9.2. LUT](#292-lut)
      - [2.9.3. Flip-Flop](#293-flip-flop)
  - [3. Personas And Use Cases](#3-personas-and-use-cases)
    - [3.1. Personas](#31-personas)
      - [3.1.1. William](#311-william)
      - [3.1.2. Julie](#312-julie)
      - [3.1.3. Justin](#313-justin)
    - [3.2. Use Cases](#32-use-cases)
  - [4. Functional Requirements](#4-functional-requirements)
    - [4.1. Examples](#41-examples)
      - [4.1.1. Overview](#411-overview)
      - [4.1.2. Scenarios](#412-scenarios)
    - [4.2. FPGA Display \& Interaction](#42-fpga-display--interaction)
      - [4.2.1. Overview](#421-overview)
      - [4.2.2. Scenarios](#422-scenarios)
    - [4.3. Code Display \& Execution](#43-code-display--execution)
      - [4.3.1 Overview](#431-overview)
    - [4.4. Error Handling](#44-error-handling)
      - [4.4.1 Overview](#441-overview)
      - [4.4.2 Scenarios](#442-scenarios)
  - [5. Non-functional Requirements](#5-non-functional-requirements)
    - [5.1. Performance](#51-performance)
    - [5.2. Scalability](#52-scalability)
    - [5.3. Usability](#53-usability)
    - [5.4. Reliability](#54-reliability)
    - [5.5. Maintainability](#55-maintainability)

</details>


## 1. Introduction 

### 1.1. Project Overview

This project focuses on developing a web application that allows users to learn FPGA concepts through a simulated environment.

### 1.2. Project Definitions

#### 1.2.1. Vision
Our goal is to deliver an intuitive and reliable platform that accurately represents the inner workings of an FPGA. 

#### 1.2.2 Objectives

- Web application: The software must be accessible through a web application.
- Role system: The software must be separated into two distinct roles:
  - Student
  - Teacher
- Representation of an FPGA board along with elements such as LEDs, buttons and wires to interact with it.

#### 1.2.3. Scope

This software must include:
- An interface to display and simulate the different elements in an FPGA board or connected to it.
- An interface to allow users to write and run their code.
- A teacher's role allows the creation of "rooms" to share with their student. This role should also be able to import their examples to the "rooms".
- A student role able to add, read, update and delete elements from either the code or the simulation interface.

#### 1.2.4. Target Audience

The target audience includes:
- IT teachers and students interested in FPGA technology.
- Individuals seeking to understand how FPGAs work.
  
#### 1.2.5. Deliverables

| Deliverable               | Purpose                                                                                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Functional specifications | Detailed documentation of the features used and their non-technical aspects.                                                                                       |
| Technical specifications  | Detailed documentation on the technical implementation of software.                                                                                                |
| Source code               | The source code of the program.                                                                                                                                    |
| Test plan & Test cases    | A set of scenarios validating the software's performance, and responsivity along with the UI with a defined strategy to run tests more accurately and efficiently. |
| Project charter           | A document to organize a project's objectives and deadlines.                                                                                                       |
| Weekly reports            | A group of documents written at the end of each week to report the progress made during the week.                                                                  |
| User manual               | The end-user documentation for the software.                                                                                                                       |

### 1.3. Project Organisation

#### 1.3.1. Project Representatives

| Full Name                            | Role               | Role Description                                                                                                                                                 |
| ------------------------------------ | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pierre GORIN                         | Project manager    | Responsible for the overall planning, execution, and success of the project.                                                                                     |
| Aurélien FERNANDEZ                   | Program manager    | Ensures the project meets expectations. <br> Is in charge of design. <br> Responsible for writing the Functional Specifications.                                 |
| Abderrazaq MAKRAN                    | Tech lead          | Makes technical decisions for the project. <br> Translates the Functional Specification into Technical Specifications. <br> Performs code review.                |
| Enzo GUILLOUCHE <br> Antoine PREVOST | Software engineers | Writes the code. <br> Writes documentation. <br> Participates in the technical design.                                                                           |  |
| Guillaume DERAMCHI                   | Quality assurance  | Tests the product's functionalities to find bugs and issues. <br> Documents bugs and issues. <br> Writes the test plan. <br> Checks that issues have been fixed. |
| Max BERNARD                          | Technical writer   | Responsible for creating and maintaining the project's documentation.                                                                                            |

#### 1.3.2. Stakeholders

| Role            | Representative | Expectations                                                                    |
| --------------- | -------------- | ------------------------------------------------------------------------------- |
| Client          | Florent MANNI  | Finished project meeting [requirements](https://github.com/LeFl0w/ALGOSUP_POC). |
| School director | Franck JEANNIN | Clear documentation and management based on the skills learnt in class.         |

#### 1.3.3. Project Reviewers

The school director has appointed external project reviewers to review our specifications and provide us with feedback.

### 1.4. Project Plan

#### 1.4.1. Planning

Planning will follow an iterative approach, with each iteration focused on specific functionality, testing, and validation to ensure quality and performance.

#### 1.4.2. Deliverables

| Deliverables              | Date<br>(DD//MM/YYYY) |
| ------------------------- | :-------------------: |
| Functional Specifications |      13/03/2025       |
| Techincal Specifications  |      25/03/2025       |
| Test Plan                 |      25/03/2025       |
| Code & User Manual        |      01/04/2025       |

#### 1.4.3. Dependencies

- An iteration of the project cannot start before tests are run on the current version.
- A project release cannot occur before all tests of the current version are successful.

#### 1.4.4. Assumptions and Constraints

##### Assumptions
| Assumption         | Description                                                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Internet access    | Users will have a stable internet connection while using the web application.                                                               |
| Supported Browsers | The application will run on modern web browsers (e.g., Chrome, Firefox, Edge) but may not support outdated browsers like Internet Explorer. |
| Processing Power   | Users will run the application on standard consumer-grade computers with reasonable CPU/GPU capabilities.                                   |

##### Constraints

| Constraint               | Description                                                                                                                           |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Data Storage             | Files uploaded by the user may be stored temporarily locally for processing but will not be permanently saved due to privacy concerns |
| User Interaction Methods | The web application will be mouse and keyboard-driven, with limited to no support for touchscreen interactions                        |

## 2. Mockups

## 2.1. Color Codes

| Element                                               | Image                                                                                           | Color Code |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------- |
| Main background                                       | ![main-bg](https://github.com/user-attachments/assets/5ca3710a-a4f6-4b50-927b-12ef6283c236)     | #F7F7F7    |
| Top bar and left bar background                       | ![other-bg](https://github.com/user-attachments/assets/c0193931-bd66-4eef-97ef-df2b675bbe2c)    | #FFFFFF    |
| Text                                                  | ![text](https://github.com/user-attachments/assets/089059be-2de4-4b3d-9241-7d0e83932ace)        | #000000    |
| Selected example and selected mode                    | ![selection](https://github.com/user-attachments/assets/d559198e-759f-4931-8c94-4956d0aa58a2)   | #CBDFFE    |
| Buttons (except run, pause and stop) when clicked     | ![onClick](https://github.com/user-attachments/assets/52811a9b-548b-4d92-bd3d-cc5795210358)     | #66A0FA    |
| Run button                                            | ![run](https://github.com/user-attachments/assets/62e38187-ea20-482a-9cac-a9b1c66d8439)         | #5CDC2F    |
| Pause button                                          | ![pause](https://github.com/user-attachments/assets/a7d56798-ccd3-400f-9f3b-e2f1aa3dcf2c)       | #E2E23B    |
| Stop Button                                           | ![stop](https://github.com/user-attachments/assets/a7535fed-a60a-440e-a73c-17ebd4956b98)        | #FF4141    |
| Highlighted FPGA elements when running the simulation | ![highlighted](https://github.com/user-attachments/assets/932bc91f-af55-4a3b-9ee4-1b25760c424b) | #FFFF00    |
| Error notification                                    | ![error](https://github.com/user-attachments/assets/2799d379-b8a0-439f-a639-c7d3cd28c1d0)       | #F9B7B7    |
| Info notification                                     | ![image](https://github.com/user-attachments/assets/3c5ef069-5ae9-4850-a546-f694ab11e808)       | #B7D4F9    |

> [!CAUTION]
> Colors and Mockups might evolve with the project. Do not assume them as definitive.

### 2.2. Simulation Display

#### 2.2.1. Extended 

![Extended simulation](https://github.com/user-attachments/assets/87c8a69a-57d0-413c-a3ae-751fd93dc589)

#### 2.2.2. Collapsed 

![Retracted simulation](https://github.com/user-attachments/assets/9f1bebb7-796f-4fab-8066-62affbf2dc0d)

### 2.3. Code Display

#### 2.3.1. Expanded 

![Code extended](https://github.com/user-attachments/assets/032815f4-f24f-4411-b8c2-d1240bf29a50)

#### 2.3.2. Collapsed

![Code retracted](https://github.com/user-attachments/assets/38c5455b-cbdf-4811-b00d-022d68e3ef96)

### 2.4. Mix Of Simulation And Code

![Mix](https://github.com/user-attachments/assets/48b077c8-ff78-4f9c-b23b-9a85a137d797)

### 2.5. Commands

![Commands](https://github.com/user-attachments/assets/95c311ab-0b35-4688-a234-4c324047ee07)

### 2.6. Animations

#### 2.6.1. Expanding Examples

![Expanding](https://github.com/user-attachments/assets/af4a52a8-adec-4639-8a1f-e4e92bdc5f6f)

#### 2.6.2. Collapsing Examples
![Collapsing](https://github.com/user-attachments/assets/f8166db2-c5fb-40cc-9b24-dee6f2dad95a)

#### 2.6.3. Adding An Example

![Add-example](https://github.com/user-attachments/assets/1e003c8d-30ad-4f96-8213-b1a38b89e1fc)

### 2.6.4. Exporting An example

![Exporting](https://github.com/user-attachments/assets/459b074a-39ef-427a-afbb-8b9e21c087a7)

### 2.7. Running simulation

![Running-simulation](https://github.com/user-attachments/assets/96b40555-e5f2-4427-9c09-6ee097dacfcd)

### 2.8. Errors

![error1](https://github.com/user-attachments/assets/7ed830fc-106d-4f39-9d05-21a6b8be2632)

![error2](https://github.com/user-attachments/assets/45b4d65b-59ec-4c50-86d8-49d64a61e36e)

### 2.9. FPGA Elements

#### 2.9.1. Clock
#### 2.9.2. LUT

A LUT (Look-Up Table) in an FPGA is a fundamental building block used to implement combinational logic functions. It is essentially a small, programmable memory that determines the output for any given input combination

**LUT1**

**LUT2**

**LUT3**

**LUT4**

#### 2.9.3. Flip-Flop

## 3. Personas And Use Cases

### 3.1. Personas

#### 3.1.1. William
![William](https://github.com/user-attachments/assets/b8028eb3-a2f4-4e13-8510-7b0d720c89e4)

#### 3.1.2. Julie
![Julie](https://github.com/user-attachments/assets/b7e9e88a-e2b9-4bfc-9d95-87d8e725485b)

#### 3.1.3. Justin
![Justin](https://github.com/user-attachments/assets/adcc5793-bf1c-4352-9718-61f0986151f5)


### 3.2. Use Cases

| **ID** | **Title**                          | **Description**                                                                                     |
| ------ | ---------------------------------- | --------------------------------------------------------------------------------------------------- |
| 01     | Select an FPGA example             | Users can browse and select one of the preloaded FPGA examples through the web application.         |
| 02     | View 2D FPGA Layout                | Users can see a 2D representation of the FPGA, highlighting the used BELs and signal routes.        |
| 03     | Navigate FPGA Layout               | Users can zoom in, zoom out, and move around the FPGA layout for better visualization.              |
| 04     | Simulate Signal Propagation        | Users can play the simulation to observe how signals propagate through the FPGA over time.          |
| 05     | Adjust Simulation Speed            | Users can change the simulation speed (e.g., x1, x2, x4) for better understanding.                  |
| 06     | Step Through Simulation            | Users can advance the simulation step by step to analyze signal changes in detail.                  |
| 07     | Pause and Resume Simulation        | Users can pause and resume the simulation as needed.                                                |
| 08     | View Documentation & How-To Guides | Users can access documentation on how to use the system, run simulations, and add new FPGA designs. |

## 4. Functional Requirements

### 4.1. Examples

#### 4.1.1. Overview

Prebuilt examples are available for users to explore. Users can also import their own FPGA examples.

#### 4.1.2. Scenarios

| Scenario                   | Description                                                      | Software Response                                                                               |
| -------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Loading an example         | The user loads a prebuilt example.                               | The code and the example simulation will appear and can be run or updated by the user.          |
| Importing  an example      | The user uploads a .V file and a .SDF file.                      | The components and the connections will be created on the simulation side.                      |
| Exporting  an example      | The user exports a scenario.                                     | The system generates a .zip file containing the .V and .SDF files, making the example reusable. |
| Importing  an invalid file | The user uploads a file that is not one of the required formats. | The system displays an error message specifying the unsupported file type.                      |

### 4.2. FPGA Display & Interaction
  
#### 4.2.1. Overview

Users can view, edit, and execute Verilog code for the FPGA example. The system provides real-time error checking and feedback.

#### 4.2.2. Scenarios

| Scenario                 | Description                                                   | Software Response                                                                      |
| ------------------------ | ------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Dragging of a component  | The user clicks and drags a component using the mouse         | The component moves along with the cursor until released.                              |
| Connection removal       | The user selects a wire and presses the delete key.           | The wire disappears, and the FPGA layout updates accordingly.                          |
| Creation of a connection | The user clicks on a connection node and drags it on another. | A new wire will appear connecting the two components.                                  |
| Invalid connection       | The user attempts to create an unsupported connection.        | The system prevents the connection and displays an error message explaining the issue. |

### 4.3. Code Display & Execution

#### 4.3.1 Overview

| Scenario                    | Description                                                | Software response                                                                        |
| --------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Run simulation              | The user presses the "Run" button.                         | The simulation executes, showing signal propagation and changes in the FPGA layout.      |
| Modify and run updated code | The user edits the Verilog code and reruns the simulation. | The system compiles the new code and updates the FPGA visualization accordingly.         |
| Run code with errors        | The user runs code that contains syntax errors.            | The system halts execution and highlights the error location with a descriptive message. |

### 4.4. Error Handling

#### 4.4.1 Overview

The program can detect errors and should notify the user.

#### 4.4.2 Scenarios

| Scenario                                      | Description                                                         | Software response                                                                                                   |
| --------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Code error                                    | The user runs or exports the code with an error.                    | The simulation will not run/export, and a banner will appear on the top right displaying the error and line number. |
| Incorrect file type when importing an example | The user imports a file with an incorrect format.                   | The system rejects the import and specifies which file type is invalid.                                             |
| Missing required files                        | The user provides only a .V or.SDF file when both are required.     | The system prompts the user to upload the missing file before proceeding.                                           |
| Incorrect connection                          | The user connects incompatible nodes and runs the simulation.       | The system halts execution and highlights the error with a message describing the issue.                            |
| Simulation failure due to logic error         | The simulation runs but produces incorrect or unexpected behaviour. | The system logs warnings, highlights problematic signals, and suggests debugging steps.                             |

## 5. Non-functional Requirements

### 5.1. Performance

- The web application must respond to user actions within **100 milliseconds** to ensure a seamless user experience.

### 5.2. Scalability

- The web application must efficiently handle large FPGA examples without significant performance degradation that could impact user experience.
- The system should support FPGA designs with **at least 10 components and 30 connections (3 per component)** while maintaining a response time below Z milliseconds for key interactions (e.g., dragging, zooming, and simulation updates).

### 5.3. Usability

- The web application must support **.V and .SDF formats** to load FPGA examples to meet client expectations.
- Clear documentation to facilitate users' use of the web application.

### 5.4. Reliability

- The system must ensure **high availability**, minimizing downtime and disruptions.
- The application must implement **robust error handling** to gracefully manage invalid inputs and unexpected behaviours.

### 5.5. Maintainability 

- The codebase must follow **best practices** for readability and maintainability, with **sufficient inline comments** and comprehensive documentation.
- The architecture should allow for future updates and improvements to the simulation algorithms.
