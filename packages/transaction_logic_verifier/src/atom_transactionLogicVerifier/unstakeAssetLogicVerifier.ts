import type { UnstakeAssetTransaction } from "@bfchain/core-model";
import { Injectable, Inject } from "@bfchain/util";
import { AccountBaseHelper } from "@bfchain/core-helper";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { TransactionCore } from "@bfchain/core-transaction";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";

const { ConsensusException } = CoreExceptionGenerator("VERIFIER", "UnstakeAssetLogicVerifier");

@Injectable()
export class UnstakeAssetLogicVerifier extends TransactionLogicVerifier {
  @Inject("bfchain-core:TransactionCore", { dynamics: true })
  public transactionCore!: TransactionCore;

  constructor(
    @Inject(AccountBaseHelper)
    public accountBaseHelper: AccountBaseHelper,
  ) {
    super();
  }

  async verify(
    transaction: UnstakeAssetTransaction,
    currentBlockHeight: number,
    accountMap: Map<string, BFChainCore.AccountInfo>,
    skipListenEvent: boolean,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    const { stakeId, sourceChainMagic, sourceChainName, assetType } =
      transaction.asset.unstakeAsset;

    const frozenAsset = await this.helperLogicVerifier.getFrozenAssetForce(
      transaction.senderId,
      stakeId,
      assetType,
    );
    if (
      frozenAsset.sourceChainMagic !== sourceChainMagic ||
      frozenAsset.sourceChainName !== sourceChainName ||
      frozenAsset.assetType !== assetType
    ) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `stakeAsset: ${JSON.stringify({
          sourceChainMagic: frozenAsset.sourceChainMagic,
          sourceChainName: frozenAsset.sourceChainName,
          assetType: frozenAsset.assetType,
        })}`,
        be_compare_prop: `unstakeAsset: ${JSON.stringify({
          sourceChainMagic,
          sourceChainName,
          assetType,
        })}`,
        to_target: "UnstakeAssetTransaction.asset.unstakeAsset",
        be_target: "StakeAssetTransaction.asset.stakeAsset",
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

  /**
   * 获取需要被加锁的数据
   *
   * @param transaction
   */
  getLockData(transaction: UnstakeAssetTransaction) {
    return [transaction.asset.unstakeAsset.stakeId];
  }
}
