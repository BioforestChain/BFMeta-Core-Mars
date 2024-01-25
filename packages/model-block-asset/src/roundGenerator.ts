import { Message, Type, Field } from "@bfchain/protobuf";
@Type.d("NextRoundGeneratorModel")
export class NextRoundGeneratorModel
  extends Message<NextRoundGeneratorModel>
  implements BFChainCore.JSONToModelType<BFChainCore.NextRoundGeneratorJSON>
{
  static INC = 1;
  @Field.d(NextRoundGeneratorModel.INC++, "string")
  address!: string;
  @Field.d(NextRoundGeneratorModel.INC++, "uint32")
  numberOfForgeEntities!: number;
  toJSON() {
    return {
      address: this.address,
      numberOfForgeEntities: this.numberOfForgeEntities,
    };
  }
}

@Type.d("RoundGeneratorModel")
export class RoundGeneratorModel<T extends RoundGeneratorModel<T>>
  extends Message<T>
  implements BFChainCore.JSONToModelType<BFChainCore.RoundGeneratorJSON>
{
  static INC = 1;
  /**下一轮的打块账户以及其相关信息 */
  @Field.d(RoundGeneratorModel.INC++, NextRoundGeneratorModel, "repeated")
  nextRoundGenerators!: NextRoundGeneratorModel[];
  private _next_round_generator_address_list?: string[];
  get nextRoundGeneratorAddressList() {
    if (!this._next_round_generator_address_list) {
      this._next_round_generator_address_list = [];
      for (const equ of this.nextRoundGenerators) {
        this._next_round_generator_address_list.push(equ.address);
      }
    }
    return this._next_round_generator_address_list;
  }
  toJSON() {
    const res: BFChainCore.RoundGeneratorJSON = {
      nextRoundGenerators: this.nextRoundGenerators.map((rd) => rd.toJSON()),
    };
    return res;
  }
}
