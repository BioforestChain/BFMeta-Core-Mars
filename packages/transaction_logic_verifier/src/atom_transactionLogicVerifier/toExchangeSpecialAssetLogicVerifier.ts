import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { ToExchangeSpecialAssetTransaction, EXCHANGE_DIRECTION } from "@bfchain/core-model";
import { Injectable } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  NOT_EXIST,
  ASSET_NOT_EXIST,
  NOT_MATCH,
} from "@bfchain/core-util-exception";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "ToExchangeSpecialAssetLogicVerifier",
);

@Injectable()
export class ToExchangeSpecialAssetLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: ToExchangeSpecialAssetTransaction,
    currentBlockHeight: number,
    accountGetterHelper?: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface,
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

    const toExchangeSpecialAssetAsset = transaction.asset.toExchangeSpecialAsset;
    const {
      beExchangeSource,
      beExchangeChainName,
      beExchangeAsset,
      exchangeDirection,
    } = toExchangeSpecialAssetAsset;
    if (exchangeDirection === EXCHANGE_DIRECTION.ASSET_FROM_SENDER) {
      // 特殊资产来自发起账户，则要交换的 数字资产必须存在
      const memBeAssets = await accountGetterHelper.getAsset(beExchangeSource, beExchangeAsset);
      if (!memBeAssets) {
        // 不存在的资产不能被交换
        throw new ConsensusException(ASSET_NOT_EXIST, {
          magic: beExchangeSource,
          assetType: beExchangeAsset,
          ...Function_Exception_Detail,
        });
      }

      if (memBeAssets.sourceChainName !== beExchangeChainName) {
        throw new ConsensusException(NOT_MATCH, {
          to_compare_prop: "sourcehChainName",
          be_compare_prop: "beExchangeChainName",
          to_target: "chainAsset",
          be_target: "toExchangeSpecialAssetAsset",
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
