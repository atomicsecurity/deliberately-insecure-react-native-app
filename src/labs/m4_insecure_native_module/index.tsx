import React from 'react';
import { LabScreen } from '../../components/LabScreen';
import { InsecureBridge } from '../../native/InsecureBridgeModule';

// DIRNA-VULN:m4_insecure_native_module — JS calls the native exec() with an arbitrary shell command
export default function M4InsecureNativeModule() {
  return (
    <LabScreen
      title="Insecure native module (exec / readFile)"
      owasp={['M4', 'M8']}
      run={async () => {
        try {
          const out = await InsecureBridge.exec('id');
          return `InsecureBridge.exec('id') =>\n${out}`;
        } catch (e) {
          return `InsecureBridge.exec error: ${String(e)}`;
        }
      }}
    />
  );
}
