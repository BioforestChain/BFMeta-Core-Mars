// import { CrossChainV1DefaultConverter } from "../default/";
// import { FieldConverter } from "../default/1";

// const fieldConverter = FieldConverter();
// type DefaultType = typeof fieldConverter["$TYPE"];
// type DefaultKeys = DefaultType[0];
// type SomeFieldNameVersion<K, N> = K extends `${infer _}/${infer FieldName}/${infer K}`
//   ? N extends FieldName
//     ? K
//     : never
//   : never;
// class Magic1ChainV1Converter extends CrossChainV1DefaultConverter {
//   protected _init() {
//     super._init();

//     if (!this.__fromChainId) {
//       this.__fromChainId = fieldConverter.get(`1/fromChainId/${this.config.fromChainIdVersion}` as never);
//     }
//     if (!this.__toChainId) {
//       this.__toChainId = fieldConverter.get(`1/toChainId/${this.config.toChainIdVersion}` as never);
//     }
//     if (!this.__fromId) {
//       this.__fromId = fieldConverter.get(`1/fromId/${this.config.fromIdVersion}` as never);
//     }
//     if (!this.__toId) {
//       this.__toId = fieldConverter.get(`1/toId/${this.config.toIdVersion}` as never);
//     }
//     if (!this.__assetTypeId) {
//       this.__assetTypeId = fieldConverter.get(`1/assetTypeId/${this.config.assetTypeIdVersion}` as never);
//     }
//     if (!this.__signature) {
//       this.__signature = fieldConverter.get(`1/signature/${this.config.signatureVersion}` as never);
//     }
//   }
// }
