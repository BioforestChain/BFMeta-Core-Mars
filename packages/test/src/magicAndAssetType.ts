import { getBfchainCoreEntry } from "./include";

(async () => {
  const bfchainCore = await getBfchainCoreEntry();

  const xx = Buffer.from(
    await bfchainCore.asymmetricHelper.cryptoHelper.sha256().update("Q12R").digest(),
  ).toString("hex");

  console.log(xx);
})();
