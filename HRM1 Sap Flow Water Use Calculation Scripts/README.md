### **Step-by-Step Explanation of Sap Flow Calculation**

```javascript
// 1. Uncorrected Values
// These are the raw calculation of heatpulse velocities from the inner and outer probe sets. unit is cm/h
const UncorrectedInner = getValueFromData(message.uplink_message.decoded_payload.data, "uncorrected-inner");
const UncorrectedOuter = getValueFromData(message.uplink_message.decoded_payload.data, "uncorrected-outer");

// 2. Applying Asymmetric Offsets
// Offsets are applied to account for sensor missalignment during installation.
// Offsets larger than +/- 5cm/h are not recommended - please refer to user manual.
// The offset values (offset_inner, offset_outer) are subtracted from the uncorrected readings.
const Vh_outer = UncorrectedOuter + offset_outer;
const Vh_inner = UncorrectedInner + offset_inner;

// 3. Correcting the Heat Pulse Velocity for Wounding Effect (Vc)
// Multiply the heat pulse velocities (Vh_outer and Vh_inner) by a correction factor (wc), 
// Wounding Coefficient is typically a fixed value of 1.7823.
const Vc_outer = Vh_outer * wc;
const Vc_inner = Vh_inner * wc;

// 4. Calculating Sap Velocity
// The sap velocity (Vs_outer and Vs_inner) is derived by multiplying the corrected heat pulse velocity (Vc) 
// with the factor (fsv), which is a flow sensitivity value that converts heat pulse velocity into sap velocity.
const Vs_outer = Vc_outer * fsv;
const Vs_inner = Vc_inner * fsv;

// 5. Calculating Sap Flow in kg/h
// The sap flow in each annulus (outer_sapflow and inner_sapflow) is calculated by multiplying sap velocity (Vs) 
// with the annulus area (outer_sapwood_annulus and inner_sapwood_annulus), and dividing by 1000 
// to convert g/hr into kg/hr.
const outer_sapflow = (Vs_outer * outer_sapwood_annulus) / 1000;
const inner_sapflow = (Vs_inner * inner_sapwood_annulus) / 1000;

// 6. Remainder Sap Flow
// User is given two options to calculate teh remainder sap flow, 1st is linear decay and the 2nd is use vc_inner.
// Remainder sapflow is calculated when the sapwood depth is greater than the probe edge.
// Here, the "linear_decay" method uses half of the inner sap velocity to calculate the flow in the remainder.
let rem_sapflow = 0;
if (rem_type === "linear_decay") {
  rem_sapflow = (Vs_inner / 2 * rem_sapwood_annulus) / 1000;
} else if (rem_type === "inner_velocity") {
  rem_sapflow = (Vs_inner * rem_sapwood_annulus) / 1000;
}

// 7. Total Sap Flow
// Finally, the total sap flow is the sum of the outer, inner, and remainder sap flows, giving the final value in kg/h.
const total_sapflow = outer_sapflow + inner_sapflow + rem_sapflow;
