export type CatGender = "male" | "female" | "unknown";
export type CatLifeStage = "kitten" | "adult" | "senior" | "unknown";

export type CatBreedOption = {
  id: string;
  label: string;
  labelEn: string;
  englishName: string;
  group: "household" | "longhair" | "shorthair" | "oriental" | "rex" | "hairless";
  illustration: CatIllustrationId;
};

export type CatIllustrationId =
  | "british-shorthair"
  | "orange-tabby"
  | "ragdoll"
  | "black-shorthair"
  | "siamese"
  | "cream-longhair"
  | "bengal"
  | "russian-blue"
  | "maine-coon"
  | "persian"
  | "sphynx"
  | "calico";

export type CatIllustrationOption = {
  id: CatIllustrationId;
  label: string;
  labelEn: string;
  src: string;
};

export const catIllustrationOptions = [
  {
    id: "british-shorthair",
    label: "银灰短毛",
    labelEn: "Grey shorthair",
    src: "/catcare/cats/cat-british-shorthair.webp"
  },
  {
    id: "orange-tabby",
    label: "橘色虎斑",
    labelEn: "Orange tabby",
    src: "/catcare/cats/cat-orange-tabby.webp"
  },
  {
    id: "ragdoll",
    label: "长毛布偶",
    labelEn: "Ragdoll longhair",
    src: "/catcare/cats/cat-ragdoll.webp"
  },
  {
    id: "black-shorthair",
    label: "黑色短毛",
    labelEn: "Black shorthair",
    src: "/catcare/cats/cat-black-shorthair.webp"
  },
  {
    id: "siamese",
    label: "重点色暹罗",
    labelEn: "Siamese point",
    src: "/catcare/cats/cat-siamese.webp"
  },
  {
    id: "cream-longhair",
    label: "奶油长毛",
    labelEn: "Cream longhair",
    src: "/catcare/cats/cat-cream-longhair.webp"
  },
  {
    id: "bengal",
    label: "豹纹短毛",
    labelEn: "Bengal spotted",
    src: "/catcare/cats/cat-bengal.webp"
  },
  {
    id: "russian-blue",
    label: "蓝灰短毛",
    labelEn: "Russian blue",
    src: "/catcare/cats/cat-russian-blue.webp"
  },
  {
    id: "maine-coon",
    label: "蓬松缅因",
    labelEn: "Maine coon",
    src: "/catcare/cats/cat-maine-coon.webp"
  },
  {
    id: "persian",
    label: "扁脸长毛",
    labelEn: "Persian longhair",
    src: "/catcare/cats/cat-persian.webp"
  },
  {
    id: "sphynx",
    label: "无毛猫",
    labelEn: "Sphynx",
    src: "/catcare/cats/cat-sphynx.webp"
  },
  {
    id: "calico",
    label: "三花家猫",
    labelEn: "Calico",
    src: "/catcare/cats/cat-calico.webp"
  }
] as const satisfies readonly CatIllustrationOption[];

