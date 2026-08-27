package com.dirna.vulnerable
import com.facebook.react.bridge.*
import java.io.File
// DIRNA-VULN:m4_insecure_native_module — exposes exec() and readFile() to ALL JS with no checks
class InsecureBridgeModule(c: ReactApplicationContext): ReactContextBaseJavaModule(c) {
  override fun getName() = "InsecureBridge"
  @ReactMethod fun exec(cmd: String, p: Promise) {
    val out = Runtime.getRuntime().exec(arrayOf("sh","-c",cmd)).inputStream.bufferedReader().readText()
    p.resolve(out)
  }
  @ReactMethod fun readFile(path: String, p: Promise) { p.resolve(File(path).readText()) }
}
