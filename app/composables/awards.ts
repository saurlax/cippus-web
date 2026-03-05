export const awardLevels = {
  national: "国家级",
  provincial: "省级",
  university: "校级",
  college: "学院级",
} as const;

export const awardTypes = {
  team_first_prize: "团体一等奖",
  team_second_prize: "团体二等奖",
  team_third_prize: "团体三等奖",
  individual_1st: "个人一等奖",
  individual_2nd: "个人二等奖",
  individual_3rd: "个人三等奖",
  individual_4th: "个人四等奖",
  individual_5th: "个人五等奖",
  individual_6th: "个人六等奖",
} as const;

export const awardLevelItems = Object.entries(awardLevels).map(
  ([value, label]) => ({ value, label })
);

export const awardTypeItems = Object.entries(awardTypes).map(
  ([value, label]) => ({ value, label })
);

export function useAwards() {
  return {
    awardLevels,
    awardTypes,
    awardLevelItems,
    awardTypeItems,
  };
}

