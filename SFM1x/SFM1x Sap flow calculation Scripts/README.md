# Sap Flow Calculation and Water Usage Estimation

## Overview

This folder contains a versatile JavaScript script designed to process raw sap flow data from SFM1x-LoRa devices. The script converts uncorrected inner and outer heat velocity values into corrected sap flow measurements and calculates hourly and daily water usage. The code is platform-agnostic and can be integrated into various data processing pipelines or platforms.

## Features

- **Data Processing**: Converts raw uncorrected inner and outer heat velocity values into corrected sap flow measurements.
- **Sap Flow Calculations**: Computes sap velocities and total sap flow using scientifically validated formulas.
- **Hourly and Daily Water Usage**: Calculates hourly and daily water usage based on the processed sap flow data.
- **Platform Independence**: The script is designed to be used on any platform that supports Node.js.

## Usage

1. **Prepare Your Data**

   - Ensure you have raw data from SFM1x-LoRa devices in JSON format.
   - Place your data file (e.g., `sample_messages.json`) in this folder.

2. **Run the Script**

   ```bash
   node sap_flow_calculation.js


Understanding the Calculations
1. Raw Data from SFM1x-LoRa Devices
The SFM1x-LoRa devices measure sap flow by recording heat velocity data at two probe depths:

Uncorrected Inner Heat Velocity (uncorrected-inner)
Uncorrected Outer Heat Velocity (uncorrected-outer)
These raw values are the initial readings and need to be corrected to account for various factors such as probe installation effects and tree-specific properties.

2. Converting Uncorrected Values to Corrected Values
a. Apply Offsets
Offsets correct systematic errors inherent in the measurement process.

Offset Inner (offset_inner): Adjusts the uncorrected inner heat velocity.
Offset Outer (offset_outer): Adjusts the uncorrected outer heat velocity.
javascript
Copy code
const Vh_inner = UncorrectedInner + offset_inner;
const Vh_outer = UncorrectedOuter + offset_outer;
b. Apply Wounding Correction Coefficient (wc)
The wounding correction coefficient accounts for the effect of the probe installation on the sapwood.

wc Value: A factor derived from calibration.
javascript
Copy code
const Vc_inner = Vh_inner * wc;
const Vc_outer = Vh_outer * wc;
c. Calculate Sap Velocity Factor (fsv)
The sap velocity factor adjusts for the thermal properties of the sapwood and the sap (water).

Calculation of fsv:

javascript
Copy code
const fsv = (pb * (cw + (mc * cs))) / (ps * cs);
Where:

pb: Density of sapwood (dry weight/green volume)
cw: Heat capacity of wood
mc: Moisture content
cs: Heat capacity of sap (water)
ps: Density of sap (water)
Simplified: For the purposes of this script, fsv is often provided or calculated based on lab measurements.

javascript
Copy code
const Vs_inner = Vc_inner * fsv;
const Vs_outer = Vc_outer * fsv;
3. Sap Flow Calculations
a. Tree and Probe Physical Parameters
Bark Thickness (bark_thickness): Thickness of the tree's bark.
Sapwood Depth (sapwood_depth): Depth of the sapwood layer where active sap flow occurs.
Trunk Circumference (circumference): Measured at the point of probe installation.
Probe Length (probe_length): Length of the probes inserted into the tree.
Probe Depths (probe_depths): Depths at which the probes measure heat velocity.
All measurements should be in consistent units (e.g., centimeters).

b. Calculate Trunk Diameter
javascript
Copy code
let trunk_diameter = circumference / Math.PI;
c. Calculate Sapwood Annuli Areas
The sapwood is divided into annuli (rings) corresponding to the depths of the probes.

Outer Sapwood Annulus Area (outer_sapwood_annulus)
Inner Sapwood Annulus Area (inner_sapwood_annulus)
Remaining Sapwood Annulus Area (rem_sapwood_annulus)
Calculations involve geometric formulas for the area of concentric circles:

javascript
Copy code
outer_sapwood_annulus = π * [(r_outer)^2 - (r_inner)^2];
Where r_outer and r_inner are the outer and inner radii of the annulus.

d. Calculate Sap Flow for Each Annulus
Sap Flow (kg/hr) = Sap Velocity (cm/hr) × Sapwood Annulus Area (cm²) / 1000
javascript
Copy code
const outer_sapflow = (Vs_outer * outer_sapwood_annulus) / 1000;
const inner_sapflow = (Vs_inner * inner_sapwood_annulus) / 1000;
e. Calculate Remaining Sap Flow
Depending on the chosen method (e.g., linear decay or inner velocity), calculate the sap flow for the remaining sapwood annulus.

javascript
Copy code
if (rem_type === "linear_decay") {
  rem_sapflow = (Vs_inner / 2 * rem_sapwood_annulus) / 1000;
} else if (rem_type === "inner_velocity") {
  rem_sapflow = (Vs_inner * rem_sapwood_annulus) / 1000;
}
f. Total Sap Flow
Sum the sap flow from all annuli:

javascript
Copy code
const total_sapflow = outer_sapflow + inner_sapflow + rem_sapflow;
4. Hourly and Daily Water Usage Calculations
a. Data Collection
As each data point is processed, store it along with its timestamp and total sap flow in an array.

b. Calculate Hourly Water Usage
Group Data by Hour: Round each timestamp to the start of its hour.
Accumulate Sap Flow: Sum the sap flow values within each hour.
Adjust for Measurement Frequency: If measurements are taken every 10 minutes, divide the accumulated sap flow by 6 to get the hourly rate.
javascript
Copy code
hourlyUsage[hourKey] += item.TotalSapflow / 6;
c. Calculate Daily Water Usage
Group Data by Day: Round each timestamp to the start of its day.
Accumulate Sap Flow: Sum the sap flow values within each day.
javascript
Copy code
dailyUsage[dayKey] += item.TotalSapflow / 6;
d. Output Results
The hourly and daily water usage data are stored in JSON files (hourly_usage.json and daily_usage.json) and can be used for further analysis or visualization.