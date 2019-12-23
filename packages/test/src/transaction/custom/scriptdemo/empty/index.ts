/**
 * 自定义交易范例
 * 必须导出的2个函数：
 *
 * .verifyTransaction
 *  返回 {ret:boolean, message:string}
 *      ret：验证结果
 *      message： 验证错误时的错误信息
 *
 * .applyTransaction
 *  返回 {ret:boolean, message:string}
 *      ret：apply结果
 *      message： apply发生错误时的错误信息
 */

/**
 * 验证Transaction
 * @param txBody
 * @param customAsset
 */
export function verifyTransaction(txBody: any, customAsset: any) {
  //const data = customAsset.custom.data as Uint8Array;

  return { ret: true, message: "empty sample verify" };
}

/**
 * 应用Transaction
 */
export function applyTransaction() {
  return { ret: true, message: "empty sample apply" };
}
