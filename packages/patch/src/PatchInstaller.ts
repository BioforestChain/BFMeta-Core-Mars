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

  /**共识版本对应的补丁生效高度 */
  private _consensusVersionAndHeightMap = new Map<number, number>();

  private _isPatchReady?: Promise<void>;
  bfAfterInit() {
    /// 静态载入
    // this.installPatch(Patch_1_2);

    this._isPatchReady = this._installPatchs().then(() => {
      this._isPatchReady = undefined;
    });
  }

  // private _run_install_lock = false;
  private _lastConsensusVersion = 1;
  get lastConsensusVersion() {
    return this._lastConsensusVersion;
  }

  private _lastPatchEffectiveHeight = 1;
  get lastPatchEffectiveHeight() {
    return this._lastPatchEffectiveHeight;
  }

  /// 动态载入
  private _installPatch(PatchCtor: BFChainUtil.Constructor<PatchBase>) {
    Resolve(PatchCtor, this.moduleMap);
    // if (this._run_install_lock === false) {
    //   this._run_install_lock = true;
    //   queueMicrotask(() => {
    //     this._run_install_lock = false;
    //     this._installPatchs();
    //   });
    // }
  }

  async getPatchEffectiveAfterHeightByVersion(version: number) {
    let height = 0;
    if (version <= 1) {
      return 0;
    }
    await this._isPatchReady;
    for (const [
      consensusVersion,
      patchEffectiveAfterHeight,
    ] of this._consensusVersionAndHeightMap.entries()) {
      if (version === consensusVersion) {
        return patchEffectiveAfterHeight;
      }
      height = patchEffectiveAfterHeight;
    }
    return height;
  }

  /**通知补丁高度变更 */
  async changeHeight(height: number) {
    await this._isPatchReady;
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
          this._consensusVersionAndHeightMap.set(
            patch.consensusVersion,
            patch.patchEffectiveAfterHeight,
          );
          const newVersion = maxVersionMap.forceGet(patch.name);
          await patch.upgradeHandler(oldVersion, newVersion);
          this._patchVersionMap.set(patch.name, patch.version);
          if (this._lastConsensusVersion < patch.consensusVersion) {
            this._lastConsensusVersion = patch.consensusVersion;
          }
          if (this._lastPatchEffectiveHeight < patch.patchEffectiveAfterHeight) {
            this._lastPatchEffectiveHeight = patch.patchEffectiveAfterHeight;
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
