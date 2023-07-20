import { Type, Field } from "@bfchain/protobuf";
import { LocationNameAssetModel } from "@bfchain/core-model-transaction-asset";
import { AbstractTransaction } from "../abstractTransaction";

/**
 * locationName 交易模型
 *
 */
@Type.d("LocationNameTransaction")
export class LocationNameTransaction
  extends AbstractTransaction<BFChainCore.LocationNameAssetJSON>
  implements BFChainCore.LocationNameTransactionJSON
{
  toJSON!: () => BFChainCore.LocationNameTransactionJSON;
  recipientId!: string;
  @Field.d(LocationNameTransaction.INC++, LocationNameAssetModel)
  asset!: LocationNameAssetModel;
}
