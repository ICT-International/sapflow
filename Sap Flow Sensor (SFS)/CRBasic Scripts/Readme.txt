# CRBasic Programs for Sap Flow and Environmental Sensors

This repository contains a collection of CRBasic programs for Campbell Scientific dataloggers, focused on sap flow measurements and related environmental sensors. Each script demonstrates a different measurement mode or sensor combination, providing practical examples for field deployments, testing, and method comparison.

---

## Contents

### 1. Single Sap Flow Sensor — Standard M! Command  
**File:** `SFS_SingleSensorProgram_ICTINTL.CR1X`  
A basic CRBasic program for operating one Sap Flow Sensor (SFS) using the standard M! command.  
Useful for:
- Simple, single‑probe setups   
- Baseline comparison against more advanced modes  

---

### 2. Multiple Sap Flow Sensors — Concurrent Mode  
**File:** `SFS_MultiSensorProgram_ICTINTL.CR1X`  
Demonstrates how to run multiple SFS probes simultaneously using Concurrent Mode.  
Ideal for:
- Multi‑tree or multi‑probe installations  
- Reducing measurement cycle time  
- Synchronizing heating and measurement windows  

---

### 3. Sap Flow Sensor — High‑Volume Command + Tmax Method  
**File:** `SFS_Raw+Vel_Tmax_HACommand_ICTINTL.CR1X`  
A program implementing the high‑volume (HA) command with the Tmax method, commonly used for:
- High‑resolution sap flow measurements   
- Advanced research applications  

---

### 4. Combined Measurement Example — SFS + ATH‑VPD + SQ421x‑SS  
**File:** `SFS_ATH_SQ_ICTINTL.CR1X`  
A full example showing how to measure:
- Sap Flow Sensor (SFS)  
- ATH‑VPD (Air Temperature, Humidity, and VPD)  
- SQ421x‑SS (Solar radiation / PAR)  
All running concurrently in one integrated program.  
Useful for:
- Complete eco‑physiology setups  
- Sensor intercomparison  
- Environmental context for sap flow data  

---

## Notes
- All programs are written in CRBasic for Campbell Scientific dataloggers.  
- Modify communication addresses, wiring, and scan intervals as needed for your hardware.  
- File names in this README match the files in this repository.  

---
