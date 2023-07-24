import { Type, Field } from "@bfchain/protobuf";
import { DAppPurchasingAssetModel } from "@bfchain/core-model-transaction-asset";
import { AbstractTransaction } from "../abstractTransaction";

/**
 * dappPurchasing 交易模型
 *
 */
@Type.d("DAppPurchasingTransaction")
export class DAppPurchasingTransaction
  extends AbstractTransaction<BFChainCore.DAppPurchasingAssetJSON>
  implements BFChainCore.DAppPurchasingTransactionJSON
{
  toJSON!: () => BFChainCore.DAppPurchasingTransactionJSON;
  recipientId!: string;
  @Field.d(DAppPurchasingTransaction.INC++, DAppPurchasingAssetModel)
  asset!: DAppPurchasingAssetModel;
}
