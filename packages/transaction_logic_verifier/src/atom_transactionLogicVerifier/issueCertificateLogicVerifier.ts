import type { IssueCertificateTransaction } from "@bfchain/core-model";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { Injectable, Inject, QueneEventEmitter } from "@bfchain/util";
import { AccountBaseHelper, TransactionHelper } from "@bfchain/core-helper";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "IssueCertificateLogicVerifier",
);

@Injectable()
export class IssueCertificateLogicVerifier extends TransactionLogicVerifier {
  constructor(
    @Inject(AccountBaseHelper) public accountBaseHelper: AccountBaseHelper,
    @Inject(TransactionHelper) public transactionHelper: TransactionHelper,
  ) {
    super();
  }

  async verify(
    transaction: IssueCertificateTransaction,
    currentBlockHeight: number,
    accountMap: Map<string, BFChainCore.AccountInfo>,
    skipListenEvent: boolean,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    await this.logicVerify(transaction, currentBlockHeight, accountMap);

    const { eventLogicVerifier } = this;

    if (skipListenEvent === false) {
      eventLogicVerifier.listenEvent(accountMap, currentBlockHeight, eventEmitter);
    }

    await eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    return true;
  }

  /**
   * 接收交易时调用
   *
   * @param transaction
   * @param currentBlockHeight
   */
  checkCertificateOnChainHeight(
    transaction: IssueCertificateTransaction,
    currentBlockHeight: number,
  ) {
    const certificateId = transaction.asset.issueCertificate.certificateId;
    const onChainHeight = Number(certificateId.split(":")[0]);
    if (onChainHeight < currentBlockHeight) {
      throw new ConsensusException(ERROR_LIST.PROP_SHOULD_GTE_FIELD, {
        prop: `CertificateId on chain height ${onChainHeight}`,
        target: "issueCertificate",
        field: currentBlockHeight,
      });
    }
  }

  /**
   * 在锻造区块，同步和重建时调用
   *
   * @param transaction
   * @param currentBlockHeight
   */
  isCertificateOnChainHeight(transaction: IssueCertificateTransaction, currentBlockHeight: number) {
    const certificateId = transaction.asset.issueCertificate.certificateId;
    const onChainHeight = Number(certificateId.split(":")[0]);
    if (onChainHeight !== currentBlockHeight) {
      throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: `CertificateId on chain height ${onChainHeight}`,
        to_target: "issueCertificate",
        be_compare_prop: currentBlockHeight,
      });
    }
  }

  /**
   * 获取需要被加锁的数据
   *
   * @param transaction
   */
  getLockData(transaction: IssueCertificateTransaction) {
    return [transaction.type];
  }
}
