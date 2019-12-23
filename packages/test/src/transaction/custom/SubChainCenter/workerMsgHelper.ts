import * as WorkerMsg from "./message";

/**
 * WorkerMsgHelper
 * 主要用于辅助Worker向SubCenter返回数据时的数据解析
 */
export class WorkerMsgHelper {
  private static _instance: WorkerMsgHelper | null = null;
  public static get instance(): WorkerMsgHelper {
    if (this._instance == null) {
      this._instance = new WorkerMsgHelper();
    }
    return this._instance;
  }

  private _opcode_type_map!: Map<WorkerMsg.OPCODE, typeof WorkerMsg.ResMsg>;
  constructor() {
    this._buildOpcodeTypeMap();
  }

  //  根据opcode获取消息构造函数
  getSubChainMessageConstructorFromOpcode(opcode: WorkerMsg.OPCODE) {
    return this._opcode_type_map.get(opcode);
  }

  //  构建opcode<->SubChainMsg构造函数的对应map
  private _op_msg_arr: [WorkerMsg.OPCODE, typeof WorkerMsg.ResMsg][] = [
    [WorkerMsg.OPCODE.TX_VERIFY_RES, WorkerMsg.TxVerifyRes],
    [WorkerMsg.OPCODE.TX_APPLY_RES, WorkerMsg.TxVerifyRes],
  ];
  private _buildOpcodeTypeMap() {
    this._opcode_type_map = new Map<WorkerMsg.OPCODE, typeof WorkerMsg.ResMsg>();
    this._op_msg_arr.forEach(([K, V]) => {
      this._opcode_type_map.set(K, V);
    });
  }
}
