import { getBfchainCoreEntry } from "./include";

const bfchainCore = getBfchainCoreEntry();

const xx = Buffer.from(
  bfchainCore.asymmetricHelper.cryptoHelper.sha256().update("Q12R").digest(),
).toString("hex");

console.log(xx);
