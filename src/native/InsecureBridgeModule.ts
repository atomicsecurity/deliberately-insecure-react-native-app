import { NativeModules } from 'react-native';
// DIRNA-VULN:m4_insecure_native_module — exposes exec()/readFile() to JS with no checks
export const InsecureBridge = NativeModules.InsecureBridge as {
  exec(cmd: string): Promise<string>;
  readFile(path: string): Promise<string>;
};
