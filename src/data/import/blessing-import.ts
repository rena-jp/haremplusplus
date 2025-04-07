import {
  toElement,
  toEyeColor,
  toFavPose,
  toHairColor
} from './attribute-mappings';
import {
  Blessing,
  BlessingDefinition,
  BlessingType,
  Element,
  EyeColor,
  getRarity,
  HairColor,
  Pose,
  Rarity,
  Role,
  Zodiac,
  Zodiacs
} from '../data';
import filtersKeys from './filters-keys.json';
import { GameBlessing, GameBlessingData } from '../game-data';

interface LanguageKeys {
  en: Translations;
  fr: Translations;
  de: Translations;
  es: Translations;
  it: Translations;
  jp: Translations;
  ru: Translations;
}

interface Translations {
  [key: string]: string;
}

export function getBlessings(blessingData: GameBlessingData): {
  currentBlessings: BlessingDefinition[];
  upcomingBlessings: BlessingDefinition[];
} {
  if (blessingData) {
    const activeBlessingData = blessingData.active;
    const nextBlessingData = blessingData.upcoming;
    return {
      currentBlessings: parseBlessing(activeBlessingData),
      upcomingBlessings: parseBlessing(nextBlessingData)
    };
  }
  return {
    currentBlessings: [],
    upcomingBlessings: []
  };
}

function parseBlessing(blessingData: GameBlessing[]): BlessingDefinition[] {
  const result: BlessingDefinition[] = [];
  for (const activeBlessing of blessingData) {
    const description = activeBlessing.description;
    // const startTs = activeBlessing.startTs;
    // const endTs = activeBlessing.endTs;
    const blessing = extractBlessingFromDescription(description);
    if (blessing !== undefined) {
      const bonus = extractBonus(description);
      result.push({ ...blessing, blessingBonus: bonus });
    } else {
      console.error('Failed to parse blessing: ', activeBlessing);
      throw ['Failed to parse blessing: ', activeBlessing];
    }
  }
  return result;
}

function extractBlessingFromDescription(
  description: string
): BlessingType | undefined {
  const regex = /class="blessing-condition">([^<]+)/;
  const result = description.match(regex);
  if (result && result[1]) {
    const condition = result[1];

    return extractBlessingFromCondition(condition);
  }
  console.error(
    'Blessing condition regex didnt match. Failed to parse the blessing.'
  );
  return undefined;
}

/**
 * Parse the condition to find the blessing (type and value). Note that the condition
 * will be written in the user's language.
 * @param condition the condition, e.g. "Position préférée Néophyte"
 */
