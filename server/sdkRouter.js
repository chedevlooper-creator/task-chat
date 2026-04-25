import express from 'express';
import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const sdkRouter = express.Router();

// Middleware to check API key
sdkRouter.use((req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer sk_')) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing API Key' });
  }
  next();
});

// ==========================================
// AI / Conversation Module (Mock)
// ==========================================
sdkRouter.post('/api/ask', (req, res) => {
  const { input, model_name } = req.body;
  res.json({
    output: `Mock response to: "${input}" using model ${model_name || 'default'}`,
    conversation_id: req.body.conversation_id || randomUUID()
  });
});

sdkRouter.get('/models/available', (req, res) => {
  res.json([
    { id: 'model-1', name: 'GPT-4 Mock' },
    { id: 'model-2', name: 'Claude Mock' }
  ]);
});

sdkRouter.get('/personas/available', (req, res) => {
  res.json([
    { id: 'p-1', name: 'Assistant' },
    { id: 'p-2', name: 'Coder' }
  ]);
});

// ==========================================
// Files Module (REAL LOGIC)
// ==========================================
sdkRouter.get('/files/read', async (req, res) => {
  try {
    const filePath = req.query.path;
    const content = await fs.readFile(filePath, 'utf-8');
    res.json({ path: filePath, content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

sdkRouter.post('/files/write', async (req, res) => {
  try {
    const { path: filePath, content } = req.body;
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content, 'utf-8');
    res.json({ success: true, path: filePath, writtenBytes: Buffer.byteLength(content) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

sdkRouter.delete('/files/delete', async (req, res) => {
  try {
    const filePath = req.query.path;
    await fs.unlink(filePath);
    res.json({ success: true, deletedPath: filePath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

sdkRouter.post('/files/grep', async (req, res) => {
  try {
    const { query, path: searchPath } = req.body;
    const { stdout } = await execAsync(`grep -rn "${query}" ${searchPath}`);
    res.json({ matches: stdout.split('\n').filter(Boolean) });
  } catch (err) {
    // grep returns exit code 1 if no matches
    res.json({ matches: [] });
  }
});

// ==========================================
// Web Module (Mock)
// ==========================================
sdkRouter.post('/web/search', (req, res) => {
  const { query } = req.body;
  res.json({
    results: [
      { title: `Result for ${query}`, url: 'https://example.com', snippet: 'Mock snippet' }
    ]
  });
});

sdkRouter.post('/web/read', (req, res) => {
  res.json({ title: 'Mock Page', content: 'This is the extracted content of the page.' });
});

sdkRouter.post('/web/maps', (req, res) => {
  res.json({ location: req.body.query, coordinates: { lat: 0, lng: 0 } });
});

// ==========================================
// Computer Module (REAL LOGIC)
// ==========================================
sdkRouter.post('/computer/bash', async (req, res) => {
  try {
    const { command } = req.body;
    const { stdout, stderr } = await execAsync(command);
    res.json({ stdout, stderr, exitCode: 0 });
  } catch (err) {
    res.json({ stdout: err.stdout || '', stderr: err.stderr || err.message, exitCode: err.code || 1 });
  }
});

sdkRouter.post('/computer/bash/batch', async (req, res) => {
  const { commands } = req.body;
  const results = [];
  for (const cmd of (commands || [])) {
    try {
      const { stdout, stderr } = await execAsync(cmd);
      results.push({ stdout, stderr, exitCode: 0 });
    } catch (err) {
      results.push({ stdout: err.stdout || '', stderr: err.stderr || err.message, exitCode: err.code || 1 });
    }
  }
  res.json(results);
});

sdkRouter.post('/computer/hardware', (req, res) => {
  res.json({ success: true, newSpec: req.body });
});

// ==========================================
// Space, Hosting, Integrations, Commerce, Automations, Personalization (Mock)
// ==========================================
sdkRouter.get('/space/routes', (req, res) => res.json([{ id: 'r-1', path: '/' }]));
sdkRouter.post('/space/restart', (req, res) => res.json({ success: true }));
sdkRouter.post('/sites/:siteId/publish', (req, res) => res.json({ success: true, siteId: req.params.siteId }));
sdkRouter.post('/sites/:siteId/unpublish', (req, res) => res.json({ success: true, siteId: req.params.siteId }));
sdkRouter.get('/integrations/connections', (req, res) => res.json([{ id: 'int-1', provider: 'slack', status: 'connected' }]));
sdkRouter.post('/integrations/:id/action', (req, res) => res.json({ success: true, integrationId: req.params.id, action: req.body.action }));
sdkRouter.post('/commerce/products', (req, res) => res.json({ id: randomUUID(), ...req.body }));
sdkRouter.get('/commerce/products', (req, res) => res.json([{ id: 'prod-1', name: 'Mock Product', price: 99, currency: 'USD' }]));
sdkRouter.post('/commerce/payment-links', (req, res) => res.json({ id: randomUUID(), url: 'https://pay.example.com/mock-link' }));
sdkRouter.get('/commerce/orders', (req, res) => res.json([{ id: 'ord-1', productId: 'prod-1', status: 'paid' }]));
sdkRouter.get('/automations', (req, res) => res.json([{ id: 'auto-1', name: 'Welcome Email', status: 'active', trigger: {}, actions: [] }]));
sdkRouter.get('/automations/:id', (req, res) => res.json({ id: req.params.id, name: 'Mock Auto', status: 'active', trigger: {}, actions: [] }));
sdkRouter.post('/automations', (req, res) => res.json({ id: randomUUID(), ...req.body }));
sdkRouter.put('/automations/:id', (req, res) => res.json({ id: req.params.id, ...req.body }));
sdkRouter.delete('/automations/:id', (req, res) => res.json({ success: true, deletedId: req.params.id }));
sdkRouter.get('/personas', (req, res) => res.json([{ id: 'p-1', name: 'Default', description: 'Standard' }]));
sdkRouter.post('/personas', (req, res) => res.json({ id: randomUUID(), ...req.body }));
sdkRouter.post('/personas/:id/active', (req, res) => res.json({ success: true, activeId: req.params.id }));
sdkRouter.get('/rules', (req, res) => res.json([{ id: 'rule-1', condition: 'always', action: 'allow' }]));
sdkRouter.post('/rules', (req, res) => res.json({ id: randomUUID(), ...req.body }));
sdkRouter.put('/settings', (req, res) => res.json({ success: true, settings: req.body }));
