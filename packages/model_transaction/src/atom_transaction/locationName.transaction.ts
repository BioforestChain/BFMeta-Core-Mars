import { Transaction } from "@bfchain/core-model-transaction-base";
import { LocationNameAssetModel } from "@bfchain/core-model-transaction-asset/locationName";
import { Type, Field } from "@bfchain/protobuf";

/**
 * locationName 交易模型
 *
 */
@Type.d("LocationNameTransaction")
export class LocationNameTransaction extends Transaction<BFChainCore.LocationNameAssetJSON>
  implements
    BFChainCore.TransactionMixJSON<BFChainCore.LocationNameAssetJSON, { hasRecipientId: false }> {
  toJSON!: () => BFChainCore.TransactionMixJSON<
    BFChainCore.LocationNameAssetJSON,
    { hasRecipientId: false }
  >;
  recipientId!: undefined;
  @Field.d(LocationNameTransaction.INC++, LocationNameAssetModel)
  asset!: LocationNameAssetModel;
}
