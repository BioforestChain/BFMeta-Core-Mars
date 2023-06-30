import type { DestroyCertificateTransaction } from "@bfchain/core-model";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { Injectable, QueneEventEmitter } from "@bfchain/util";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";

const { ConsensusException } = CoreExceptionGenerator("VERIFIER", "TransactionLogicVerifier");

@Injectable()
export class DestroyCertificateLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: DestroyCertificateTransaction,
    currentBlockHeight: number,
    accountMap: Map<string, BFChainCore.AccountInfoAndAssets>,
    skipListenEvent: boolean,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    const { sourceChainMagic, sourceChainName, certificateId, type } =
      transaction.asset.destroyCertificate;

    const memCertificate = await this.helperLogicVerifier.isCertificateExist(
      sourceChainName,
      sourceChainMagic,
      certificateId,
      currentBlockHeight,
    );

    if (memCertificate.applyAddress !== transaction.recipientId) {
      throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: `recipientId ${transaction.recipientId}`,
        to_target: "transaction",
        be_compare_prop: `certificate apply account address ${memCertificate.applyAddress}`,
      });
    }

    if (memCertificate.type !== type) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `type ${type}`,
        be_compare_prop: `type ${memCertificate.type}`,
        to_target: "transaction",
        be_target: "issueCertificateTransaction",
      });
    }

    await this.logicVerify(transaction, currentBlockHeight, accountMap);

    const { eventLogicVerifier } = this;

    if (skipListenEvent === false) {
      eventLogicVerifier.listenEvent(accountMap, currentBlockHeight, eventEmitter);
    }

    await eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    return true;
  }
}
