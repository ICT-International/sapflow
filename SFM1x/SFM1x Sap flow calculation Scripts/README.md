### **Step-by-Step Explanation of Sap Flow Calculation**

```javascript
// 1. Uncorrected Values
// These are the raw measurements from the inner and outer probes.
const UncorrectedInner = getValueFromData(message.uplink_message.decoded_payload.data, "uncorrected-inner");
const UncorrectedOuter = getValueFromData(message.uplink_message.decoded_payload.data, "uncorrected-outer");

// 2. Applying Offsets
// Offsets are applied to account for sensor biases or inaccuracies. 
// The offset values (offset_inner, offset_outer) are subtracted from the uncorrected readings.
const Vh_outer = UncorrectedOuter + offset_outer;
const Vh_inner = UncorrectedInner + offset_inner;

// 3. Correcting the Heat Pulse Velocity
// Multiply the heat pulse velocities (Vh_outer and Vh_inner) by a correction factor (wc), 
// which compensates for the characteristics of the wood (density, thermal diffusivity, etc.).
const Vc_outer = Vh_outer * wc;
const Vc_inner = Vh_inner * wc;

// 4. Calculating Sap Velocity
// The sap velocity (Vs_outer and Vs_inner) is derived by multiplying the corrected heat pulse velocity (Vc) 
// with the factor (fsv), which is a flow sensitivity value that converts heat pulse velocity into sap velocity.
const Vs_outer = Vc_outer * fsv;
const Vs_inner = Vc_inner * fsv;

// 5. Calculating Sap Flow in kg/hr
// The sap flow in each annulus (outer_sapflow and inner_sapflow) is calculated by multiplying sap velocity (Vs) 
// with the annulus area (outer_sapwood_annulus and inner_sapwood_annulus), and dividing by 1000 
// to convert cm/hr into kg/hr.
const outer_sapflow = (Vs_outer * outer_sapwood_annulus) / 1000;
const inner_sapflow = (Vs_inner * inner_sapwood_annulus) / 1000;

// 6. Remainder Sap Flow
// Depending on the remainder sapwood area, a method is selected to calculate the sap flow in the remaining area of the trunk.
// Here, the "linear_decay" method uses half of the inner sap velocity to calculate the flow in the remainder.
let rem_sapflow = 0;
if (rem_type === "linear_decay") {
  rem_sapflow = (Vs_inner / 2 * rem_sapwood_annulus) / 1000;
} else if (rem_type === "inner_velocity") {
  rem_sapflow = (Vs_inner * rem_sapwood_annulus) / 1000;
}

// 7. Total Sap Flow
// Finally, the total sap flow is the sum of the outer, inner, and remainder sap flows, giving the final value in kg/hr.
const total_sapflow = outer_sapflow + inner_sapflow + rem_sapflow;
