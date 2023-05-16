export enum MACRO_INPUT_TYPE {
  TEXT = "text", // = 1 << INC++,
  ADDRESS = "address", // = (1 << INC++) | MACRO_INPUT_TYPE.TEXT,
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
