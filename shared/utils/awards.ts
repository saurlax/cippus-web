import { awardLevelEnum, awardTypeEnum } from "@nuxthub/db/schema";

export const awardLevels = awardLevelEnum.enumValues as readonly string[];
export const awardTypes = awardTypeEnum.enumValues as readonly string[];

export const awardLevelItems = awardLevels.map((v) => ({ value: v, label: v }));
export const awardTypeItems = awardTypes.map((v) => ({ value: v, label: v }));
