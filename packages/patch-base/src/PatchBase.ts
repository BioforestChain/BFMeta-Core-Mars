import { Injectable, Inject, EventEmitter } from "@bfchain/util";
import { ConfigHelper } from "@bfchain/core-helper-config";
import { BlockCore } from "@bfchain/core-block";

export const PATCH_ARGS = {
  CURRENT_HEIGHT: Symbol("currentHeight"),
};
@Injectable({ group: true })
export abstract class PatchBase {
  private emitter = new EventEmitter<{
    height: [number];
    heightChanged: [{ newHeight: number; oldHeight: number }];
  }>();
  constructor(
    @Inject(PATCH_ARGS.CURRENT_HEIGHT, { optional: true })
    public currentHeight: number = 0,
  ) {
    this.emitter.on("height", (newHeight) => {
      const oldHeight = this.currentHeight;
      this.currentHeight = newHeight;
      this.emitter.emit("heightChanged", { oldHeight, newHeight });
    });
  }
  changeHeight(height: number) {
    this.emitter.emit("height", height);
  }
  onHeightChanged(handler: BFChainUtil.MutArgEventHandler<[number, number]>) {
    this.emitter.on("heightChanged", handler);
  }
  planHeight(height: number, handler: () => unknown, unhandler: () => unknown) {
    let curStatus = _PLAN_STATUS.NULL;
    this.emitter.on("heightChanged", ({ newHeight, oldHeight }) => {
      if (newHeight > oldHeight) {
        if (newHeight === height) {
          if (curStatus !== _PLAN_STATUS.EMIT) {
            handler();
          }
        }
      } else if (newHeight < height) {
        if (curStatus !== _PLAN_STATUS.NULL) {
          unhandler();
        }
      }
    });
    if (this.currentHeight >= height) {
      handler();
      curStatus = _PLAN_STATUS.EMIT;
    }
  }

  @Inject(ConfigHelper) config!: ConfigHelper;
  @Inject(BlockCore) block!: BlockCore;
  @Inject("blockGetterHelper", { optional: true, dynamics: true })
  protected blockGetterHelper?: BFChainCore.BlockGetterHelperInterface;
  /**补丁包的名词，不同补丁包之间不共享version，也就是说补丁包自身支持version变更，从而实现动态打补丁 */
  abstract readonly name: string;
  /**注意，这里只是补丁包的版本号，不是共识的版本号 */
  protected abstract _version: number;
  get version() {
    return this._version;
  }
  abstract upgradeHandler(oldVersion: number, newVersion: number): BFChainUtil.PromiseMaybe<void>;
}

const enum _PLAN_STATUS {
  NULL,
  EMIT,
}
