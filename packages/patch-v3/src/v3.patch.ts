import { PatchBase } from "@bfchain/core-patch-base";
import { Injectable, Inject, deepMix } from "@bfchain/util";
import { EventLogicVerifier } from "@bfchain/core-transaction-logic-verifier";

@Injectable()
export class V3_Patch extends PatchBase {
  @Inject(EventLogicVerifier)
  eventLogicVerifier!: EventLogicVerifier;

  readonly name = "patch-v3";
  readonly patchEffectiveAfterHeight = 238000;
  protected _version = 1;
  readonly consensusVersion = 3;
  async upgradeHandler(oldVersion: number, newVersion: number) {
    switch (oldVersion) {
      case 0: {
        {
          /**在合适的条件下，更新共识
           * 如果需要，执行数据库升级。。。。
           */
          this.planAfterHeight(
            this.patchEffectiveAfterHeight,
            () => {
              const oldBlock = this.config.getHookGenesisBlock(this.consensusVersion) || {};
              oldBlock.asset = deepMix(oldBlock.asset, {
                genesisAsset: {
                  registerChainMinChainAsset: "0",
                },
              });
              this.config.setHookGenesisBlock(this.consensusVersion, oldBlock);
            },
            () => {
              this.config.rollBackHookGenesisBlock(this.consensusVersion);
            },
          );
        }
      }
    }
  }
}
