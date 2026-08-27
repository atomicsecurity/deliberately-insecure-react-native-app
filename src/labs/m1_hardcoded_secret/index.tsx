import React from 'react';
import { LabScreen } from '../../components/LabScreen';
import { FAKE_AWS_KEY } from '../../lib/placeholders';
// DIRNA-VULN:m1_hardcoded_secret — API key hardcoded in the JS bundle
const AWS_SECRET_ACCESS_KEY = FAKE_AWS_KEY;
const STRIPE_KEY = 'sk_live_dirna_EXAMPLE_不要用_1234567890abcd';
export default function M1HardcodedSecret() {
  return <LabScreen title="Hardcoded secret in the bundle" owasp={['M1']}
    run={() => `Loaded key from source: ${AWS_SECRET_ACCESS_KEY} / ${STRIPE_KEY}`} />;
}