function extractBlessingFromCondition(
  condition: string
): BlessingType | undefined {
  const allPrefixes = new Map<string, Blessing>();
  // FR
  allPrefixes.set('Position préférée', Blessing.Pose);
  allPrefixes.set('Couleur des yeux', Blessing.EyeColor);
  allPrefixes.set('Couleur de cheveux', Blessing.HairColor);
  allPrefixes.set('Signe astrologique', Blessing.Zodiac);
  allPrefixes.set('Élément', Blessing.Element);
  allPrefixes.set('Rareté', Blessing.Rarity);

  // EN

  allPrefixes.set('Favorite position', Blessing.Pose);
  allPrefixes.set('Eye Color', Blessing.EyeColor);
  allPrefixes.set('Hair Color', Blessing.HairColor);
  allPrefixes.set('Zodiac sign', Blessing.Zodiac);
  allPrefixes.set('Element', Blessing.Element);
  allPrefixes.set('Rarity', Blessing.Rarity);

  // DE

  allPrefixes.set('Lieblingsstellung', Blessing.Pose);
  allPrefixes.set('Augenfarbe', Blessing.EyeColor);
  allPrefixes.set('Haarfarbe', Blessing.HairColor);
  allPrefixes.set('Sternzeichen', Blessing.Zodiac);
  allPrefixes.set('Element', Blessing.Element);
  allPrefixes.set('Seltenheit', Blessing.Rarity);

  // ES

  allPrefixes.set('Posición favorita', Blessing.Pose);
  allPrefixes.set('Color de Ojos', Blessing.EyeColor);
  allPrefixes.set('Color de Cabello', Blessing.HairColor);
  allPrefixes.set('Signo zodiacal', Blessing.Zodiac);
  allPrefixes.set('Elemento', Blessing.Element);
  allPrefixes.set('Rareza', Blessing.Rarity);

  // IT

  allPrefixes.set('Posizione preferita', Blessing.Pose);
  allPrefixes.set('Colore degli occhi', Blessing.EyeColor);
  allPrefixes.set('Colore dei capelli', Blessing.HairColor);
  allPrefixes.set('Segno zodiacale', Blessing.Zodiac);
  allPrefixes.set('Elemento', Blessing.Element);
  allPrefixes.set('Rarità', Blessing.Rarity);

  // JP

  allPrefixes.set('お気に入りの体位', Blessing.Pose);
  allPrefixes.set('目の色', Blessing.EyeColor);
  allPrefixes.set('髪の色', Blessing.HairColor);
  allPrefixes.set('Zodiac sign', Blessing.Zodiac);
  allPrefixes.set('Element', Blessing.Element);
  allPrefixes.set('希少さ', Blessing.Rarity);

  // RU

  allPrefixes.set('Любимая поза', Blessing.Pose);
  allPrefixes.set('Цвет глаз', Blessing.EyeColor);
  allPrefixes.set('Цвет волос', Blessing.HairColor);
  allPrefixes.set('Знак зодиака', Blessing.Zodiac);
  allPrefixes.set('Element', Blessing.Element);
  allPrefixes.set('Редкость', Blessing.Rarity);

  // from Game (may be incorrect)

  allPrefixes.set(window.GT.design.filter_pose, Blessing.Pose);
  allPrefixes.set(window.GT.design.haremdex_eye_color, Blessing.EyeColor);
  allPrefixes.set(window.GT.design.haremdex_hair_color, Blessing.HairColor);
  allPrefixes.set(window.GT.design.haremdex_zodiac_sign, Blessing.Zodiac);
  allPrefixes.set(window.GT.design.element, Blessing.Element);
  allPrefixes.set(window.GT.design.selectors_Rarity, Blessing.Rarity);
  allPrefixes.set(window.GT.design.girl_role, Blessing.Role);

  for (const prefix of allPrefixes.keys()) {
    if (condition.startsWith(prefix)) {
      const blessing = allPrefixes.get(prefix)!;
      const value = parseBlessingValue(
        blessing,
        condition.substring(prefix.length).trim()
      );
      if (value !== undefined && !isNaN(value)) {
        return {
          blessing: blessing,
          blessingValue: value
        };
      }
    }
  }
  console.error('Failed to parse blessing condition: ', condition);
  return undefined;
}

function parseBlessingValue(
  blessing: Blessing,
  rawValue: string
): Rarity | HairColor | EyeColor | Zodiac | Pose | Element | Role | undefined {
  rawValue = rawValue.trim();

  if (blessing === Blessing.Rarity) {
    const map = new Map<string, number>(
      ['starting', 'common', 'rare', 'epic', 'legendary', 'mythic'].map(
        (e, i) => [window.GT.design[`girls_rarity_${e}`]?.trim(), i]
      )
    );
    const rarity = map.get(rawValue);
    if (rarity != null) {
      return rarity as Rarity;
    }
  }

  if (blessing === Blessing.HairColor || blessing === Blessing.EyeColor) {
    const map = new Map<string, string>(
      Object.entries(window.GT.colors).map((e) => [e[1]?.trim(), e[0]])
    );
    const color = map.get(rawValue);
    if (color != null) {
      if (blessing === Blessing.HairColor) {
        return toHairColor(color);
      }
      if (blessing === Blessing.EyeColor) {
        return toEyeColor(color);
      }
    }
  }

  if (blessing === Blessing.Zodiac) {
    const map = new Map<string, number>(
      [
        'aries',
        'taurus',
        'gemini',
        'cancer',
        'leo',
        'virgo',
        'libra',
        'scorpio',
        'sagittarius',
        'capricorn',
        'aquarius',
        'pisces'
      ].map((e, i) => [window.GT.zodiac[e]?.trim(), i])
    );
    const zodiac = map.get(rawValue);
    if (zodiac != null) {
      return zodiac as Zodiac;
    }
  }

  if (blessing === Blessing.Element) {
    const map = new Map<string, number>(
      [
        'fire',
        'water',
        'sun',
        'stone',
        'nature',
        'psychic',
        'light',
        'darkness'
      ].map((e, i) => [window.GT.design[`${e}_flavor_element`]?.trim(), i])
    );
    const element = map.get(rawValue);
    if (element != null) {
      return element as Element;
    }
  }

  if (blessing === Blessing.Pose) {
    const map = new Map<string, number>(
      window.GT.figures?.map((e, i) => [e.trim(), i])
    );
    const pose = map.get(rawValue);
    if (pose != null) {
      return pose as Pose;
    }
  }

  if (blessing === Blessing.Role) {
    const map = new Map<string, number>(
      [...Array(10)].map((_, i) => [
        window.GT.design[`girl_role_${i + 1}_name`]?.trim(),
        i + 1
      ])
    );
    const role = map.get(rawValue);
    if (role != null) {
      return role as Role;
    }
  }

  // Fall back to the older version

  if (blessing === Blessing.Zodiac) {
    // Special case for Zodiac: the sign might not be part of the resulting text, and should be ignored
    for (const zodiacSymbol of Zodiacs.Symbols) {
      for (const language in filtersKeys as LanguageKeys) {
        const allLanguageKeys: Translations =
          filtersKeys[language as keyof LanguageKeys];
        const zodiacText = allLanguageKeys[zodiacSymbol];
        if (zodiacText) {
          const shortZodiacText = zodiacText
            .substring(zodiacSymbol.length)
            .trim();
          if (rawValue === shortZodiacText) {
            return Zodiacs.fromSymbol(zodiacSymbol);
          }
        }
      }
    }
  }

  for (const language in filtersKeys) {
    const allLanguageKeys: Translations = filtersKeys[
      language as keyof LanguageKeys
    ] as unknown as Translations;
    const key = allLanguageKeys[rawValue];
    if (key !== undefined) {
      return getBlessingValue(blessing, key);
    }
  }

  return undefined;
}

