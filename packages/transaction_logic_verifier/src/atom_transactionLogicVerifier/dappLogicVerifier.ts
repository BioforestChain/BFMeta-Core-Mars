import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import type { DAppTransaction } from "@bfchain/core-model";
import { Injectable } from "@bfchain/util";
import { CoreExceptionGenerator, NOT_EXIST, NOT_MATCH } from "@bfchain/core-util-exception";
const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "ToExchangeSpecialAssetLogicVerifier",
);

@Injectable()
export class DAppLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: DAppTransaction,
    currentBlockHeight: number,
    accountGetterHelper = this.accountGetterHelper,
    transactionGetterHelper = this.transactionGetterHelper,
  ) {
    const Function_Exception_Detail = {
      function: "verify",
    } as const;
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }

    const { purchaseAsset } = transaction.asset.dapp;

    if (purchaseAsset) {
      const { sourceChainMagic, sourceChainName, assetType } = purchaseAsset;

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
          be_target: "destoryAsset",
          ...Function_Exception_Detail,
        });
      }
    }

    const sender = await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountGetterHelper,
      transactionGetterHelper,
    );

    return true;
  }
}
