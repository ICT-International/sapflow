WARNING:
Mainboard firmware published within are strictly only for updating SFMx-UB models that do not contain IoT communications modules.
* Installing this firmware on models that do have IoT communications may render the device inoperable.
* Please Contact ICT International regarding firmware updating of IoT SFMx models.
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


R1-1-15
Firmware created 9th Feb 2024
Confirmed Stable: 23rd Feb 2024
> Fixes bug where SD card .csv file was previously not showing the correct UCMI Firmware Version.
> Improvements to Main board and UCMI pairing and boot up reliability. 

R1-1-14
Firmware created 15th Nov 2023
Confirmed Stable: 23rd Jan 2024
> Adds feature to automatically shut down SFM instrument after 30minutes when in manual mode to avoid battery discharging for when the following conditions are true:
> 1) No USB Cable connected.
> 2) BlueTooth Connection not connected to software.
> 3) No External supply power connected via the ICT BusPlugs (such as Solar Panel, Battery, PSU, or other power generation systems.)
> 
> Introduces known bug with SFM1x-C Cellular Cat-M1/NB-IoT with UCMI r1-0-13MQTT firmware, work around: UTC time needs to be manually set locally for instrument time.
	
	
R1-1-13
> Beta Only - Deprecated


R1-1-12
Firmware created: 15th Aug 2023
Confirmed Stable: Beta, superseded.
> Force UTF encoding to be read by default when opening CSV in Excel (don't need to import, can just double click).
> SFM and UCMI version in CSV with fixed bug where it added an extra character at the end.
> UTC offset correctly applied to the .csv file.
	> LOCAL TIME = 12PM, Offset = UTC +1, CSV TIME = 11am
	> LOCAL TIME = 12PM, Offset = UTC -1, CSV TIME = 1pm

	
R1-1-11
Firmware created: 4th Jul 2023
Confirmed Stable: Beta, superseded.
> Fix bug where HRM.Vs was only transmitting up to 2 sig figures resulting in truncation of data to CIS (i.e. setting 0.1234 returns 0.1200).
> COMM and APP FW version now in CSV file.
> Re-enabled charging of battery during measurements time.

	
R1-1-10b
Firmware created: 4th Jul 2023
Confirmed Stable: Beta, superseded.
> Correct CAT-M1 UCMI operations. Previous R1-1-8 to R1-1-10a break CAT-M1 UCMI operation.
> Retains interim correction for data spike or error handling from early R1-1-10 implementation.
> Correctly reports battery and charging diagnostics via MQTT message on Cellular SFM1x CAT-M1.
> Measurements taken at the start of each logging interval and stored in the buffer. Introduced in early R1-1-10a/b implementation.


R1-1-10 & R1-1-10a
Firmware created: 3rd May 2023
Confirmed Stable: Beta, superseded.
> Feature removed: -22.2 fault measurements written to SD Card data are not discarded and should use the previous value if a fault is detected.


R1-1-9
Firmware created: 13th Apr 2023
Confirmed Stable: Beta, superseded.
> Adds feature for ability for a user to change what LoRa sub-band the SFM transmits on (region specific).
> IN865 LoRaWAN added (Main board support for UCMI India).
> Adds feature Beta: A user can now enter the latitude and longitude of a device saves to the header on the generated CSV log file.
> General improvements and bugs fixed.


R1-1-7
Firmware created: 3rd May 2022
Confirmed Stable: Nov 2022, superseded.
> Add code change that only allows charging when:
> External power is above 8Volts via BusPlugs/External Power (previously lower)
> Battery charging set to minimum charge rate (low = off) for entire measurement cycle in attempt to improve negative spike data bug.
