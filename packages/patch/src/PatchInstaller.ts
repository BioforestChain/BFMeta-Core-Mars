import {
  Injectable,
  Resolve,
  EventEmitterPro,
  EasyMap,
  AfterInit,
  ModuleStroge,
  EventEmitter,
} from "@bfchain/util";
import { PatchBase } from "@bfchain/core-patch-base";
import { V2_Patch } from "@bfchain/core-patch-v2";
import { V3_Patch } from "@bfchain/core-patch-v3";
import { V4_Patch } from "@bfchain/core-patch-v4";
import { ConfigHelper } from "@bfchain/core-helper";

type Progress = EventEmitter<{ progress: [PatchBase]; done: []; error: [unknown] }>;

@Injectable()
export class PatchInstaller
  extends EventEmitterPro<{ ready: []; install: [Progress]; error: [unknown] }>
  implements AfterInit
{
  constructor(private moduleMap: ModuleStroge, private config: ConfigHelper) {
    super();
  }
  bfAfterInit() {
    /// 静态载入
    this.installPatch(V2_Patch);
    this.installPatch(V3_Patch);
    this.installPatch(V4_Patch);
    // this.installPatch(Patch_1_2);
  }

  private _run_install_lock = false;
  private _lastConsensusVersion = 1;
  get lastConsensusVersion() {
    return this._lastConsensusVersion;
  }
  /// 动态载入
  installPatch(PatchCtor: BFChainUtil.Constructor<PatchBase>) {
    Resolve(PatchCtor, this.moduleMap);
    if (this._run_install_lock === false) {
      this._run_install_lock = true;
      queueMicrotask(() => {
        this._run_install_lock = false;
        this._installPatchs();
      });
    }
  }

  /**通知补丁高度变更 */
  changeHeight(height: number) {
    const patchs = this.moduleMap.groupGet(PatchBase as BFChainUtil.Constructor<PatchBase>);
    for (const patch of patchs) {
      patch.changeHeight(height);
    }
  }

  private _patchVersionMap = new EasyMap<string /* patch name */, number /* patch version */>(
    () => 0,
  );

  private async _installPatchs() {
    const patchList: PatchBase[] = [
      ...this.moduleMap.groupGet(PatchBase as BFChainUtil.Constructor<PatchBase>),
    ];
    patchList.sort((a, b) => a.version - b.version);

    const maxVersionMap = new EasyMap<string, number>(
      (name) =>
        patchList.filter((p) => p.name === name).sort((a, b) => b.version - a.version)[0].version,
    );
    const progress: Progress = new EventEmitter();

    const oldVersion = this.config.version;

    try {
      for (const patch of patchList) {
        progress.emit("progress", patch);
        const oldVersion = this._patchVersionMap.forceGet(patch.name);
        if (oldVersion < patch.version) {
          const newVersion = maxVersionMap.forceGet(patch.name);
          await patch.upgradeHandler(oldVersion, newVersion);
          this._patchVersionMap.set(patch.name, patch.version);
          if (this._lastConsensusVersion < patch.consensusVersion) {
            this._lastConsensusVersion = patch.consensusVersion;
          }
        }
      }
      progress.emit("done");
    } catch (reason) {
      this.emit("error", reason);
      progress.emit("error", reason);
    }

    /// 共识发生改变
    const newVersion = this.config.version;
    if (newVersion !== oldVersion) {
      /// @TODO
      // this.config.emit("version",{newVersion,oldVersion});
    }
  }
}
