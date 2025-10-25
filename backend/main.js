// backend/main.js
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const DATA_FILE = path.join(__dirname, 'data.json');

function readData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch {
    return [];
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Student: create request
app.post('/api/requests', (req, res) => {
  const { name, roll, reason, requestedFor } = req.body;
  if (!name || !roll || !reason) {
    return res.status(400).json({ error: 'Name, roll, and reason are required' });
  }
  const data = readData();
  const newRequest = {
    id: uuidv4(),
    name,
    roll,
    reason,
    requestedFor: requestedFor || null,
    status: 'pending',
    remarks: '',
    createdAt: new Date().toISOString(),
    scannedAt: null
  };
  data.push(newRequest);
  writeData(data);
  res.status(201).json(newRequest);
});

// Moderator: list or filter
app.get('/api/requests', (req, res) => {
  const data = readData();
  const status = req.query.status;
  if (status) return res.json(data.filter(r => r.status === status));
  res.json(data);
});

// Moderator: approve or reject
app.put('/api/requests/:id/status', (req, res) => {
  const { status, remarks } = req.body;
  const data = readData();
  const idx = data.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Status must be approved or rejected' });
  }

  data[idx].status = status;
  data[idx].remarks = remarks || '';
  writeData(data);
  res.json(data[idx]);
});

// Gatekeeper: scan
app.post('/api/requests/:id/scan', (req, res) => {
  const data = readData();
  const idx = data.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  if (data[idx].status !== 'approved') {
    return res.status(400).json({ error: 'Only approved requests can be scanned' });
  }

  data[idx].status = 'scanned';
  data[idx].scannedAt = new Date().toISOString();
  writeData(data);
  res.json(data[idx]);
});

const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Backend running at http://localhost:${PORT}`));
