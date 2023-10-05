import { Element, EyeColor, HairColor, Pose } from '../data';

export function toHairColor(hairColor: string): HairColor {
  switch (hairColor) {
    case '00F':
      return HairColor.blue;
    case '888':
      return HairColor.grey;
    case 'FF0':
      return HairColor.blond;
    case 'FFF':
      return HairColor.white;
    case 'F99':
      return HairColor.pink;
    case 'CCC':
      return HairColor.silver;
    case 'F00':
      return HairColor.red;
    case 'B62':
      return HairColor.darkBlond;
    case '321':
      return HairColor.dark;
    case '0F0':
      return HairColor.green;
    case 'F0F':
      return HairColor.purple;
    case 'F90':
      return HairColor.orange;
    case '000':
      return HairColor.black;
    case 'A55':
      return HairColor.brown;
    case 'FD0':
      return HairColor.golden;
    case 'B06':
      return HairColor.darkPink;
    case 'EB8':
      return HairColor.strawberryBlond;
    case 'XXX':
      return HairColor.unknown;
    case 'D83':
      return HairColor.bronze;
    default:
      return HairColor.unknown;
  }
}

export function toEyeColor(eyeColor: string): EyeColor {
  switch (eyeColor) {
    case '00F':
      return EyeColor.blue;
    case 'FD0':
      return EyeColor.golden;
    case '0F0':
      return EyeColor.green;
    case 'A55':
      return EyeColor.brown;
    case 'F99':
      return EyeColor.pink;
    case 'F00':
      return EyeColor.red;
    case 'F0F':
      return EyeColor.purple;
    case 'F90':
      return EyeColor.orange;
    case 'CCC':
      return EyeColor.silver;
    case 'B06':
      return EyeColor.darkPink;
    case '000':
      return EyeColor.black;
    case '888':
      return EyeColor.grey;
    case 'XXX':
      return EyeColor.unknown;
    case '321':
      return EyeColor.dark;
    default:
      return EyeColor.unknown;
  }
}

export function toFavPose(pose: string): Pose {
  switch (pose) {
    case 'doggystyle':
      return Pose.doggie;
    case 'dolphin':
      return Pose.dolphin;
    case 'missionary':
      return Pose.missionary;
    case 'sodomy':
      return Pose.sodomy;
    case '69':
      return Pose.sixnine;
    case 'jackhammer':
      return Pose.jackhammer;
    case 'nosedive':
      return Pose.nosedive;
    case 'column':
      return Pose.column;
    case 'indian':
      return Pose.indian;
    case 'suspendedcongress':
      return Pose.suspended;
    case 'splittingbamboo':
      return Pose.splitting;
    case 'bridge':
      return Pose.bridge;
  }
  return Pose.unknown;
}

export function toElement(elementName: string): Element {
  // elementName can be specified as "stone" or "stone_flavor_element"
  // Trim the _flavor_element suffix when present
  if (elementName.endsWith('_flavor_element')) {
    const suffixIndex = elementName.indexOf('_flavor_element');
    elementName = elementName.substring(0, suffixIndex);
  }
  switch (elementName) {
    case 'sun':
      return Element.yellow;
    case 'psychic':
      return Element.purple;
    case 'water':
      return Element.blue;
    case 'nature':
      return Element.green;
    case 'stone':
      return Element.orange;
    case 'darkness':
      return Element.dark;
    case 'fire':
      return Element.red;
    case 'light':
      return Element.white;
    default:
      return Element.yellow;
  }
}
