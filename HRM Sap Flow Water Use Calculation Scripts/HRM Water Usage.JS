/* Heat Ratio Mode Sap Flow Water Usage Calculation for ICT Probe Designs
e.g. 
SFM1     (35mm measurement probes only)
SFM1x    (35mm measurement probes only)
SFS      (35mm, 22.5 or 12mm probes)
*/

// sap_flow_correction.js

// Required modules
const sql = require('mssql');
const math = require('mathjs');
const fs = require('fs');

// Configuration for database connection
const config = {
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  server: process.env.DB_SERVER || '',
  database: process.env.DB_NAME || '',
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

// Main function to process messages
async function processMessages(messages) {
  try {
    console.log('Connecting to the database...');
    await sql.connect(config);
    console.log('Connected to the database.');

    console.log('Received messages:', JSON.stringify(messages));

    if (messages && messages.length > 0) {
      for (let message of messages) {
        // Parsing the message from a string to a JSON object if necessary
        if (typeof message === 'string') {
          message = JSON.parse(message);
        }

        console.log('Parsed message:', JSON.stringify(message));

        // Extract data from the parsed message
        if (message && message.uplink_message && message.uplink_message.decoded_payload) {
          const DeviceID = message.end_device_ids.device_id;
          const Time = new Date(message.received_at);
          const BatteryVoltage = getValueFromData(message.uplink_message.decoded_payload.data, "battery-voltage");
          const UncorrectedInner = getValueFromData(message.uplink_message.decoded_payload.data, "uncorrected-inner");
          const UncorrectedOuter = getValueFromData(message.uplink_message.decoded_payload.data, "uncorrected-outer");

          // --- Metadata ---
          // Specific Tree Parameterisation
          let circumference = 1.3674;         // Circumference of plant at point of measurement in metres, a 10cm radius or 20cm diameter Tree/Plant in this example.
          let bark_thickness = 0.0050;        // Manually measured Bark Thickness in meters, e.g. 0.5cm = 0.0050m
          let sapwood_depth = 0.0420;         // Manually measured Sapwood depth in meters, e.g. 4.2cm = 0.0420m
          let bao_outer = 0;                  // Manually applied Baseline Asymmetry Offset to zero raw incomming data for pre-dawn correction (please see Merlin et al., 2020).
          let bao_inner = 0;                  // Manually applied Baseline Asymmetry Offset to zero raw incomming data for pre-dawn correction (please see Merlin et al., 2020).
          let rem_type = "linear_decay";      // Remainder type, linear_decay or inner_velocity
          // Correction Factors
          let wc = 1.7283;                    // Wounding Coefficient (Table 1, https://doi.org/10.1093/treephys/21.9.589).
          let fsv = 0.64347;                  // Sap Flow Factor, Simplified "Vs" Calculation for Wood and Water Thermal Properties.

      // If defined as 35mm Probe Design:    
          let probe_length = 0.035;           // Probe length in meters, here HRM1/SFM1/SFM1x Probe Set = 3.5cm therefore 0.035m
          let probe_depths = [0.0075, 0.0225];// Depth of measurement point 0 and 1 within the Xylem Tissue.
              /*
                0 reference in array = outer thermistor position within the sapwood (measurement point to the surface of the Xylem).
                1 reference in array = inner thermistor position within the sapwood (measurement point to the surface of the Xylem).
              */
          let probe_edge = 0.030;             // Probe edge in meters, Depth of the probe tip in the Xylem from the installation surface, e.g: probe_depths[1] + 0.0075m
          // Probe edge in future could be automatically caluclated by subtracting the user defined bark_thickness from the probe_lenght, e.g. 0.035 - 0.0050 = 0.030
          
// --- Convert Units from Meters to Centimeters ---
          probe_edge *= 100;
          probe_length *= 100;
          probe_depths = probe_depths.map(pd => pd * 100);
          bark_thickness *= 100;
          sapwood_depth *= 100;
          circumference *= 100;
          let trunk_diameter = circumference / math.pi;

          // --- Calculate Probe Depths and Annulus Widths ---
          let probe_depth1 = probe_length - probe_depths[1];
          let probe_depth2 = probe_length - probe_depths[0];

          // Conditions for annulus calculations
          let outer_annulus_width, inner_annulus_width, rem_annulus_width;
          let outer_sapwood_annulus = 0;
          let inner_sapwood_annulus = 0;
          let rem_sapwood_annulus = 0;

          if (probe_edge >= sapwood_depth && probe_depth2 < sapwood_depth) {
            console.log('Condition 2');
            outer_annulus_width = probe_depth1 + 0.75;
            inner_annulus_width = sapwood_depth - outer_annulus_width;
            inner_sapwood_annulus = (math.pow(((trunk_diameter / 2) - (bark_thickness + outer_annulus_width)), 2) * math.pi) -
              (math.pow(((trunk_diameter / 2) - (bark_thickness + outer_annulus_width + inner_annulus_width)), 2) * math.pi);
            rem_sapwood_annulus = 0;
          } else if (probe_depth2 > sapwood_depth) {
            console.log('Condition 1');
            outer_annulus_width = sapwood_depth;
            inner_sapwood_annulus = 0;
            rem_sapwood_annulus = 0;
          } else if (sapwood_depth > probe_edge) {
            console.log('Condition 3');
            outer_annulus_width = probe_depth1 + 0.75;
            inner_annulus_width = 1.5;
            rem_annulus_width = sapwood_depth - (outer_annulus_width + inner_annulus_width);

            outer_sapwood_annulus = (math.pow(((trunk_diameter / 2) - bark_thickness), 2) * math.pi) -
              (math.pow(((trunk_diameter / 2) - (bark_thickness + outer_annulus_width)), 2) * math.pi);

            inner_sapwood_annulus = (math.pow(((trunk_diameter / 2) - (bark_thickness + outer_annulus_width)), 2) * math.pi) -
              (math.pow(((trunk_diameter / 2) - (bark_thickness + outer_annulus_width + inner_annulus_width)), 2) * math.pi);

            rem_sapwood_annulus = (math.pow(((trunk_diameter / 2) - (bark_thickness + outer_annulus_width + inner_annulus_width)), 2) * math.pi) -
              (math.pow(((trunk_diameter / 2) - (bark_thickness + sapwood_depth)), 2) * math.pi);
          } else {
            // Default values if none of the conditions are met
            outer_annulus_width = 0;
            inner_annulus_width = 0;
            rem_sapwood_annulus = 0;
          }

          // --- Sap Flow Calculations ---
          // Apply BAO offsets to uncorrected heatpulse velocity values (Vh) direct from device.
          const Vh_baoc_outer = UncorrectedOuter + bao_outer; // Correct for Baseline Asymmetry Offset.
          const Vh_baoc_inner = UncorrectedInner + bao_inner; // Correct for Baseline Asymmetry Offset.

          // Corrected Heatpulse Velocity
          const Vc_outer = Vh_baoc_outer * wc; // Corrected Heat Pulse Velocity (Vc) calculated from Wounding Coefficient
          const Vc_inner = Vh_baoc_inner * wc; // Corrected Heat Pulse Velocity (Vc) calculated from Wounding Coefficient

          // Sap Velocities, in cm/hr
          const Vs_outer = Vc_outer * fsv; // Correcting for Sap Velocity Factor (Thermal Properties)
          const Vs_inner = Vc_inner * fsv; // Correcting for Sap Velocity Factor (Thermal Properties)

          // Sap Flow of each annulus, in kg/hr
          const outer_sapflow = (Vs_outer * outer_sapwood_annulus) / 1000; // Converts cm/hr to kg/hr
          const inner_sapflow = (Vs_inner * inner_sapwood_annulus) / 1000; // Converts cm/hr to kg/hr

          // Calculate Remainder Sap Flow
          let rem_sapflow = 0;
          if (rem_type === "linear_decay") {
            rem_sapflow = (Vs_inner / 2 * rem_sapwood_annulus) / 1000;
          } else if (rem_type === "inner_velocity") {
            rem_sapflow = (Vs_inner * rem_sapwood_annulus) / 1000;
          }

          // Total Sap Flow, in kg/hr
          const total_sapflow = outer_sapflow + inner_sapflow + rem_sapflow;

          // --- Collect Data for Hourly and Daily Usage ---
          // Here, we store the data in an array for further processing
          collectedData.push({
            DeviceID,
            Time,
            BatteryVoltage,
            UncorrectedOuter,
            UncorrectedInner,
            Vh_baoc_outer: Vh_baoc_outer,
            Vh_baoc_inner: Vh_baoc_inner,
            CorrectedOuter: Vc_outer,
            CorrectedInner: Vc_inner,
            SapVelocityOuter: Vs_outer,
            SapVelocityInner: Vs_inner,
            OuterSapflow: outer_sapflow,
            InnerSapflow: inner_sapflow,
            RemSapflow: rem_sapflow,
            TotalSapflow: total_sapflow
          });

          // --- Insert Data into the Database ---
          console.log('Inserting data into the database...');
          const insertQuery = `
            INSERT INTO dbo.SensorData (
              DeviceID, Time, BatteryVoltage, UncorrectedInner, UncorrectedOuter,
              VhInner, VhOuter, CorrectedInner, CorrectedOuter, SapVelocityInner, SapVelocityOuter,
              OuterSapflow, InnerSapflow, RemSapflow, TotalSapflow
            ) VALUES (
              @DeviceID, @Time, @BatteryVoltage, @UncorrectedInner, @UncorrectedOuter,
              @VhInner, @VhOuter, @CorrectedInner, @CorrectedOuter, @SapVelocityInner, @SapVelocityOuter,
              @OuterSapflow, @InnerSapflow, @RemSapflow, @TotalSapflow
            )
          `;

          const request = new sql.Request();
          request.input('DeviceID', sql.VarChar, DeviceID);
          request.input('Time', sql.DateTimeOffset, Time);
          request.input('BatteryVoltage', sql.Float, BatteryVoltage);
          request.input('UncorrectedInner', sql.Float, UncorrectedInner);
          request.input('UncorrectedOuter', sql.Float, UncorrectedOuter);
          request.input('VhInner', sql.Float, Vh_inner);
          request.input('VhOuter', sql.Float, Vh_outer);
          request.input('CorrectedInner', sql.Float, Vc_inner);
          request.input('CorrectedOuter', sql.Float, Vc_outer);
          request.input('SapVelocityInner', sql.Float, Vs_inner);
          request.input('SapVelocityOuter', sql.Float, Vs_outer);
          request.input('OuterSapflow', sql.Float, outer_sapflow);
          request.input('InnerSapflow', sql.Float, inner_sapflow);
          request.input('RemSapflow', sql.Float, rem_sapflow);
          request.input('TotalSapflow', sql.Float, total_sapflow);

          await request.query(insertQuery);
          console.log('Data inserted successfully.');
        } else {
          console.log('Data or required properties not found in message.');
        }
      }

      // After processing all messages, calculate hourly and daily water usage
      calculateHourlyAndDailyUsage(collectedData);

    } else {
      console.log('No messages received or messages were not in expected format.');
    }
  } catch (err) {
    console.error('Error occurred:', err);
  } finally {
    sql.close();
    console.log('Database connection closed.');
  }
}

// Helper function to get value from data array
function getValueFromData(dataArray, label) {
  const dataItem = dataArray.find(d => d.label === label);
  return dataItem ? dataItem.value : null;
}

// --- New Functions for Hourly and Daily Water Usage ---

const collectedData = []; // To store all processed data

function calculateHourlyAndDailyUsage(data) {
  // Sort data by time
  data.sort((a, b) => new Date(a.Time) - new Date(b.Time));

  // Calculate Hourly Usage
  const hourlyUsage = {};
  data.forEach(item => {
    const hour = new Date(item.Time);
    hour.setMinutes(0, 0, 0); // Set to the start of the hour
    const hourKey = hour.toISOString();

    if (!hourlyUsage[hourKey]) {
      hourlyUsage[hourKey] = 0;
    }
    // Assume data is recorded every 10 minutes (adjust as needed)
    // So we divide the total sapflow by 6 to get hourly rate
    hourlyUsage[hourKey] += item.TotalSapflow / 6;
  });

  console.log('Hourly Water Usage:');
  console.log(hourlyUsage);

  // Calculate Daily Usage
  const dailyUsage = {};
  data.forEach(item => {
    const day = new Date(item.Time);
    day.setHours(0, 0, 0, 0); // Set to the start of the day
    const dayKey = day.toISOString();

    if (!dailyUsage[dayKey]) {
      dailyUsage[dayKey] = 0;
    }
    // Accumulate total sapflow for the day
    dailyUsage[dayKey] += item.TotalSapflow / 6;
  });

  console.log('Daily Water Usage:');
  console.log(dailyUsage);

  // Optionally, insert hourly and daily usage into the database or write to a file
  // For demonstration, let's write to a JSON file
  fs.writeFileSync('hourly_usage.json', JSON.stringify(hourlyUsage, null, 2));
  fs.writeFileSync('daily_usage.json', JSON.stringify(dailyUsage, null, 2));
}

// --- Entry Point ---
// Assume messages are read from a file or another source
const sampleMessages = require('./examples/sample_messages.json'); // Adjust the path as needed
processMessages(sampleMessages);
