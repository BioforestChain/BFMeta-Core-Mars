import { ParityBitHelper } from "@bfchain/core-helper";

const parityBitHelper = new ParityBitHelper();

function getRandomMagic() {
  return parityBitHelper.createMagic();
}

function getRandomDAppId() {
  return parityBitHelper.createDAppId();
}

const words = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";
function getRandomCertificateId() {
  let prefix = `${Math.ceil(Math.random() * 10 ** 8)}:`;
  const len = Math.ceil(Math.random() * (100 - prefix.length));
  let suffix = "";
  for (let i = 0; i < len; i++) {
    suffix += words[Math.floor(Math.random() * words.length)];
  }
  return `${prefix}${suffix}`;
}

export { getRandomMagic, getRandomDAppId, getRandomCertificateId };
