import { Type, Field } from "@bfchain/protobuf";
import { DAppAssetModel } from "@bfchain/core-model-transaction-asset";
import { AbstractTransaction } from "../abstractTransaction";

/**
 * dapp 交易模型
 *
 */
@Type.d("DAppTransaction")
export class DAppTransaction
  extends AbstractTransaction<BFChainCore.DAppAssetJSON>
  implements BFChainCore.DAppTransactionJSON
{
  toJSON!: () => BFChainCore.DAppTransactionJSON;
  recipientId!: string;
  @Field.d(DAppTransaction.INC++, DAppAssetModel)
  asset!: DAppAssetModel;
}
