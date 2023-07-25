export enum MACRO_INPUT_TYPE {
  TEXT = "text", // = 1 << INC++,
  ADDRESS = "address", // = (1 << INC++) | MACRO_INPUT_TYPE.TEXT,
  PUBLICKEY = "publicKey", // = (1 << INC++) | MACRO_INPUT_TYPE.TEXT,
  SIGNATURE = "signature", // = (1 << INC++) | MACRO_INPUT_TYPE.TEXT,
  NUMBER = "number", // = 1 << INC++,
  CALC = "calc", // = (1 << INC++) | MACRO_INPUT_TYPE.NUMBER,
}

/**
 * 默认是字符串
 * 可以强制指定成数字字面量
 */
export enum MACRO_NUMBER_FORMAT {
  /** 字符串 */
  STRING = "string",
  /** 数字字面量 */
  LITERAL = "literal",
}

/**
 * 精度
 *
 */
export enum MACRO_CALC_PRECISION {
  /**4 bytes 百以内小计算，很懂边界问题的人才会用 */
  FLOAT_32 = "float32",
  /**8 bytes 通用，正常人使用 */
  FLOAT_64 = "float64",
  /**16 bytes 商业问题使用 */
  FLOAT_128 = "float128",
  /**大数 数学问题使用 */
  FLOAT_big = "bigfloat",
}
