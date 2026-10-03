const fs = require('fs');
const path = require('path');

/*
 * 번들 시점에 .env의 ENABLE_DEVTOOLS를 읽는다(babel.config.js·metro.config.js 공용).
 * react-native-config는 네이티브 빌드에서 값을 주입하므로 babel·Metro(Node)에서는 직접 파일을 읽어야 한다.
 * .env가 없거나 값이 true가 아니면 운영 빌드로 본다 — 판단이 애매할 때 로그를 지우는 쪽이 안전하다.
 */
const isDevtoolsBuild = () => {
  try {
    const env = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
    return /^ENABLE_DEVTOOLS=true\s*$/m.test(env);
  } catch {
    return false;
  }
};

module.exports = { isDevtoolsBuild };
