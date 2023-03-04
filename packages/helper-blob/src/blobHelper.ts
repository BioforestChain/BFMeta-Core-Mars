import { ChainTimeHelper } from "@bfchain/core-helper-chain-time";
import { EasyMap, Inject, Injectable } from "@bfchain/util";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";

const { NoFoundException, ArgumentIllegalException, RefuseException } = CoreExceptionGenerator(
  "helper",
  "blobHelper",
);
class DescriptorCtrl {
  constructor(private timeHelper: ChainTimeHelper) {}
  private _descriptor_acc = 0;
  newDescriptor() {
    return ++this._descriptor_acc;
  }
  private _descriptor_df_map = new Map<
    /* descriptor: */ number,
    /* fd: */ { fd: string; expriedTime: number; ti: number; doDestroy: Function }
  >();
  allDescriptors() {
    return this._descriptor_df_map.keys();
  }
  saveDescriptor(fd: string, expDuration: number, onTimeout: Function) {
    const descriptor = this.newDescriptor();
    const expriedTime = this.timeHelper.now() + expDuration;
    const doDestroy = () => {
      onTimeout();
      this._descriptor_df_map.delete(descriptor);
    };
    this._descriptor_df_map.set(descriptor, {
      fd,
      expriedTime,
      ti: this.timeHelper.setTimeout(doDestroy, expDuration),
      doDestroy: doDestroy,
    });
    return descriptor;
  }
  getState(descriptor: number) {
    return this._descriptor_df_map.get(descriptor);
  }
  destroyDescriptor(descriptor: number) {
    const state = this._descriptor_df_map.get(descriptor);
    if (state) {
      state.doDestroy();
      return state.fd;
    }
  }
}
class FdCtrl {
  constructor(
    readonly sha256: string,
    readonly fd: string,
    readonly state: BFChainCore.BlobMetadata,
    private selfDeleter: Function,
    private targetDescriptorCtrlWM: EasyMap<object, DescriptorCtrl>,
  ) {}
  private _refs = new Map<object, number>();

  ref(target: object, force: boolean = false) {
    let descriptor = this._refs.get(target);
    if (descriptor === undefined || force) {
      const descriptorCtrl = this.targetDescriptorCtrlWM.forceGet(target);
      descriptor = descriptorCtrl.saveDescriptor(
        this.fd,
        this.state.size / 50 /* 假设以 50kb/1s 的速率进行传输 */ + 30e3 /* 至少保留30s */,
        () => {
          if (this.targetDescriptorCtrlWM.get(target) === descriptorCtrl) {
            this.targetDescriptorCtrlWM.delete(target);
            this.unref(target);
          }
        },
      );
      this._refs.set(target, descriptor);
    }

    return descriptor;
  }
  protected unref(target: object) {
    this._refs.delete(target);
    if (this._refs.size === 0) {
      this.selfDeleter();
    }
  }
}

@Injectable()
export class BlobHelper {
  constructor(readonly timeHelper: ChainTimeHelper) {}
  @Inject("blobSha256Reader", { optional: true })
  blobSha256Reader?: BFChainCore.BlobReader;
  @Inject("blobSha256Writer", { optional: true })
  blobSha256Writer?: BFChainCore.BlobWriter;
  private targetDescriptorCtrlMap = EasyMap.from({
    creater: (target: object) => {
      return new DescriptorCtrl(this.timeHelper);
    },
  });
  private sha256fdCtrlMap = EasyMap.from({
    creater: async (sha256: string) => {
      const sha256BlobHelper = this.blobSha256Reader!;
      if ((await sha256BlobHelper.has(sha256)) === false) {
        throw new NoFoundException(ERROR_LIST.OPEN_BLOB_NOT_FOUND, { hash: `SHA256:${sha256}` });
      }
      const fd = await sha256BlobHelper.open(sha256);
      const state = await sha256BlobHelper.state(fd);
      return new FdCtrl(
        sha256,
        fd,
        state,
        () => this.sha256fdCtrlMap.delete(sha256),
        this.targetDescriptorCtrlMap,
      );
    },
  });

  support(
    algorithm: BFChainCore.OpenBlobArgJSON.Algorithm,
    mode: BFChainCore.BlobMode = "readwrite",
  ) {
    let support = true;
    if (algorithm === "SHA256") {
      if (mode.includes("read")) {
        support = support && this.blobSha256Reader !== undefined;
      }
      if (mode.includes("write")) {
        support = support && this.blobSha256Writer !== undefined;
      }
    } else {
      support = false;
    }
    return support;
  }

  supportAlgorithms(mode: BFChainCore.BlobMode) {
    const algorithms = new Set<BFChainCore.OpenBlobArgJSON.Algorithm>();
    for (const algorithm of ["SHA256"] as const) {
      if (this.support(algorithm, mode)) {
        algorithms.add(algorithm);
      }
    }
    return algorithms;
  }

  async exists(openArg: BFChainCore.OpenBlobArgJSON) {
    const { blobSha256Reader: sha256BlobReader } = this;
    if (!sha256BlobReader || openArg.algorithm !== "SHA256") {
      return false;
    }
    return sha256BlobReader.has(openArg.hash);
  }

