#!/usr/bin/env bash
# One-time Android/JDK toolchain for building DIRNA. Idempotent. Run as `user`.
set -euo pipefail
SDK=/home/user/android-sdk
CLT_ZIP=/tmp/cmdline-tools.zip
JAVA_HOME=/usr/lib/jvm/temurin-17-jdk-amd64
sudo apt-get update -y
sudo apt-get install -y unzip curl ca-certificates gnupg
# Debian 13 (trixie) no longer packages openjdk-17 (only 21/25), so pull a
# genuine JDK 17 from Eclipse Temurin (Adoptium). Installs to $JAVA_HOME.
if [ ! -x "$JAVA_HOME/bin/java" ]; then
  sudo install -d -m 0755 /etc/apt/keyrings
  curl -fsSL https://packages.adoptium.net/artifactory/api/gpg/key/public \
    | sudo gpg --dearmor --yes -o /etc/apt/keyrings/adoptium.gpg
  echo "deb [signed-by=/etc/apt/keyrings/adoptium.gpg] https://packages.adoptium.net/artifactory/deb $(. /etc/os-release && echo "$VERSION_CODENAME") main" \
    | sudo tee /etc/apt/sources.list.d/adoptium.list >/dev/null
  sudo apt-get update -y
  sudo apt-get install -y temurin-17-jdk
fi
mkdir -p "$SDK/cmdline-tools"
if [ ! -x "$SDK/cmdline-tools/latest/bin/sdkmanager" ]; then
  curl -fsSL -o "$CLT_ZIP" https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
  unzip -q -o "$CLT_ZIP" -d "$SDK/cmdline-tools"
  mv "$SDK/cmdline-tools/cmdline-tools" "$SDK/cmdline-tools/latest"
fi
export ANDROID_HOME="$SDK" JAVA_HOME
export PATH="$SDK/cmdline-tools/latest/bin:$SDK/platform-tools:$PATH"
# `yes` SIGPIPEs (exit 141) when sdkmanager stops reading its stdin; isolate the
# pipeline from `set -o pipefail` so that benign 141 doesn't abort the script.
# With pipefail off the pipeline returns sdkmanager's status, so a real license
# failure still propagates under `set -e`.
( set +o pipefail; yes | sdkmanager --licenses >/dev/null )
sdkmanager --install "platform-tools" "platforms;android-35" "build-tools;35.0.0"
cat > /home/user/.dirna-env <<EOF
export ANDROID_HOME=$SDK
export JAVA_HOME=$JAVA_HOME
export PATH=\$ANDROID_HOME/cmdline-tools/latest/bin:\$ANDROID_HOME/platform-tools:\$ANDROID_HOME/build-tools/35.0.0:\$JAVA_HOME/bin:\$PATH
EOF
echo "OK: toolchain ready. 'source ~/.dirna-env' before builds."
