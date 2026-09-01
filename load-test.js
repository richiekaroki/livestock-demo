import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');
const API_URL = __ENV.API_URL || 'https://wam-mfugo-demo.onrender.com';
const VUS = parseInt(__ENV.VUS || '10');
const DURATION = __ENV.DURATION || '2m';

export const options = {
  vus: VUS,
  duration: DURATION,
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.1'],
    errors: ['rate<0.1'],
  },
};

function login() {
  const res = http.post(
    `${API_URL}/api/auth/request-otp`,
    JSON.stringify({ email: 'loadtest@example.com' }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  return res.status === 200;
}

export default function () {
  // Health check
  const healthRes = http.get(`${API_URL}/api/health`);
  check(healthRes, {
    'health status is 200': (r) => r.status === 200,
    'health response time < 2s': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1);

  sleep(1);

  // Root endpoint
  const rootRes = http.get(`${API_URL}/`);
  check(rootRes, {
    'root status is 200': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(1);

  // Request OTP
  const otpRes = http.post(
    `${API_URL}/api/auth/request-otp`,
    JSON.stringify({ email: 'loadtest@example.com' }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  check(otpRes, {
    'otp request status is 200': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(2);
}

export function handleSummary(data) {
  const success = data.metrics.http_req_failed?.values?.rate < 0.1;
  return {
    stdout: JSON.stringify(data, null, 2),
  };
}
