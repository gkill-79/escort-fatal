import request from 'supertest';
import express from 'express';

const app = express();
app.get('/health', (req, res) => {
  res.status(200).send('Backend is healthy');
});

describe('GET /health', () => {
  it('should return 200 and healthy message', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Backend is healthy');
  });
});
