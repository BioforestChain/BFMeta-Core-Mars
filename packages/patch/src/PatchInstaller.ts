import {
  Injectable,
  Inject,
  Resolve,
  EventEmitterPro,
  EasyMap,
  AfterInit,
  getInjectionGroups,
  ModuleStroge,
  EventEmitter,
} from "@bfchain/util";
import { PatchBase } from "@bfchain/core-patch-base";
import { Patch_1, Patch_1_2 } from "@bfchain/core-patch-1";

type Progress = EventEmitter<{ progress: [PatchBase]; done: []; error: [unknown] }>;

@Injectable()
export class PatchInstaller
  extends EventEmitterPro<{ ready: []; install: [Progress]; error: [unknown] }>
  implements AfterInit {
  constructor(private moduleMap: ModuleStroge) {
    super();
  }
  bfAfterInit() {
    /// 静态载入
    this.installPatch(Patch_1);
    this.installPatch(Patch_1_2);

    this._installPatchs();
  }

  /// 动态载入
  installPatch(PatchCtor: BFChainUtil.Constructor<PatchBase>) {
    Resolve(PatchCtor, this.moduleMap);
  }

  /**通知补丁高度变更 */
  changeHeight(height: number) {
    const groups = getInjectionGroups(PatchBase);
    const patchList: PatchBase[] = [];
    for (const id of groups) {
      patchList.push(this.moduleMap.get(id));
    }
    for (const patch of patchList) {
      patch.changeHeight(height);
    }
  }

  private _patchVersionMap = new EasyMap<string /* patch name */, number /* patch version */>(
    () => 0,
  );

  private async _installPatchs() {
    const groups = getInjectionGroups(PatchBase);
    const patchList: PatchBase[] = [];
    for (const id of groups) {
      patchList.push(this.moduleMap.get(id));
    }
    patchList.sort((a, b) => a.version - b.version);
    const maxVersionMap = new EasyMap<string, number>(
      (name) =>
        patchList.filter((p) => p.name === name).sort((a, b) => b.version - a.version)[0].version,
    );
    const progress: Progress = new EventEmitter();

    try {
      for (const patch of patchList) {
        progress.emit("progress", patch);
        const oldVersion = this._patchVersionMap.forceGet(patch.name);
        const newVersion = maxVersionMap.forceGet(patch.name);
        await patch.upgradeHandler(oldVersion, newVersion);
      }
      progress.emit("done");
    } catch (reason) {
      this.emit("error", reason);
      progress.emit("error", reason);
    }
  }
}
