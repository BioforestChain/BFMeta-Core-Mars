import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import type { GiftAssetTransaction } from "@bfchain/core-model";
import { Injectable } from "@bfchain/util";
import { CoreExceptionGenerator, NOT_EXIST, NOT_MATCH } from "@bfchain/core-util-exception";
const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "TransactionLogicVerifier",
);

@Injectable()
export class GiftAssetLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: GiftAssetTransaction,
    currentBlockHeight: number,
    accountGetterHelper = this.accountGetterHelper,
    transactionGetterHelper = this.transactionGetterHelper,
  ) {
    const Function_Exception_Detail = {
      function: "logicVerify",
    } as const;
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }

    const { sourceChainMagic, assetType, sourceChainName } = transaction.asset.giftAsset;

    const memAsset = await accountGetterHelper.getAsset(sourceChainMagic, assetType);

    if (!memAsset) {
      throw new ConsensusException(NOT_EXIST, {
        prop: `chain with magic ${sourceChainMagic}`,
        target: "blockChain",
        ...Function_Exception_Detail,
      });
    }

    if (memAsset.sourceChainName !== sourceChainName) {
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: "sourcehChainName",
        be_compare_prop: "chainName",
        to_target: "chain asset",
        be_target: "giftAsset",
        ...Function_Exception_Detail,
      });
    }

    await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountGetterHelper,
      transactionGetterHelper,
    );

    return true;
  }
}