function getBlessingValue(
  blessing: Blessing,
  blessingValue: string
): Rarity | HairColor | EyeColor | Zodiac | Pose | Element | Role {
  switch (blessing) {
    case Blessing.EyeColor:
      return toEyeColor(blessingValue);
    case Blessing.HairColor:
      return toHairColor(blessingValue);
    case Blessing.Element:
      return toElement(blessingValue);
    case Blessing.Pose:
      return toFavPose(blessingValue);
    case Blessing.Rarity:
      return getRarity(blessingValue as keyof typeof Rarity);
    case Blessing.Zodiac:
      return Zodiacs.fromString(blessingValue as keyof typeof Zodiac);
    case Blessing.Role: {
      const map = new Map(
        [...Array(10)].map((_, i) => [
          window.GT.design[`girl_role_${i + 1}_name`],
          i + 1
        ])
      );
      return map.get(blessingValue) as Role;
    }
    default:
      console.error("Unknown blessing; can't parse value");
      return 0;
  }
}

function extractBonus(description: string): number {
  const regex = '([0-9]{2})%';
  const match = description.match(regex);
  if (match) {
    const first = match[1];
    return Number(first);
  }
  console.error('Failed to extract blessing value');
  return 0;
}

// // Icons no longer exist... :(
// function extractBlessingFromIcon(icon: string): BlessingType {
//   const path = icon.lastIndexOf('/');
//   const iconName = icon.substring(path + 1);
//   const prefixIndex = iconName.lastIndexOf('_');
//   const blessingType = iconName.substring(0, prefixIndex);
//   const fileExtension = iconName.lastIndexOf('.');
//   const blessingValue = iconName.substring(prefixIndex + 1, fileExtension);
//
//   const type = getBlessingType(blessingType);
//   return {
//     blessing: type,
//     blessingValue: getBlessingValue(type, blessingValue)
//   };
// }
//
// No longer used: values were related to the blessing icon that no longer exists :(
// function getBlessingType(blessingType: string): Blessing {
//   switch (blessingType) {
//     case 'zodiac_sign':
//       return Blessing.Zodiac;
//     case 'eyes_color':
//       return Blessing.EyeColor;
//     case 'hair_color':
//       return Blessing.HairColor;
//     case 'elements':
//       return Blessing.Element;
//     case 'fav_pose':
//       return Blessing.Pose;
//     case 'rarity':
//       return Blessing.Rarity;
//     default:
//       console.error('Unknown blessing icon: ', blessingType);
//       return Blessing.Element;
//   }
// }
