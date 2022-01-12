import { I18N_LANGUAGE_TYPE } from "@bfchain/util-i18n";

import { ERROR_CODE_LIST_EN } from "./errorCode_list_en";
import { ERROR_CODE_LIST_ZH } from "./errorCode_list_zh";

const translatedMap: BFChainUtil.TranslatedErrorCodeListMap = new Map();
translatedMap.set(I18N_LANGUAGE_TYPE.ENGLISH, ERROR_CODE_LIST_EN);
translatedMap.set(I18N_LANGUAGE_TYPE.CHINESE, ERROR_CODE_LIST_ZH);

export const translatedErrorCodeListMap = translatedMap;
