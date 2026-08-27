import React from 'react';
import { LabScreen } from '../../components/LabScreen';
// DIRNA-VULN:m8_exported_deeplink — exported MainActivity + insecure dirna:// / http deep-link intent-filter
export default function M8ExportedDeeplink(){ return <LabScreen title="Exported Android component + insecure deep-link intent-filter" owasp={['M8']}
  run={()=>'MainActivity is exported with browsable dirna:// and http intent-filters, so any app or web page can launch it and drive the deep-link surface — real vuln lives in android/app/src/main/AndroidManifest.xml (android:exported="true" + <intent-filter>), added in the Android-shell phase.'} />; }