// Sources checked: CFA recognized breeds, FIFe recognised breeds, and TICA breed registry references.
export const catBreedOptions = [
  { id: "domestic-shorthair", label: "家猫短毛", labelEn: "Domestic Shorthair", englishName: "Domestic Shorthair", group: "household", illustration: "calico" },
  { id: "domestic-longhair", label: "家猫长毛", labelEn: "Domestic Longhair", englishName: "Domestic Longhair", group: "household", illustration: "cream-longhair" },
  { id: "mixed", label: "混种", labelEn: "Mixed Breed", englishName: "Mixed Breed", group: "household", illustration: "calico" },
  { id: "li-hua", label: "狸花猫", labelEn: "Chinese Li Hua", englishName: "Chinese Li Hua", group: "shorthair", illustration: "orange-tabby" },
  { id: "orange-tabby", label: "橘猫", labelEn: "Orange Tabby", englishName: "Orange Tabby", group: "household", illustration: "orange-tabby" },
  { id: "abyssinian", label: "阿比西尼亚", labelEn: "Abyssinian", englishName: "Abyssinian", group: "shorthair", illustration: "orange-tabby" },
  { id: "american-bobtail", label: "美国短尾猫", labelEn: "American Bobtail", englishName: "American Bobtail", group: "shorthair", illustration: "british-shorthair" },
  { id: "american-curl", label: "美国卷耳猫", labelEn: "American Curl", englishName: "American Curl", group: "shorthair", illustration: "cream-longhair" },
  { id: "american-shorthair", label: "美国短毛猫", labelEn: "American Shorthair", englishName: "American Shorthair", group: "shorthair", illustration: "british-shorthair" },
  { id: "american-wirehair", label: "美国硬毛猫", labelEn: "American Wirehair", englishName: "American Wirehair", group: "shorthair", illustration: "orange-tabby" },
  { id: "balinese", label: "巴厘猫", labelEn: "Balinese", englishName: "Balinese", group: "oriental", illustration: "siamese" },
  { id: "bengal", label: "孟加拉猫", labelEn: "Bengal", englishName: "Bengal", group: "shorthair", illustration: "bengal" },
  { id: "birman", label: "伯曼猫", labelEn: "Birman", englishName: "Birman", group: "longhair", illustration: "ragdoll" },
  { id: "bombay", label: "孟买猫", labelEn: "Bombay", englishName: "Bombay", group: "shorthair", illustration: "black-shorthair" },
  { id: "british-longhair", label: "英国长毛猫", labelEn: "British Longhair", englishName: "British Longhair", group: "longhair", illustration: "cream-longhair" },
  { id: "british-shorthair", label: "英国短毛猫", labelEn: "British Shorthair", englishName: "British Shorthair", group: "shorthair", illustration: "british-shorthair" },
  { id: "burmese", label: "缅甸猫", labelEn: "Burmese", englishName: "Burmese", group: "shorthair", illustration: "black-shorthair" },
  { id: "burmilla", label: "波米拉猫", labelEn: "Burmilla", englishName: "Burmilla", group: "shorthair", illustration: "british-shorthair" },
  { id: "chartreux", label: "沙特尔猫", labelEn: "Chartreux", englishName: "Chartreux", group: "shorthair", illustration: "british-shorthair" },
  { id: "cornish-rex", label: "柯尼斯卷毛猫", labelEn: "Cornish Rex", englishName: "Cornish Rex", group: "rex", illustration: "orange-tabby" },
  { id: "devon-rex", label: "德文卷毛猫", labelEn: "Devon Rex", englishName: "Devon Rex", group: "rex", illustration: "orange-tabby" },
  { id: "egyptian-mau", label: "埃及猫", labelEn: "Egyptian Mau", englishName: "Egyptian Mau", group: "shorthair", illustration: "orange-tabby" },
  { id: "exotic-shorthair", label: "异国短毛猫", labelEn: "Exotic Shorthair", englishName: "Exotic Shorthair", group: "shorthair", illustration: "persian" },
  { id: "havana-brown", label: "哈瓦那棕猫", labelEn: "Havana Brown", englishName: "Havana Brown", group: "shorthair", illustration: "black-shorthair" },
  { id: "japanese-bobtail", label: "日本短尾猫", labelEn: "Japanese Bobtail", englishName: "Japanese Bobtail", group: "shorthair", illustration: "orange-tabby" },
  { id: "khao-manee", label: "考马尼猫", labelEn: "Khao Manee", englishName: "Khao Manee", group: "shorthair", illustration: "cream-longhair" },
  { id: "korat", label: "呵叻猫", labelEn: "Korat", englishName: "Korat", group: "shorthair", illustration: "british-shorthair" },
  { id: "laperm", label: "拉邦猫", labelEn: "LaPerm", englishName: "LaPerm", group: "rex", illustration: "cream-longhair" },
  { id: "lykoi", label: "狼猫", labelEn: "Lykoi", englishName: "Lykoi", group: "shorthair", illustration: "black-shorthair" },
  { id: "maine-coon", label: "缅因猫", labelEn: "Maine Coon", englishName: "Maine Coon", group: "longhair", illustration: "maine-coon" },
  { id: "manx", label: "马恩岛猫", labelEn: "Manx", englishName: "Manx", group: "shorthair", illustration: "british-shorthair" },
  { id: "munchkin", label: "曼基康", labelEn: "Munchkin", englishName: "Munchkin", group: "shorthair", illustration: "orange-tabby" },
  { id: "norwegian-forest", label: "挪威森林猫", labelEn: "Norwegian Forest Cat", englishName: "Norwegian Forest Cat", group: "longhair", illustration: "cream-longhair" },
  { id: "ocicat", label: "奥西猫", labelEn: "Ocicat", englishName: "Ocicat", group: "shorthair", illustration: "orange-tabby" },
  { id: "oriental", label: "东方猫", labelEn: "Oriental", englishName: "Oriental", group: "oriental", illustration: "siamese" },
  { id: "persian", label: "波斯猫", labelEn: "Persian", englishName: "Persian", group: "longhair", illustration: "persian" },
  { id: "ragamuffin", label: "褴褛猫", labelEn: "Ragamuffin", englishName: "Ragamuffin", group: "longhair", illustration: "ragdoll" },
  { id: "ragdoll", label: "布偶猫", labelEn: "Ragdoll", englishName: "Ragdoll", group: "longhair", illustration: "ragdoll" },
  { id: "russian-blue", label: "俄罗斯蓝猫", labelEn: "Russian Blue", englishName: "Russian Blue", group: "shorthair", illustration: "russian-blue" },
  { id: "savannah", label: "萨凡纳猫", labelEn: "Savannah", englishName: "Savannah", group: "shorthair", illustration: "orange-tabby" },
  { id: "scottish-fold", label: "苏格兰折耳猫", labelEn: "Scottish Fold", englishName: "Scottish Fold", group: "shorthair", illustration: "british-shorthair" },
  { id: "selkirk-rex", label: "塞尔凯克卷毛猫", labelEn: "Selkirk Rex", englishName: "Selkirk Rex", group: "rex", illustration: "cream-longhair" },
  { id: "siamese", label: "暹罗猫", labelEn: "Siamese", englishName: "Siamese", group: "oriental", illustration: "siamese" },
  { id: "siberian", label: "西伯利亚猫", labelEn: "Siberian", englishName: "Siberian", group: "longhair", illustration: "cream-longhair" },
  { id: "singapura", label: "新加坡猫", labelEn: "Singapura", englishName: "Singapura", group: "shorthair", illustration: "orange-tabby" },
  { id: "snowshoe", label: "雪鞋猫", labelEn: "Snowshoe", englishName: "Snowshoe", group: "shorthair", illustration: "siamese" },
  { id: "somali", label: "索马里猫", labelEn: "Somali", englishName: "Somali", group: "longhair", illustration: "orange-tabby" },
  { id: "sphynx", label: "斯芬克斯猫", labelEn: "Sphynx", englishName: "Sphynx", group: "hairless", illustration: "sphynx" },
  { id: "tonkinese", label: "东奇尼猫", labelEn: "Tonkinese", englishName: "Tonkinese", group: "oriental", illustration: "siamese" },
  { id: "turkish-angora", label: "土耳其安哥拉猫", labelEn: "Turkish Angora", englishName: "Turkish Angora", group: "longhair", illustration: "cream-longhair" },
  { id: "turkish-van", label: "土耳其梵猫", labelEn: "Turkish Van", englishName: "Turkish Van", group: "longhair", illustration: "cream-longhair" },
  { id: "unknown", label: "不确定", labelEn: "Not sure", englishName: "Not sure", group: "household", illustration: "british-shorthair" }
] as const satisfies readonly CatBreedOption[];