  async open(target: object, openArg: BFChainCore.OpenBlobArgJSON) {
    const { hash, algorithm } = openArg;
    const { blobSha256Reader: sha256BlobHelper } = this;
    if (algorithm !== "SHA256") {
      throw new ArgumentIllegalException(ERROR_LIST.OPEN_BLOB_INVALID_HASH, {
        hash: `${openArg.algorithm}:${openArg.hash}`,
      });
    }
    if (sha256BlobHelper === undefined) {
      throw new NoFoundException(ERROR_LIST.OPEN_BLOB_NOT_FOUND, {
        hash: `${openArg.algorithm}:${openArg.hash}`,
      });
    }
    const fdCtrl = await this.sha256fdCtrlMap.forceGet(hash);

    const descriptor = fdCtrl.ref(target);

    const descriptorCtrl = this.targetDescriptorCtrlMap.forceGet(target);
    const state = descriptorCtrl.getState(descriptor)!;

    const openResult: BFChainCore.OpenBlobReturnParams = {
      descriptor,
      expriedTime: state.expriedTime,
      size: fdCtrl.state.size,
      contentType: fdCtrl.state.contentType,
      chunkSize: 1024 * 1024 /* 1MB */,
    };
    return openResult;
  }
  async read(target: object, readArg: BFChainCore.ReadBlobArgJSON) {
    const { blobSha256Reader: sha256BlobHelper } = this;
    if (sha256BlobHelper === undefined) {
      throw new ArgumentIllegalException(ERROR_LIST.READ_BLOB_INVALID_DESCRIPTOR, {
        descriptor: readArg.descriptor,
      });
    }

    const descriptorCtrl = this.targetDescriptorCtrlMap.forceGet(target);
    const state = descriptorCtrl.getState(readArg.descriptor);
    if (state === undefined) {
      throw new ArgumentIllegalException(ERROR_LIST.READ_BLOB_INVALID_DESCRIPTOR, {
        descriptor: readArg.descriptor,
      });
    }

    const chunkBuffer = await sha256BlobHelper.read(state.fd, readArg.start, readArg.end);
    const readResult: BFChainCore.ReadBlobReturnParams = { chunkBuffer };
    return readResult;
  }
  async close(target: object, closeArg: BFChainCore.CloseBlobArgJSON) {
    const { blobSha256Reader: sha256BlobHelper } = this;
    if (sha256BlobHelper === undefined) {
      throw new ArgumentIllegalException(ERROR_LIST.CLOSE_BLOB_INVALID_DESCRIPTOR, {
        descriptor: closeArg.descriptor,
      });
    }

    const descriptorCtrl = this.targetDescriptorCtrlMap.forceGet(target);
    const fd = descriptorCtrl.destroyDescriptor(closeArg.descriptor);
    if (fd === undefined) {
      throw new ArgumentIllegalException(ERROR_LIST.CLOSE_BLOB_INVALID_DESCRIPTOR, {
        descriptor: closeArg.descriptor,
      });
    }
    return await sha256BlobHelper.close(fd);
  }

  /**
   * 申请存储，给定一个 总大小 与 分片大小
   * @param totalSize 总大小
   * @param chunkSize 分片大小
   * @param contentType 参考的数据类型。可选，仅用于优化存储业务
   * @returns 返回一个逻辑地址的值
   */
  requestStorage(
    openArg: BFChainCore.OpenBlobArgJSON,
    totalSize: number,
    chunkSize: number,
    contentType: string,
    strategy: STORAGE_STRATEGY = STORAGE_STRATEGY.TEMPORARY,
  ) {
    const { blobSha256Writer: sha256BlobWriter } = this;
    if (!sha256BlobWriter) {
      throw new RefuseException(ERROR_LIST.REFUSE_REQUEST_BLOB_STORAGE, { size: totalSize });
    }
    return sha256BlobWriter.requestStorage(openArg, totalSize, chunkSize, contentType, strategy);
  }
  /**
   * 保存分片数据
   *
   * @param pointer 逻辑地址
   * @param index 分片下标
   * @param chunk 分片数据
   */
  saveChunk(pointer: string, index: number, chunk: Uint8Array) {
    const { blobSha256Writer: sha256BlobWriter } = this;
    if (!sha256BlobWriter) {
      throw new RefuseException(ERROR_LIST.FAIL_TO_STORE_BLOB_CHUNK, { pointer, index });
    }
    return sha256BlobWriter.saveChunk(pointer, index, chunk);
  }
  /**
   * 保存成不可变的 Blob 对象
   *
   * @param pointer 逻辑地址
   * @param contentType 类型
   * @returns 返回HASH值
   */
  saveAsBlob(pointer: string) {
    const { blobSha256Writer: sha256BlobWriter } = this;
    if (!sha256BlobWriter) {
      throw new RefuseException(ERROR_LIST.FAIL_TO_GENERATE_BLOB, { pointer });
    }
    return sha256BlobWriter.saveAsBlob(pointer);
  }

  changeBlobStrategy(
    openArg: BFChainCore.OpenBlobArgJSON,
    strategy: import("./blobHelper").STORAGE_STRATEGY,
  ) {
    const { blobSha256Writer: sha256BlobWriter } = this;
    if (!sha256BlobWriter) {
      throw new RefuseException(ERROR_LIST.FAIL_TO_CHANGE_BLOB_STRATEGY, {
        hash: `${openArg.algorithm}:${openArg.hash}`,
        strategy,
      });
    }
    return sha256BlobWriter.changeBlobStrategy(openArg, strategy);
  }

  destroyTarget(target: object) {
    const descriptorCtrl = this.targetDescriptorCtrlMap.get(target);
    if (descriptorCtrl === undefined) {
      return false;
    }
    for (const descriptor of descriptorCtrl.allDescriptors()) {
      descriptorCtrl.destroyDescriptor(descriptor);
    }
    return this.targetDescriptorCtrlMap.delete(target);
  }
}

/**存储策略 */
export const enum STORAGE_STRATEGY {
  /**临时的 */
  TEMPORARY = 0,
  /**持久的 */
  PERSISTENT = 1,
}
