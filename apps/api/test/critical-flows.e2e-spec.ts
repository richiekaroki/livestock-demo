import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../src/app.module';

const request = supertest;

describe('Critical API Flows (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication Flow', () => {
    it('should request OTP for login', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login/request')
        .send({ email: 'test@example.com' })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toContain('OTP');
        });
    });

    it('should verify OTP and return tokens', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login/verify')
        .send({ email: 'test@example.com', code: '123456' })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
        });
    });

    it('should reject invalid OTP', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login/verify')
        .send({ email: 'test@example.com', code: '000000' })
        .expect(401);
    });
  });

  describe('Animal Management Flow', () => {
    let authToken: string;

    beforeAll(async () => {
      // Get auth token for protected routes
      const loginResponse = await supertest(app.getHttpServer())
        .post('/api/auth/login/request')
        .send({ email: 'admin@wamfugo.ke' });
      
      const verifyResponse = await supertest(app.getHttpServer())
        .post('/api/auth/login/verify')
        .send({ email: 'admin@wamfugo.ke', code: '123456' });
      
      authToken = verifyResponse.body.accessToken;
    });

    it('should get all animals', () => {
      return request(app.getHttpServer())
        .get('/api/animals')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should create a new animal', () => {
      return request(app.getHttpServer())
        .post('/api/animals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Cow',
          type: 'Cattle',
          breed: 'Holstein',
          health: 'Healthy',
          county: 'Nairobi',
          owner: 'Test Farmer',
          lat: -1.2921,
          lng: 36.8219,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('Test Cow');
        });
    });

    it('should get animal by ID', () => {
      return request(app.getHttpServer())
        .get('/api/animals/1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name');
        });
    });

    it('should update animal', () => {
      return request(app.getHttpServer())
        .patch('/api/animals/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ health: 'Sick' })
        .expect(200)
        .expect((res) => {
          expect(res.body.health).toBe('Sick');
        });
    });
  });

  describe('Health Management Flow', () => {
    let authToken: string;

    beforeAll(async () => {
      const verifyResponse = await supertest(app.getHttpServer())
        .post('/api/auth/login/verify')
        .send({ email: 'admin@wamfugo.ke', code: '123456' });
      
      authToken = verifyResponse.body.accessToken;
    });

    it('should get vaccination records', () => {
      return request(app.getHttpServer())
        .get('/api/vaccinations')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should create vaccination record', () => {
      return request(app.getHttpServer())
        .post('/api/vaccinations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'Foot-and-Mouth',
          date: new Date().toISOString(),
          batchNumber: 'BATCH123',
          veterinarian: 'Dr. Smith',
          animalId: 1,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.type).toBe('Foot-and-Mouth');
        });
    });

    it('should get disease records', () => {
      return request(app.getHttpServer())
        .get('/api/diseases')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should report disease outbreak', () => {
      return request(app.getHttpServer())
        .post('/api/outbreaks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          diseaseType: 'Foot-and-Mouth',
          affectedAnimals: 5,
          suspectedAnimals: 10,
          county: 'Nairobi',
          lat: -1.2921,
          lng: 36.8219,
          reportedBy: 'Field Agent',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.diseaseType).toBe('Foot-and-Mouth');
        });
    });
  });

  describe('Analytics Flow', () => {
    let authToken: string;

    beforeAll(async () => {
      const verifyResponse = await supertest(app.getHttpServer())
        .post('/api/auth/login/verify')
        .send({ email: 'admin@wamfugo.ke', code: '123456' });
      
      authToken = verifyResponse.body.accessToken;
    });

    it('should get dashboard statistics', () => {
      return request(app.getHttpServer())
        .get('/api/stats/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('totalAnimals');
          expect(res.body).toHaveProperty('healthyAnimals');
          expect(res.body).toHaveProperty('sickAnimals');
        });
    });

    it('should get county comparison data', () => {
      return request(app.getHttpServer())
        .get('/api/stats/county-comparison')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should get mortality statistics', () => {
      return request(app.getHttpServer())
        .get('/api/mortality')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should get weight records', () => {
      return request(app.getHttpServer())
        .get('/api/weight')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('Error Handling Flow', () => {
    it('should return 401 for unauthorized access', () => {
      return request(app.getHttpServer())
        .get('/api/animals')
        .expect(401);
    });

    it('should return 404 for non-existent routes', () => {
      return request(app.getHttpServer())
        .get('/api/non-existent')
        .expect(404);
    });

    it('should return 400 for invalid input', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login/request')
        .send({ email: 'invalid-email' })
        .expect(400);
    });

    it('should handle rate limiting', async () => {
      const rateLimitRequests = Array(10).fill(null).map(() =>
        request(app.getHttpServer())
          .post('/api/auth/login/request')
          .send({ email: 'ratelimit@example.com' })
      );

      const responses = await Promise.all(rateLimitRequests);
      const rateLimited = responses.some(res => res.status === 429);
      expect(rateLimited).toBe(true);
    });
  });

  describe('Security Flow', () => {
    it('should reject requests without CORS origin', () => {
      return request(app.getHttpServer())
        .get('/api/animals')
        .set('Origin', 'http://malicious-site.com')
        .expect(401);
    });

    it('should have security headers', () => {
      return request(app.getHttpServer())
        .get('/api/health')
        .expect(200)
        .expect((res) => {
          expect(res.headers).toHaveProperty('x-frame-options');
          expect(res.headers).toHaveProperty('x-content-type-options');
        });
    });
  });
});