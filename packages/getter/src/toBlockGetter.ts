export class ToBlockGetter {
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
