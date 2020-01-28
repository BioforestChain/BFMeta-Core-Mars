declare namespace BFChainCore {
  //#region TransactionHelper
  namespace TransactionHelper {
    /**
     * generateGrabAsset 方法的参数
     */
    type GenerateGrabAssetOptions = {
      /**抢红包者的地址 */
      grabId?: string;
      /**抢红包者的主密码 */
      mainSecret: string;
      /**抢红包者的二次密码，如果有的话 */
      secondSecret?: string;
      /**红包开启的密码，用于生成交易中的 ciphertextSignature */
      grabSecret?: string;
    };
  }
  //#endregion
}
