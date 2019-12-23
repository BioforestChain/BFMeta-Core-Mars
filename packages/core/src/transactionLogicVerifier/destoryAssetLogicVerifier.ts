import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { DestoryAssetTransaction } from "../../model";
import { Injectable } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  ASSET_NOT_EXIST,
  NOT_EXIST,
  CAN_NOT_DESTORY_ASSET,
} from "@bfchain/core-helper";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "DestoryAssetLogicVerifier",
);

@Injectable()
export class DestoryAssetLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: DestoryAssetTransaction,
    currentBlockHeight: number,
    accountGetterHelper = this.accountGetterHelper,
    transactionGetterHelper = this.transactionGetterHelper,
    customTransactionCenter = this.customTransactionCenter,
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
    const sender = await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountGetterHelper,
      transactionGetterHelper,
    );
    const destoryAsset = transaction.asset.destoryAsset;

    const { sourceChainMagic, assetType } = destoryAsset;

    // 查询本地是否已经存在这个数字资产(注意忽略大小写)
    const memAssets = await accountGetterHelper.getAsset(sourceChainMagic, assetType);
    if (!memAssets) {
      // 不存在的资产不能被销毁
      throw new ConsensusException(ASSET_NOT_EXIST, {
        magic: sourceChainMagic,
        assetType,
        ...Function_Exception_Detail,
      });
    }

    // 资产的创世账户不能销毁资产
    if (memAssets.genesisAddress === transaction.senderId) {
      throw new ConsensusException(CAN_NOT_DESTORY_ASSET, {
        address: transaction.senderId,
        magic: sourceChainMagic,
        assetType,
        reason: "assets genesis account can't destory assets",
        ...Function_Exception_Detail,
      });
    }

    return true;
  }
}
