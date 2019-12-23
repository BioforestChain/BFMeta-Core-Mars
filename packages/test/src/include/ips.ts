import * as fs from "fs";

function randomNumber() {
  return Math.ceil(Math.random() * 254);
}
export function getRandomIp() {
  return `${randomNumber()}.${randomNumber()}.${randomNumber()}.${randomNumber()}`;
}

export function getRandomIps(totalIps: number) {
  const ips: string[] = [];
  do {
    const ip = getRandomIp();
    if (!ips.includes(ip)) {
      ips[ips.length] = ip;
    }
    if (ips.length === totalIps) {
      break;
    }
  } while (true);
  return ips;
}

export function getIps(totalIps: number, randomIps?: boolean, ipsPath?: string): string[] {
  if (randomIps) {
    return getRandomIps(totalIps);
  }
  if (!ipsPath) {
    throw new Error("Ips path is require");
  }
  if (!fs.existsSync(ipsPath)) {
    throw new Error("Ips file not exist");
  }
  const { ips } = require(ipsPath);
  return ips.slice(0, totalIps);
}
