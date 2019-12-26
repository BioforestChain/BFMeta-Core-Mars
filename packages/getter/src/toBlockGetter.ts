import { ConfigHelper } from "@bfchain/core-helper-config";
import { BaseHelper } from "@bfchain/core-helper-type";
import { Block, GenesisBlock } from "@bfchain/core-model-block";
import { CoreExceptionGenerator } from "@bfchain/core-util-exception";
const { NoFoundException } = CoreExceptionGenerator("Core", "ToBlockGetter");

export abstract class ToBlockGetter {
  protected abstract config: ConfigHelper;
  protected abstract baseHelper: BaseHelper;

  abstract findBlock<B extends Block = Block>(
    query: BFChainCore.BlockQueryOptionsJSON,
    opts?: BFChainCore.ChannelRequestOptions | undefined,
  ): Promise<B | undefined>;

  private _blockGetterHelper?: BFChainCore.BlockGetterHelperInterface & {
    maxHeight: number;
    lastBlock: Block;
  };

  /**
   * 导出成一个 blockGetterHel
   */
  toBlockGetterHelper(opts?: { maxHeight?: number; lastBlock?: Block }) {
    if (!this._blockGetterHelper) {
      this._blockGetterHelper = {
        getBlockByHeight: (height: number) => {
          return this.findBlock({ height });
        },
        getBlockById: (id: string) => {
          return this.findBlock({ id });
        },
        maxHeight: 1,
        lastBlock: GenesisBlock.fromObject(this.config.genesisBlock),
        async getLastBlock() {
          if (this.lastBlock.height !== this.maxHeight) {
            const block = await this.getBlockByHeight(this.maxHeight);
            if (!block) {
              throw new NoFoundException();
            }
            this.lastBlock = block;
          }
          return this.lastBlock;
        },
      };
    }
    if (opts) {
      if (this.baseHelper.isPositiveFloatNotContainZero(opts.maxHeight)) {
        this._blockGetterHelper.maxHeight = opts.maxHeight;
      }
      if (opts.lastBlock) {
        this._blockGetterHelper.lastBlock = opts.lastBlock;
      }
    }
    return this._blockGetterHelper;
  }
}
