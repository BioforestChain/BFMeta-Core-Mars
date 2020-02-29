/**
 * 拓展链处理中心基类
 */

import "./types";
import { Reader } from "@bfchain/protobuf";
import * as WorkerMsg from "./message";
import { Worker, MessageChannel, MessagePort, isMainThread, parentPort } from "worker_threads";
import { WorkerMsgHelper } from "./workerMsgHelper";

type TYPEDARRAY = Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array;

const DEFAULT_SHAREDBUFF_SIZE = 4096;

export class SubChainCenter implements BFChainCore.CustomTrCenterInterface {
  private _worker!: Worker;
  private _sharedBuffer = new SharedArrayBuffer(DEFAULT_SHAREDBUFF_SIZE);
  private _sharedBufferSize = DEFAULT_SHAREDBUFF_SIZE;
  private _lockSession: Int32Array;

  //private _subChannel:MessageChannel;

  //private _sharedArray:Int32Array;
  //private _lock:Lock;

  private getWorker() {
    if (!this._worker) {
      //console.log(`00000${process.pid + ' ' + process.ppid}`)
      const { resolve } = require("./path");
      const workerPath = resolve(__dirname, "worker.js");
      this._worker = new Worker(workerPath, { workerData: this._scriptfn }); //	this._scriptfn
      //	创建Worker
      this._worker.addListener("init", () => {
        console.log(`Center worker init....`);
      });
      this._worker.on("message", msg => {
        console.log(`Center get msg: ${msg}`);
      });
    }
    return this._worker;
  }

  constructor(private _scriptfn: string) {
    // const sharedBuffer = new SharedArrayBuffer(4)
    // this._sharedArray = new Int32Array(sharedBuffer)

    this._lockSession = new Int32Array(
      this._sharedBuffer,
      WorkerMsg.WORKER_DATA_IDX.STATE_OFFSET,
      4,
    );
    Atomics.store(this._lockSession, 0, WorkerMsg.LOCK_STATE.UNLOCKED);
  }

  /**
   * 为线程操作Lock
   */
  lock() {
    let lastLockState = Atomics.compareExchange(
      this._lockSession,
      0,
      WorkerMsg.LOCK_STATE.UNLOCKED,
      WorkerMsg.LOCK_STATE.LOCKED_NO_WAITERS,
    );
    if (lastLockState != WorkerMsg.LOCK_STATE.UNLOCKED) {
      do {
        if (
          lastLockState == WorkerMsg.LOCK_STATE.LOCKED_POSSIBLE_WAITERS ||
          Atomics.compareExchange(
            this._lockSession,
            0,
            WorkerMsg.LOCK_STATE.LOCKED_NO_WAITERS,
            WorkerMsg.LOCK_STATE.LOCKED_POSSIBLE_WAITERS,
          ) != WorkerMsg.LOCK_STATE.UNLOCKED
        ) {
          Atomics.wait(
            this._lockSession,
            0,
            WorkerMsg.LOCK_STATE.LOCKED_POSSIBLE_WAITERS,
            Number.POSITIVE_INFINITY,
          );
        }
        lastLockState = Atomics.compareExchange(
          this._lockSession,
          0,
          WorkerMsg.LOCK_STATE.UNLOCKED,
          WorkerMsg.LOCK_STATE.LOCKED_POSSIBLE_WAITERS,
        );
      } while (lastLockState != WorkerMsg.LOCK_STATE.UNLOCKED);
    }
  }

  /**
   * 等待线程解锁
   */
  waitWorkerUnlock() {
    let lastLockState = Atomics.load(this._lockSession, 0);
    while (lastLockState != WorkerMsg.LOCK_STATE.UNLOCKED) {
      Atomics.wait(
        this._lockSession,
        0,
        WorkerMsg.LOCK_STATE.LOCKED_POSSIBLE_WAITERS,
        Number.POSITIVE_INFINITY,
      );
      lastLockState = Atomics.load(this._lockSession, 0);
    }
  }

  synchronize(cb: Function, allocChannelBufSize?: number) {
    //	TODO...如果_sharedBufferSize不够，重建_sharedBuffer

    this.lock();

    cb.call(this);

    this.waitWorkerUnlock();

    //	Worker线程返回的数据
    const dataSizeBuf = new Uint32Array(
      this._sharedBuffer,
      WorkerMsg.WORKER_DATA_IDX.DATASIZE_OFFSET * 4,
      4,
    );
    const workerData = new Uint8Array(
      this._sharedBuffer,
      WorkerMsg.WORKER_DATA_IDX.DATA_OFFSET * 4,
      dataSizeBuf[0],
    );
    const reader = new Reader(workerData);
    reader.uint32();
    const op = reader.uint32() as WorkerMsg.OPCODE;
    console.log(`[SubChainCenter] RecvMsg From Worker, op:${op}`);

    //	根据op解析数据包
    let msgconstructor = WorkerMsgHelper.instance.getSubChainMessageConstructorFromOpcode(op);
    if (msgconstructor) {
      const msg = msgconstructor.decode(workerData);
      return msg;
    }
    return undefined;
  }

  /**
	 * 数据交互思路:
	 * .SubChainCenter->Worker传递数据， 调用SubChainCenter.postMessage，
	 * 函数内会添加成员__sharedBuffer, 用于worker线程写入返回数据。
	 * 另外，传递的
	 
	*/
  postMessage(msg: WorkerMsg.ReqMsg) {
    msg.__sharedBuffer = this._sharedBuffer;
    this.getWorker().postMessage(msg);
  }
  /**
   * 验证自定义交易
   * @param body
   * @param customAsset
   * @param config
   */
  verify(
    body: BFChainCore.TxBodyJSON,
    customAsset: BFChainCore.CustomAssetJSON,
  ): SubChainCenter.VERIFY_RES {
    const res = this.synchronize(() => {
      const msg = new WorkerMsg.TxVerifyReq();
      msg.body = body;
      msg.customAsset = customAsset;

      this.postMessage(msg);
    });

    if (res) {
      const verifyMsg = res as WorkerMsg.TxVerifyRes;
      console.log(`verify retcode : ${verifyMsg.retCode}, message: ${verifyMsg.message}`);

      return { ret: verifyMsg.retCode == 0, message: verifyMsg.message };
    }

    return { ret: true, message: "RunTimeError" };
  }

  /**
   * 应用自定义交易
   */
  apply() {
    return [];
  }

  async logicVerify(tr: BFChainCore.Transaction) {
    return { ret: true };
  }

  async logicApply(tr: BFChainCore.Transaction) {
    return [];
  }
}
