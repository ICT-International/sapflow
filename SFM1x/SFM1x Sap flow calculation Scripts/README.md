# Sap Flow Calculation and Water Usage Estimation

## Overview

This repository contains a versatile JavaScript script designed to process raw sap flow data from SFM1x-LoRa devices. The script converts uncorrected inner and outer heat velocity values into corrected sap flow measurements and calculates hourly and daily water usage. The code is platform-agnostic and can be integrated into various data processing pipelines or platforms.

## Features

- **Data Processing**: Converts raw uncorrected inner and outer heat velocity values into corrected sap flow measurements.
- **Sap Flow Calculations**: Computes sap velocities and total sap flow using scientifically validated formulas.
- **Hourly and Daily Water Usage**: Calculates hourly and daily water usage based on the processed sap flow data.
- **Platform Independence**: The script is designed to be used on any platform that supports Node.js.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Understanding the Calculations](#understanding-the-calculations)
  - [1. Raw Data from SFM1x-LoRa Devices](#1-raw-data-from-sfm1x-lora-devices)
  - [2. Converting Uncorrected Values to Corrected Values](#2-converting-uncorrected-values-to-corrected-values)
  - [3. Sap Flow Calculations](#3-sap-flow-calculations)
  - [4. Hourly and Daily Water Usage Calculations](#4-hourly-and-daily-water-usage-calculations)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Prerequisites

- **Node.js** installed on your machine.
- **npm** (Node Package Manager) for managing dependencies.
- **Sample Data** from SFM1x-LoRa devices in JSON format.

## Installation

