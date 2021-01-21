// #region 区块分叉原因
export enum BLOCK_FORK_CAUSE {
  /**前块签名不一致 */
  DIFFERENT_PRE_BLOCK_SIGNATURE = "the previous block signature is inconsistent",
  /**锻造区块失败 */
  GENERATE_BLOCK_FAIL = "generate block fail",
  /**重放区块失败 */
  REPLY_BLOCK_FAIL = "reply block fail",
}
// #endregion
