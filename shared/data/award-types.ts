const nationalPrizeNames = [
  "一等奖",
  "二等奖",
  "三等奖",
];

const rankNames = [
  "第一名",
  "第二名",
  "第三名",
  "第四名",
  "第五名",
  "第六名",
];

function withPrefix(prefix: string, names: string[]) {
  return names.map((name) => `${prefix} ${name}`);
}

export const defaultAwardTypeNames = [
  ...withPrefix("国家级及以上", nationalPrizeNames),
  ...withPrefix("国家级及以上", rankNames),
  "国家级及以上 其他奖项",
  "国家级及以上 推荐参赛未获奖",
  "重要国际比赛获奖",
  ...withPrefix("省级", nationalPrizeNames),
  ...withPrefix("省级", rankNames),
  "省级 其他奖项",
  "省级 推荐参赛未获奖",
  ...withPrefix("市级", nationalPrizeNames),
  ...withPrefix("市级", rankNames),
  "市级 其他奖项",
  "市级 推荐参赛未获奖",
  ...withPrefix("校级", nationalPrizeNames),
  ...withPrefix("校级", rankNames),
  "校级 其他奖项",
  "院级 推荐参赛未获奖",
  "院级 第一名",
  "院级 第二名",
  "院级 第三名",
] as const;
