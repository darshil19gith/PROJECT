const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;

// Content types mapping
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// In-Memory Database for KrishiSetu
const db = {
  users: [
    { id: 1, name: 'Ramesh Patil', role: 'farmer', phone: '9876543210', kycStatus: 'verified', location: 'Lasalgaon, Nashik' },
    { id: 2, name: 'AgriCorp Traders Ltd', role: 'buyer', phone: '9811223344', kycStatus: 'verified', location: 'Mumbai APMC' },
    { id: 3, name: 'Apex Warehousing & ColdStorage', role: 'service-provider', subType: 'storage', phone: '9988776655', kycStatus: 'verified', location: 'Nashik Hub' },
    { id: 4, name: 'MahaTrans Agri Logistics', role: 'service-provider', subType: 'logistics', phone: '9988776644', kycStatus: 'verified', location: 'Pune Cluster' },
    { id: 5, name: 'Krishi Quality Labs (Agmark)', role: 'service-provider', subType: 'assessor', phone: '9988776633', kycStatus: 'verified', location: 'Lasalgaon Lab' }
  ],
  marketPrices: [
    { crop: 'Onion (Nashik Red)', currentPrice: 2450, prevPrice: 2200, unit: '₹/qtl', trend: 'up', forecastPeak: 2820, peakDays: 20, holdGain: '+11.6%', verdict: 'HOLD', arrivals: '14,200 qtl' },
    { crop: 'Tomato (Hybrid)', currentPrice: 1800, prevPrice: 1950, unit: '₹/qtl', trend: 'down', forecastPeak: 1750, peakDays: 5, holdGain: '-2.8%', verdict: 'SELL', arrivals: '22,500 qtl' },
    { crop: 'Soybean (Yellow)', currentPrice: 4650, prevPrice: 4600, unit: '₹/qtl', trend: 'up', forecastPeak: 5100, peakDays: 30, holdGain: '+9.6%', verdict: 'HOLD', arrivals: '8,900 qtl' },
    { crop: 'Wheat (Sharbati)', currentPrice: 2850, prevPrice: 2850, unit: '₹/qtl', trend: 'stable', forecastPeak: 2900, peakDays: 15, holdGain: '+1.7%', verdict: 'WAIT', arrivals: '31,000 qtl' }
  ],
  forecastCurves: {
    'Onion (Nashik Red)': {
      days: [1, 5, 10, 15, 20, 25, 30],
      prices: [2450, 2520, 2630, 2740, 2820, 2710, 2580],
      optimalWindow: 'Days 18 – 22',
      grossGain: 370,
      holdingCost: 85,
      netGain: 285,
      gainPct: '+11.6%',
      recommendation: 'HOLD IN WAREHOUSE'
    },
    'Tomato (Hybrid)': {
      days: [1, 5, 10, 15, 20, 25, 30],
      prices: [1800, 1750, 1680, 1600, 1550, 1500, 1450],
      optimalWindow: 'Sell Today (Day 1)',
      grossGain: -350,
      holdingCost: 90,
      netGain: -440,
      gainPct: '-2.8%',
      recommendation: 'SELL IMMEDIATELY'
    },
    'Soybean (Yellow)': {
      days: [1, 5, 10, 15, 20, 25, 30],
      prices: [4650, 4720, 4840, 4980, 5050, 5100, 5020],
      optimalWindow: 'Days 25 – 30',
      grossGain: 450,
      holdingCost: 110,
      netGain: 340,
      gainPct: '+9.6%',
      recommendation: 'HOLD IN WAREHOUSE'
    }
  },
  mandiComparisons: [
    { mandi: 'Lasalgaon APMC', distanceKm: 12, grossPrice: 2450, transportCost: 40, storageCost: 0, netRealization: 2410, rank: '#2 Local' },
    { mandi: 'Pimpalgaon APMC', distanceKm: 28, grossPrice: 2510, transportCost: 90, storageCost: 0, netRealization: 2420, rank: '#3 Regional' },
    { mandi: 'Mumbai APMC (Vashi)', distanceKm: 210, grossPrice: 2850, transportCost: 310, storageCost: 40, netRealization: 2500, rank: '#1 Highest Net Profit 🏆' }
  ],
  logisticsDispatches: [
    {
      dispatchId: 'DISP-9901',
      lotId: 'LOT-1082',
      farmerName: 'Ramesh Patil',
      buyerName: 'AgriCorp Traders Ltd',
      origin: 'Lasalgaon Warehouse #4, Nashik',
      destination: 'Mumbai APMC (Vashi Market)',
      driverName: 'Sunil Gaikwad',
      driverPhone: '+91 9822334455',
      vehicleNo: 'MH-15-EG-4410',
      vehicleType: '10-Tonner Eicher Refrigerated Truck',
      progressPct: 65,
      currentLocation: 'Thane Highway Toll Plaza',
      etaMinutes: 45,
      tempCelsius: '14.2°C',
      status: 'In Transit',
      checkpoints: [
        { name: 'Lasalgaon Pickup Complete', time: '08:30 AM', done: true },
        { name: 'Nashik Transit Checkpoint', time: '10:45 AM', done: true },
        { name: 'Thane Highway Toll Plaza', time: '01:15 PM', done: true },
        { name: 'Mumbai APMC Gate #3 Arrival', time: 'Expected 02:00 PM', done: false }
      ]
    }
  ],
  lots: [
    { id: 'LOT-1082', farmerName: 'Ramesh Patil', crop: 'Onion (Nashik Red)', qty: 150, unit: 'qtl', expectedPrice: 2500, grade: 'Grade A+', status: 'Quality Verified', certificateNo: 'CERT-AGMARK-8891', location: 'Lasalgaon Warehouse #4', createdDate: '2026-10-02' },
    { id: 'LOT-1085', farmerName: 'Suresh Deshmukh', crop: 'Soybean (Yellow)', qty: 200, unit: 'qtl', expectedPrice: 4700, grade: 'Grade A', status: 'Bids Received', certificateNo: 'CERT-AGMARK-9012', location: 'Latur Hub', createdDate: '2026-10-03' },
    { id: 'LOT-1090', farmerName: 'Ganesh Shinde', crop: 'Tomato (Hybrid)', qty: 80, unit: 'qtl', expectedPrice: 1850, grade: 'Grade B', status: 'Order Confirmed', certificateNo: 'CERT-AGMARK-9104', location: 'Narayangaon', createdDate: '2026-10-04' }
  ],
  storageBookings: [
    { id: 'SB-301', farmerName: 'Ramesh Patil', warehouseName: 'Apex Warehousing & ColdStorage', crop: 'Onion', qty: 100, unit: 'qtl', durationDays: 30, estimatedFee: 4500, status: 'Confirmed', checkInDate: '2026-10-05' }
  ],
  qualityRequests: [
    { id: 'QR-401', lotId: 'LOT-1082', farmerName: 'Ramesh Patil', crop: 'Onion', qty: 150, inspector: 'Krishi Quality Labs (Agmark)', moisturePct: '11.2%', foreignMatterPct: '0.4%', gradeAssigned: 'Grade A+', status: 'Certified', certHash: '0x8f9e7a2b' }
  ],
  offers: [
    { id: 'OFF-701', lotId: 'LOT-1082', buyerName: 'AgriCorp Traders Ltd', offeredPrice: 2480, qty: 150, totalVal: 372000, status: 'Pending Farmer Acceptance' }
  ]
};

