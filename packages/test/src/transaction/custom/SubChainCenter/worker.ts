import { parentPort, workerData } from "worker_threads";
import * as WorkerMsg from "./message";
import "./types";

/**
 * 接收消息处理
 */
if (parentPort) {
  //console.log(`11111${process.pid + ' ' + process.ppid}`)
  parentPort.on("message", msg => {
    //console.log(`Worker get msg: ${JSON.stringify(msg)}`)

    SubChainCenterWorker.instance.onMessage(msg);
  });
}

class SubChainCenterWorker {
  private static _instance: SubChainCenterWorker | null = null;
  public static get instance(): SubChainCenterWorker {
    if (this._instance == null) {
      this._instance = new SubChainCenterWorker(workerData);
    }
    return this._instance;
  }

  verifyFunc?: SubChainCenter.VerifyFunc;
  applyFunc?: SubChainCenter.ApplyFunc;

  constructor(private _script: string) {
    if (!_script) {
      throw new Error(`SubChainCenterWorker Ctor ERROR: script is undefined}`);
    }
    this.verifyFunc = require(_script).verifyTransaction;
    this.applyFunc = require(_script).applyTransaction;

    //console.log(`SubChainCenterWorker constructor... `)
  }

  /**
   * 接收的消息处理结束时的统一调用
   * 为SubChainCenter解锁/返回数据/唤醒
   * @param msg
   * @param res
   */
  private _onHandleFinish(msg: WorkerMsg.ReqMsg, res?: WorkerMsg.ResMsg) {
    const sharedata = new Int32Array(msg.__sharedBuffer);
    if (res) {
      const resbin = res.getBytes();
      const buf = new Uint8Array(
        msg.__sharedBuffer,
        WorkerMsg.WORKER_DATA_IDX.DATA_OFFSET * 4,
        resbin.byteLength,
      );
      buf.set(resbin);
      Atomics.store(sharedata, WorkerMsg.WORKER_DATA_IDX.DATASIZE_OFFSET, resbin.byteLength);
    }
    Atomics.store(sharedata, WorkerMsg.WORKER_DATA_IDX.STATE_OFFSET, WorkerMsg.LOCK_STATE.UNLOCKED); //  完成
    Atomics.notify(sharedata, WorkerMsg.WORKER_DATA_IDX.STATE_OFFSET, 1); //  唤醒
  }

  /**
   * 数据处理
   * @param msg
   */
  onMessage(msg: WorkerMsg.ReqMsg) {
    let res: WorkerMsg.ResMsg | undefined = undefined;

    //console.log(`Worker::onMessage...`)
    switch (msg.opcode) {
      case WorkerMsg.OPCODE.TX_VERIFY_REQ:
        {
          res = this.handleTxVerifyReq(msg);
        }
        break;
      case WorkerMsg.OPCODE.TX_APPLY_REQ:
      default:
        break;
    }

    this._onHandleFinish(msg, res);
  }

  /**
   * 交易验证处理
   * @param msg
   */
  handleTxVerifyReq(msg: WorkerMsg.ReqMsg): WorkerMsg.TxVerifyRes {
    const reqMsg = msg as WorkerMsg.TxVerifyReq;
    const res = new WorkerMsg.TxVerifyRes();

    //console.log(`handleTxVerifyReq .....msg: ${JSON.stringify(msg)}`)
    if (this.verifyFunc) {
      const verifyRet = this.verifyFunc.call(
        this,
        reqMsg.body,
        reqMsg.customAsset,
      ) as SubChainCenter.VERIFY_RES;
      res.retCode = verifyRet.ret
        ? WorkerMsg.ERRORCODE.CODE_SUCCESS
        : WorkerMsg.ERRORCODE.CODE_TX_VERIFY_FAILED;
      res.message = verifyRet.message ? verifyRet.message : "";
      //console.log(`handleTxVerifyReq verifyRet: ${JSON.stringify(res)}`)
    } else {
      res.retCode = WorkerMsg.ERRORCODE.CODE_TX_VERIFY_NOTFOUNDFUNC;
      res.message = `not found verify function`;
    }

    return res;
  }
}