export const catGenderOptions = [
  { id: "male", label: "公猫", labelEn: "Male" },
  { id: "female", label: "母猫", labelEn: "Female" },
  { id: "unknown", label: "不确定", labelEn: "Not sure" }
] as const;

export function getCatBreedOption(breedId: string | null | undefined) {
  return catBreedOptions.find((breed) => breed.id === breedId) ?? catBreedOptions[0];
}

export function isCatBreedId(value: string) {
  return catBreedOptions.some((breed) => breed.id === value);
}

export function getCatIllustrationSrc(kind: CatBreedOption["illustration"]) {
  return getCatIllustrationOption(kind).src;
}

export function getCatIllustrationOption(
  id: string | null | undefined
) {
  return (
    catIllustrationOptions.find((option) => option.id === id) ??
    catIllustrationOptions[0]
  );
}

export function isCatIllustrationSrc(value: string) {
  return normalizeCatIllustrationSrc(value) !== null;
}

export function normalizeCatIllustrationSrc(value: string) {
  const option = catIllustrationOptions.find(
    (item) => item.src === value || item.src.replace(/\.webp$/, ".png") === value
  );

  return option?.src ?? null;
}

export function getLifeStageFromBirthDate(birthDate: string | null): CatLifeStage {
  if (!birthDate) {
    return "unknown";
  }

  const bornAt = new Date(`${birthDate}T00:00:00Z`);

  if (Number.isNaN(bornAt.getTime())) {
    return "unknown";
  }

  const ageMs = Date.now() - bornAt.getTime();
  const ageYears = ageMs / (365.2425 * 24 * 60 * 60 * 1000);

  if (ageYears < 1) {
    return "kitten";
  }

  return ageYears >= 11 ? "senior" : "adult";
}
