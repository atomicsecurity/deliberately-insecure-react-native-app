import React from 'react';
import { LabScreen } from '../../components/LabScreen';
// DIRNA-VULN:m7_no_hardening — release is debuggable, has no root detection and no obfuscation
export default function M7NoHardening(){ return <LabScreen title="Debuggable + no root detection + no obfuscation" owasp={['M7']}
  run={()=>'The release build is debuggable, ships no root/emulator detection, and disables obfuscation (minifyEnabled false / no proguard) — real vuln lives in android/app/src/main/AndroidManifest.xml (android:debuggable="true") and android/app/build.gradle, added in the Android-shell phase.'} />; }
