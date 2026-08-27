// Obvious, non-functional placeholders. Never real values. // DIRNA-VULN:shared
export const CLEARTEXT_HOST = 'http://10.0.2.2:8080';           // Android emulator host-loopback = a fake local "backend"; obviously non-production
export const FAKE_AWS_KEY = 'AKIAIOSFODNN7EXAMPLE';             // AWS docs example key
export const FAKE_PASSWORD = 'P@ssw0rd123';
export const FAKE_JWT =
  'eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYWRtaW4ifQ.c2ln'; // role=admin, unsigned-ish
