import React from 'react';
import { LabScreen } from '../../components/LabScreen';
// DIRNA-VULN:m8_backup_cleartext — allowBackup="true" + cleartext-permitted network security config
export default function M8BackupCleartext(){ return <LabScreen title="allowBackup=true + cleartext-permitted NSC" owasp={['M8']}
  run={()=>'The app allows full ADB/cloud backup of its private data (android:allowBackup="true") and permits cleartext traffic app-wide — real vuln lives in android/app/src/main/AndroidManifest.xml (allowBackup) and android/app/src/main/res/xml/network_security_config.xml (cleartextTrafficPermitted="true"), added in the Android-shell phase.'} />; }
