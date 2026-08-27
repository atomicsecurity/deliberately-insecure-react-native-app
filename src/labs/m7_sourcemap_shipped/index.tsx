import React from 'react';
import { LabScreen } from '../../components/LabScreen';
// DIRNA-VULN:m7_sourcemap_shipped — release build ships index.android.bundle.map next to the Hermes bundle
export default function M7SourcemapShipped(){ return <LabScreen title="Source map shipped in the release build" owasp={['M7']}
  run={()=>'The release build emits and packages index.android.bundle.map into the APK assets, de-obfuscating the Hermes bundle — real vuln lives in android/app/build.gradle (Hermes source-map emission), added in the Android-shell phase.'} />; }