// Helper: Parse JSON POST Body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

// Create HTTP Server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  console.log(`[${new Date().toLocaleTimeString()}] ${method} ${pathname}`);

  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // ------------------------------------------------------------------
  // REST API ENDPOINTS
  // ------------------------------------------------------------------

  // 1. User Authentication / Login
  if (pathname === '/api/login' && method === 'POST') {
    const data = await parseBody(req);
    const user = db.users.find(u => u.role === (data.role || 'farmer')) || {
      id: Date.now(),
      name: data.identifier || 'Verified User',
      role: data.role || 'farmer',
      kycStatus: 'verified',
      location: 'Nashik Hub'
    };
    res.writeHead(200, MIME_TYPES['.json']);
    res.end(JSON.stringify({
      success: true,
      message: 'Logged in successfully',
      user: user,
      redirectUrl: `/dashboard?role=${user.role}`
    }));
    return;
  }

  // 2. User Registration / Onboarding
  if (pathname === '/api/register' && method === 'POST') {
    const data = await parseBody(req);
    const newUser = {
      id: Date.now(),
      name: data.name || 'New Member',
      role: data.role || 'farmer',
      subType: data.subType || null,
      phone: data.phone || '9876543210',
      kycStatus: 'verified',
      location: data.location || 'Maharashtra APMC'
    };
    db.users.push(newUser);
    res.writeHead(200, MIME_TYPES['.json']);
    res.end(JSON.stringify({
      success: true,
      message: 'Registration & Onboarding completed successfully!',
      user: newUser,
      redirectUrl: `/dashboard?role=${newUser.role}`
    }));
    return;
  }

  // 3. Market Intelligence Data & Prices
  if (pathname === '/api/market-data' && method === 'GET') {
    res.writeHead(200, MIME_TYPES['.json']);
    res.end(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      prices: db.marketPrices,
      mandiComparisons: db.mandiComparisons,
      logisticsDispatches: db.logisticsDispatches
    }));
    return;
  }

  // 3b. Price Forecast Curve API
  if (pathname === '/api/price-forecast' && method === 'GET') {
    const cropQuery = parsedUrl.query.crop || 'Onion (Nashik Red)';
    const forecast = db.forecastCurves[cropQuery] || db.forecastCurves['Onion (Nashik Red)'];
    res.writeHead(200, MIME_TYPES['.json']);
    res.end(JSON.stringify({
      success: true,
      crop: cropQuery,
      forecast: forecast
    }));
    return;
  }

  // 4. Confirm Delivery & Release Escrow Payment (PoD)
  if (pathname === '/api/confirm-delivery' && method === 'POST') {
    const data = await parseBody(req);
    const dispatch = db.logisticsDispatches.find(d => d.dispatchId === (data.dispatchId || 'DISP-9901'));
    if (dispatch) {
      dispatch.status = 'Delivered & Completed ✅';
      dispatch.progressPct = 100;
      dispatch.currentLocation = 'Delivered at Destination Gate #3';
      dispatch.checkpoints[3].done = true;
      dispatch.checkpoints[3].time = new Date().toLocaleTimeString();
    }
    res.writeHead(200, MIME_TYPES['.json']);
    res.end(JSON.stringify({
      success: true,
      message: 'Proof of Delivery (PoD) confirmed! Escrow payment released to farmer account.',
      dispatch: dispatch
    }));
    return;
  }

  // 5. Create Crop Lot
  if (pathname === '/api/create-lot' && method === 'POST') {
    const data = await parseBody(req);
    const newLot = {
      id: `LOT-${Math.floor(1000 + Math.random() * 9000)}`,
      farmerName: data.farmerName || 'Ramesh Patil',
      crop: data.crop || 'Onion',
      qty: Number(data.qty) || 100,
      unit: data.unit || 'qtl',
      expectedPrice: Number(data.expectedPrice) || 2400,
      grade: data.grade || 'Grade A',
      status: 'Published — Awaiting Quality Inspection',
      certificateNo: `CERT-AGMARK-${Math.floor(8000 + Math.random() * 1000)}`,
      location: data.location || 'Lasalgaon Hub',
      createdDate: new Date().toISOString().split('T')[0]
    };
    db.lots.unshift(newLot);
    res.writeHead(200, MIME_TYPES['.json']);
    res.end(JSON.stringify({
      success: true,
      message: 'Crop Lot successfully published to buyer network!',
      lot: newLot
    }));
    return;
  }

  // 6. Book Storage (Warehouse / Cold Storage)
  if (pathname === '/api/storage-booking' && method === 'POST') {
    const data = await parseBody(req);
    const booking = {
      id: `SB-${Math.floor(300 + Math.random() * 700)}`,
      farmerName: data.farmerName || 'Ramesh Patil',
      warehouseName: data.warehouseName || 'Apex Warehousing & ColdStorage',
      crop: data.crop || 'Onion',
      qty: Number(data.qty) || 100,
      unit: 'qtl',
      durationDays: Number(data.durationDays) || 30,
      estimatedFee: (Number(data.qty) || 100) * (Number(data.durationDays) || 30) * 1.5,
      status: 'Confirmed & Slot Reserved',
      checkInDate: new Date().toISOString().split('T')[0]
    };
    db.storageBookings.unshift(booking);
    res.writeHead(200, MIME_TYPES['.json']);
    res.end(JSON.stringify({
      success: true,
      message: 'Storage slot successfully booked!',
      booking: booking
    }));
    return;
  }

  // 7. Quality Certification / Verification
  if (pathname === '/api/quality-verify' && method === 'POST') {
    const data = await parseBody(req);
    const cert = {
      id: `QR-${Math.floor(400 + Math.random() * 600)}`,
      lotId: data.lotId || 'LOT-1082',
      farmerName: data.farmerName || 'Ramesh Patil',
      crop: data.crop || 'Onion',
      qty: data.qty || 150,
      inspector: data.inspector || 'Krishi Quality Labs (Agmark)',
      moisturePct: data.moisturePct || '10.8%',
      foreignMatterPct: data.foreignMatterPct || '0.3%',
      gradeAssigned: data.gradeAssigned || 'Grade A+',
      status: 'Certified',
      certHash: `0x${Math.random().toString(16).substr(2, 8)}`
    };
    // Update lot status
    const lot = db.lots.find(l => l.id === cert.lotId);
    if (lot) {
      lot.status = 'Quality Verified';
      lot.grade = cert.gradeAssigned;
    }
    db.qualityRequests.unshift(cert);
    res.writeHead(200, MIME_TYPES['.json']);
    res.end(JSON.stringify({
      success: true,
      message: 'Digital Quality Certificate issued successfully!',
      certificate: cert
    }));
    return;
  }

  // 8. Get All Lots & Offers (Buyer / Farmer view)
  if (pathname === '/api/lots' && method === 'GET') {
    res.writeHead(200, MIME_TYPES['.json']);
    res.end(JSON.stringify({
      success: true,
      lots: db.lots,
      offers: db.offers,
      storageBookings: db.storageBookings,
      qualityRequests: db.qualityRequests
    }));
    return;
  }

  // 9. Place Buyer Offer
  if (pathname === '/api/make-offer' && method === 'POST') {
    const data = await parseBody(req);
    const offer = {
      id: `OFF-${Math.floor(700 + Math.random() * 300)}`,
      lotId: data.lotId,
      buyerName: data.buyerName || 'AgriCorp Traders Ltd',
      offeredPrice: Number(data.offeredPrice),
      qty: Number(data.qty),
      totalVal: Number(data.offeredPrice) * Number(data.qty),
      status: 'Pending Farmer Acceptance'
    };
    db.offers.unshift(offer);
    
    const lot = db.lots.find(l => l.id === data.lotId);
    if (lot) {
      lot.status = 'Bids Received';
    }

    res.writeHead(200, MIME_TYPES['.json']);
    res.end(JSON.stringify({
      success: true,
      message: 'Purchase offer sent to farmer!',
      offer: offer
    }));
    return;
  }

  // ------------------------------------------------------------------
  // FILE ROUTING & STATIC FILE SERVING
  // ------------------------------------------------------------------

 let filePath = '';

if (pathname === '/' || pathname === '/index.html') {
    filePath = path.join(__dirname, 'index.html');

} else if (pathname === '/login' || pathname === '/register') {
    filePath = path.join(__dirname, 'login.html');

} else if (pathname === '/dashboard') {
    filePath = path.join(__dirname, 'dashboard.html');

} else {
    const requestedPath = pathname.replace(/^\/+/, '');
    filePath = path.join(__dirname, requestedPath);
}
  const contentType = MIME_TYPES[ext] || 'text/html; charset=utf-8';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
       const notFoundPath = path.join(__dirname, '404.html');
        fs.readFile(notFoundPath, (err404, content404) => {
          res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(content404 || '<h1>404 Not Found - KrishiSetu</h1>');
        });
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`
🌾 ========================================================== 🌾
   KRISHISETU - AGRI MARKET INTELLIGENCE PLATFORM (Node.js)
   ----------------------------------------------------------
   🌐 Server running at: http://localhost:${PORT}
   📍 Entry Page:        http://localhost:${PORT}/
   🔑 Auth & Onboard:    http://localhost:${PORT}/login
   📊 Role Dashboard:    http://localhost:${PORT}/dashboard
🌾 ========================================================== 🌾
  `);
});
