import { Message, Type, Field } from "@bfchain/protobuf";

@Type.d("CommonBlockRemarkModel")
export class CommonBlockRemarkModel extends Message<CommonBlockRemarkModel>
  implements BFChainCore.RemarkJSONToModelType<BFChainCore.CommonBlockRemarkJSON> {
  static INC = 1;
  /**区块处理信息 */
  @Field.d(CommonBlockRemarkModel.INC++, "string")
  debug!: string;
  /**备注信息 */
  @Field.d(CommonBlockRemarkModel.INC++, "string")
  info!: string;
  /**区块参与度 */
  @Field.d(CommonBlockRemarkModel.INC++, "string")
  blockParticipation!: string;
  toJSON() {
    return {
      debug: this.debug,
      info: this.info,
      blockParticipation: this.blockParticipation,
    };
  }
}
