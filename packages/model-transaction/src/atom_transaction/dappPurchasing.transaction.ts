import { Transaction } from "@bfchain/core-model-transaction-base";
import { DAppPurchasingAssetModel } from "@bfchain/core-model-transaction-asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * dappPurchasing 交易模型
 *
 */
@Type.d("DAppPurchasingTransaction")
export class DAppPurchasingTransaction
  extends Transaction<BFChainCore.DAppPurchasingAssetJSON>
  implements BFChainCore.DAppPurchasingTransactionJSON
{
  toJSON!: () => BFChainCore.DAppPurchasingTransactionJSON;
  recipientId!: string;
  @Field.d(DAppPurchasingTransaction.INC++, DAppPurchasingAssetModel)
  asset!: DAppPurchasingAssetModel;
}
