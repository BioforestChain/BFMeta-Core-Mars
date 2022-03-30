import { PatchBase } from "@bfchain/core-patch-base";
import { Injectable, Inject, deepMix } from "@bfchain/util";
import { EventLogicVerifier } from "@bfchain/core-transaction-logic-verifier";
import { BNID_TYPE } from "@bfchain/core-model-constants";

@Injectable()
export class V5_Patch extends PatchBase {
  @Inject(EventLogicVerifier)
  eventLogicVerifier!: EventLogicVerifier;

  readonly name = "patch-v5";
  // FIXNE: 先这样，后面再想办法搞
  readonly patchEffectiveAfterHeight =
    this.config.chainName === "bfchain" && this.config.bnid === BNID_TYPE.MAINNET ? 357162 : 0;
  protected _version = 1;
  readonly consensusVersion = 5;
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
