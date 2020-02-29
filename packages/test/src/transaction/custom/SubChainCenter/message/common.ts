/**
 * worker线程opcode
 */
export enum OPCODE {
  UNKNOWN = 0,
  TX_VERIFY_REQ,
  TX_VERIFY_RES,
  TX_APPLY_REQ,
  TX_APPLY_RES,
}

/**
 * 线程数据传递时，数据的偏移
 */
export enum WORKER_DATA_IDX {
  STATE_OFFSET = 0,
  DATASIZE_OFFSET,
  DATA_OFFSET,
}

/**
 * 线程数据处理的状态...
 */
export enum LOCK_STATE {
  UNLOCKED = 0,
  LOCKED_NO_WAITERS,
  LOCKED_POSSIBLE_WAITERS,
}

/** 错误编码定义，在这里的均为基础编码。不能超过10000 */
export enum ERRORCODE {
  CODE_SUCCESS = 0,

  CODE_TX_VERIFY_FAILED,
  CODE_TX_VERIFY_NOTFOUNDFUNC,

  CODE_WORKER_RUNTIME_ERROR,
}
export const CUSTOM_ERRORCODE_OFFSET = 10000; //  拓展链自定义错误编码偏移
