import { Transaction } from "@bfchain/core-model-transaction-base";
import { LocationNameAssetModel } from "@bfchain/core-model-transaction-asset";
import { Type, Field } from "@bfchain/protobuf";

/**
 * locationName 交易模型
 *
 */
@Type.d("LocationNameTransaction")
export class LocationNameTransaction
  extends Transaction<BFChainCore.LocationNameAssetJSON>
  implements BFChainCore.LocationNameTransactionJSON
{
  toJSON!: () => BFChainCore.LocationNameTransactionJSON;
  recipientId!: string;
  @Field.d(LocationNameTransaction.INC++, LocationNameAssetModel)
  asset!: LocationNameAssetModel;
}
