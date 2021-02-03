import { Injectable, Inject, getInjectionToken, deepMix } from "@bfchain/util";
import { PatchBase, PATCH_INJECT_TOKEN } from "@bfchain/core-patch-base";

@Injectable()
export class Patch_1 extends PatchBase {
  readonly name = "test-patch";
  protected _version = 1;
  async upgradeHandler(oldVersion: number, newVersion: number) {
    switch (oldVersion) {
      case 0: {
        {
          /**更改共识版本号 */
          const conVersion = 2;

          /**在合适的条件下，更新共识
           * 如果需要，执行数据库升级。。。。
           */
          let oldAsset: BFChainCore.DeepPartial<BFChainCore.GenesisBlockAssetJSON> | undefined;
          this.planAfterHeight(
            100,
            () => {
              const oldBlock = this.config.getHookGenesisBlock(conVersion) || {};
              oldBlock.asset = deepMix((oldAsset = oldBlock.asset), {
                genesisAsset: {
                  issueAssetMinChainAsset: "6666",
                  registerChainMinChainAsset: "6666",
                },
              });
              this.config.setHookGenesisBlock(conVersion, oldBlock);

              // const oldgenerateBlock = this.block.generateBlock;
              // this.block.generateBlock = (...args) => {
              //   oldgenerateBlock(...args);
              //   ///**/
              // };
            },
            () => {
              const oldBlock = this.config.getHookGenesisBlock(conVersion) || {};
              oldBlock.asset = oldAsset;
              this.config.setHookGenesisBlock(conVersion, oldBlock);
            },
          );
        }
        {
          /**更改共识版本号 */
          const conVersion = 3;

          /**在合适的条件下，更新共识
           * 如果需要，执行数据库升级。。。。
           */
          let oldAsset: BFChainCore.DeepPartial<BFChainCore.GenesisBlockAssetJSON> | undefined;
          this.planAfterHeight(
            130,
            () => {
              const oldBlock = this.config.getHookGenesisBlock(conVersion) || {};
              oldBlock.asset = deepMix((oldAsset = oldBlock.asset), {
                genesisAsset: {
                  minTransactionFeePerByte: {
                    numerator: 2,
                    denominator: 1,
                  },
                },
              });
              this.config.setHookGenesisBlock(conVersion, oldBlock);
            },
            () => {
              const oldBlock = this.config.getHookGenesisBlock(conVersion) || {};
              oldBlock.asset = oldAsset;
              this.config.setHookGenesisBlock(conVersion, oldBlock);
            },
          );
        }
        {
          /**更改共识版本号 */
          const conVersion = 4;

          /**在合适的条件下，更新共识
           * 如果需要，执行数据库升级。。。。
           */
          let oldAsset: BFChainCore.DeepPartial<BFChainCore.GenesisBlockAssetJSON> | undefined;
          this.planAfterHeight(
            170,
            () => {
              const oldBlock = this.config.getHookGenesisBlock(conVersion) || {};
              oldBlock.asset = deepMix((oldAsset = oldBlock.asset), {
                genesisAsset: {
                  minTransactionFeePerByte: {
                    numerator: 1,
                    denominator: 100,
                  },
                },
              });
              this.config.setHookGenesisBlock(conVersion, oldBlock);
            },
            () => {
              const oldBlock = this.config.getHookGenesisBlock(conVersion) || {};
              oldBlock.asset = oldAsset;
              this.config.setHookGenesisBlock(conVersion, oldBlock);
            },
          );
        }
      }
    }
  }
}
@Injectable()
export class Patch_1_2 extends Patch_1 {
  protected _version = 2;
  async upgradeHandler(oldVersion: number, newVersion: number) {
    await super.upgradeHandler(oldVersion, newVersion);
    switch (oldVersion) {
      case 1: {
        /**更改共识版本号 */
        const conVersion = 4;

        /**在合适的条件下，更新共识
         * 如果需要，执行数据库升级。。。。
         */
        let oldAsset: BFChainCore.DeepPartial<BFChainCore.GenesisBlockAssetJSON> | undefined;
        this.planAfterHeight(
          200,
          () => {
            const oldBlock = this.config.getHookGenesisBlock(conVersion) || {};
            oldBlock.asset = deepMix((oldAsset = oldBlock.asset), {
              genesisAsset: { issueAssetMinChainAsset: "7777", registerChainMinChainAsset: "7777" },
            });
            this.config.setHookGenesisBlock(conVersion, oldBlock);
          },
          () => {
            const oldBlock = this.config.getHookGenesisBlock(conVersion) || {};
            oldBlock.asset = oldAsset;
            this.config.setHookGenesisBlock(conVersion, oldBlock);
          },
        );
      }
    }
  }
}
