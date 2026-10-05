# 🌾 KrishiSetu (कृषिसितू) - Smart Agri-Market Intelligence Platform

> **Smart India Hackathon (SIH) 2026** | **Problem Statement ID 26132**: *"Strengthening market linkages and price discovery for farmers."*  
> **Team Name**: Code Catalyst (Team ID: 118692)

---

## 🚀 Overview

**KrishiSetu** is a smart agri-market intelligence and direct buyer-linkage platform designed to maximize farmer income. By factoring in real-time transport freight costs, moisture loss, and storage fees, KrishiSetu calculates the **true net realization** into a farmer's bank account and provides an AI-driven decision: **SELL NOW** or **HOLD IN WAREHOUSE**.

---

## ✨ Key Features

1. **🌾 True Net Realization Comparator**:
   - Compares gross mandi prices vs net bank realization after deducting transport freight & warehouse holding fees.
   
2. **🧠 AI 30-Day Price Forecast Engine**:
   - Machine learning price projection curves (Onion, Tomato, Soybean, Wheat) based on Agmarknet arrivals, weather, and seasonal demand.

3. **🗣️ 3-Language Multilingual & Voice Guidance**:
   - 100% full translation engine for **English**, **Hindi (हिंदी)**, and **Marathi (मराठी)** across all pages.
   - Built-in Web Speech API voice assistant to speak market recommendations aloud for farmers.

4. **📜 Cryptographic Digital Quality Certificates**:
   - Agmark-verified digital certificates with moisture & foreign matter analysis and unique cryptographic audit hashes.

5. **🚚 Real-Time GPS Fleet Telematics**:
   - Live refrigerated truck location monitoring, reefer temperature sensor logs, and estimated arrival times (ETA).

6. **🏦 Proof of Delivery (PoD) Escrow Settlement**:
   - Direct escrow payment release upon delivery confirmation with feedback loops.

---

## 📁 Repository Structure

```
farmer project/
├── server.js               # Node.js HTTP Server & REST API Endpoints
├── package.json            # Project manifest & dependency configuration
├── .gitignore              # Git ignore rules
├── README.md               # Repository documentation
└── views/
    ├── index.html          # Landing Page (Live Ticker, Price Cards, Multilingual Engine)
    ├── login.html          # Onboarding & Multi-step KYC Portal
    ├── dashboard.html      # React.js Multi-Role Dashboard (Farmer, Buyer, Service Provider)
    └── 404.html            # Custom 404 Error Page
```

---

## 🛠️ Installation & Setup Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v16.0.0 or higher)

### Steps to Run Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/krishisetu.git
   cd krishisetu
   ```

2. **Start the Node.js Server**:
   ```bash
   npm start
   ```

3. **Open in Browser**:
   Visit **[http://localhost:3000](http://localhost:3000)**

---

## 🔗 Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Landing Page & Role Selection |
| `GET` | `/login` | Onboarding & Multi-Step KYC |
| `GET` | `/dashboard` | Multi-Role Dashboard (Farmer / Buyer / Service Provider) |
| `GET` | `/api/market-data` | Live Agmarknet prices & mandi comparison metrics |
| `GET` | `/api/price-forecast` | 30-Day price projection data per crop |
| `POST` | `/api/register` | User onboarding & KYC registration |
| `POST` | `/api/create-lot` | Publish new crop lot to buyer network |
| `POST` | `/api/storage-booking` | Book cold storage / warehouse slot |
| `POST` | `/api/quality-verify` | Generate digital quality certificate |
| `POST` | `/api/confirm-delivery`| Confirm delivery & release escrow payment |

---

## 📄 License

Distributed under the ISC License. See `LICENSE` for more information.
