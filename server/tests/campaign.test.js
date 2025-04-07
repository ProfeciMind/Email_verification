
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Campaign = require('../models/Campaign');

let token;
let userId;
let campaignId;

// Setup before tests
beforeAll(async () => {
  const url = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/email-marketing-test';
  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  
  // Create test user
  const testUser = new User({
    name: 'Campaign Test User',
    email: 'campaign-test@example.com',
    password: 'password123'
  });
  
  await testUser.save();
  userId = testUser._id;
  
  // Login to get token
  const res = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'campaign-test@example.com',
      password: 'password123'
    });
  
  token = res.body.token;
});

// Clear database after tests
afterAll(async () => {
  await User.deleteMany({});
  await Campaign.deleteMany({});
  await mongoose.connection.close();
});

describe('Campaign API', () => {
  // Test campaign creation
  test('Should create a new campaign', async () => {
    const campaignData = {
      name: 'Test Campaign',
      nodes: [
        {
          id: 'node1',
          type: 'leadSource',
          position: { x: 250, y: 100 },
          data: { label: 'Lead Source', source: 'Website' }
        },
        {
          id: 'node2',
          type: 'coldEmail',
          position: { x: 250, y: 200 },
          data: { 
            label: 'Cold Email',
            subject: 'Welcome to our service',
            body: 'Thank you for signing up!',
            emailAddress: 'test-recipient@example.com'
          }
        }
      ],
      edges: [
        {
          id: 'edge1',
          source: 'node1',
          target: 'node2'
        }
      ],
      sequence: [
        [
          {
            id: 'node1',
            type: 'leadSource',
            data: { label: 'Lead Source', source: 'Website' }
          },
          {
            id: 'node2',
            type: 'coldEmail',
            data: { 
              label: 'Cold Email',
              subject: 'Welcome to our service',
              body: 'Thank you for signing up!',
              emailAddress: 'test-recipient@example.com'
            }
          }
        ]
      ]
    };
    
    const res = await request(app)
      .post('/api/campaigns')
      .set('Authorization', `Bearer ${token}`)
      .send(campaignData);
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('name', 'Test Campaign');
    expect(res.body.nodes).toHaveLength(2);
    expect(res.body.edges).toHaveLength(1);
    
    campaignId = res.body._id;
  });
  
  // Test get campaigns
  test('Should get all campaigns for user', async () => {
    const res = await