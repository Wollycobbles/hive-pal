type PollenRegionCode = 'UK_AND_IRELAND' | 'EUROPE';

type PollenSeasonCode =
  | 'early-spring'
  | 'spring'
  | 'late-spring'
  | 'summer'
  | 'late-summer'
  | 'autumn';

type BloomPeriod = 'early-spring' | 'spring' | 'late-spring' | 'summer' | 'autumn';

type PollenReferenceSeedRecord = {
  plantName: string;
  scientificName: string | null;
  colorLabel: string;
  colorGroup: string;
  hexColor: string;
  notes: string | null;
  active: boolean;
  regions: Array<{
    region: PollenRegionCode;
    seasons: PollenSeasonCode[];
    notes: string | null;
  }>;
};

type PollenReferenceSeedPlant = {
  plantName: string;
  scientificName: string | null;
  bloomPeriod: BloomPeriod;
  notes?: string | null;
};

type SheffieldSeason = 'spring' | 'summer' | 'autumn';

type PollenColorGroup =
  | 'black'
  | 'blue'
  | 'brown'
  | 'cream'
  | 'green'
  | 'grey'
  | 'orange'
  | 'red'
  | 'yellow';

type PollenColorProfile = {
  colorLabel: string;
  colorGroup: PollenColorGroup;
  hexColor: string;
};

const colorProfiles = {
  charcoalBlack: {
    colorLabel: 'charcoal black',
    colorGroup: 'black',
    hexColor: '#212423',
  },
  darkBrown: {
    colorLabel: 'dark brown',
    colorGroup: 'brown',
    hexColor: '#3c2724',
  },
  chestnutBrown: {
    colorLabel: 'chestnut brown',
    colorGroup: 'brown',
    hexColor: '#5b2722',
  },
  russetBrown: {
    colorLabel: 'russet brown',
    colorGroup: 'brown',
    hexColor: '#6c2d23',
  },
  deepRed: {
    colorLabel: 'deep red',
    colorGroup: 'red',
    hexColor: '#7b2028',
  },
  rustRed: {
    colorLabel: 'rust red',
    colorGroup: 'red',
    hexColor: '#bf453b',
  },
  coralOrange: {
    colorLabel: 'coral orange',
    colorGroup: 'orange',
    hexColor: '#d34d30',
  },
  brightCoral: {
    colorLabel: 'bright coral',
    colorGroup: 'orange',
    hexColor: '#f9563f',
  },
  orangeRed: {
    colorLabel: 'orange red',
    colorGroup: 'orange',
    hexColor: '#f94027',
  },
  tangerine: {
    colorLabel: 'tangerine',
    colorGroup: 'orange',
    hexColor: '#fa5a22',
  },
  snowdropOrange: {
    colorLabel: 'orange red',
    colorGroup: 'orange',
    hexColor: '#fa4723',
  },
  amberOrange: {
    colorLabel: 'amber orange',
    colorGroup: 'orange',
    hexColor: '#fc8a13',
  },
  goldenOrange: {
    colorLabel: 'golden orange',
    colorGroup: 'orange',
    hexColor: '#f17e19',
  },
  limeOrange: {
    colorLabel: 'orange amber',
    colorGroup: 'orange',
    hexColor: '#f47b1d',
  },
  willowOrange: {
    colorLabel: 'orange amber',
    colorGroup: 'orange',
    hexColor: '#f1911c',
  },
  rapeYellow: {
    colorLabel: 'bright yellow',
    colorGroup: 'yellow',
    hexColor: '#f8c900',
  },
  paleYellow: {
    colorLabel: 'pale yellow',
    colorGroup: 'yellow',
    hexColor: '#f4e66a',
  },
  oliveGreen: {
    colorLabel: 'olive green',
    colorGroup: 'green',
    hexColor: '#8a9b50',
  },
  meadowGreen: {
    colorLabel: 'green',
    colorGroup: 'green',
    hexColor: '#7c9028',
  },
  paleGreyGreen: {
    colorLabel: 'pale grey-green',
    colorGroup: 'grey',
    hexColor: '#ced5d5',
  },
  blueBlack: {
    colorLabel: 'blue-black',
    colorGroup: 'blue',
    hexColor: '#1d2d33',
  },
  beigeBrown: {
    colorLabel: 'beige brown',
    colorGroup: 'brown',
    hexColor: '#85674d',
  },
  cream: {
    colorLabel: 'cream',
    colorGroup: 'cream',
    hexColor: '#e8d8a2',
  },
  ivyYellow: {
    colorLabel: 'golden yellow',
    colorGroup: 'yellow',
    hexColor: '#fea722',
  },
  bellGreen: {
    colorLabel: 'soft green',
    colorGroup: 'green',
    hexColor: '#abb565',
  },
  marjoramBrown: {
    colorLabel: 'warm brown',
    colorGroup: 'brown',
    hexColor: '#a07234',
  },
  heatherGold: {
    colorLabel: 'heather gold',
    colorGroup: 'brown',
    hexColor: '#c58646',
  },
  hawthornOlive: {
    colorLabel: 'olive green',
    colorGroup: 'green',
    hexColor: '#afa32f',
  },
  goldBeige: {
    colorLabel: 'golden beige',
    colorGroup: 'yellow',
    hexColor: '#ebae56',
  },
  honeyYellow: {
    colorLabel: 'honey yellow',
    colorGroup: 'yellow',
    hexColor: '#edc652',
  },
  travellerJoyOlive: {
    colorLabel: 'olive green',
    colorGroup: 'green',
    hexColor: '#9e9734',
  },
  hollyOlive: {
    colorLabel: 'olive green',
    colorGroup: 'green',
    hexColor: '#8a8128',
  },
  fieldBeanBrown: {
    colorLabel: 'brown',
    colorGroup: 'brown',
    hexColor: '#916123',
  },
  sycamoreBrown: {
    colorLabel: 'brown',
    colorGroup: 'brown',
    hexColor: '#8c6124',
  },
  blackthornRed: {
    colorLabel: 'deep red',
    colorGroup: 'red',
    hexColor: '#a03128',
  },
  plumOrange: {
    colorLabel: 'orange red',
    colorGroup: 'orange',
    hexColor: '#ce4e27',
  },
  pearOrange: {
    colorLabel: 'amber orange',
    colorGroup: 'orange',
    hexColor: '#fba11a',
  },
  appleOrange: {
    colorLabel: 'amber orange',
    colorGroup: 'orange',
    hexColor: '#fc8a13',
  },
  winterHeathBrown: {
    colorLabel: 'winter heath brown',
    colorGroup: 'brown',
    hexColor: '#9a673f',
  },
  berberisOlive: {
    colorLabel: 'olive brown',
    colorGroup: 'brown',
    hexColor: '#7b6623',
  },
  floweringCurrantBrown: {
    colorLabel: 'brown',
    colorGroup: 'brown',
    hexColor: '#b68644',
  },
  cloverBrown: {
    colorLabel: 'brown',
    colorGroup: 'brown',
    hexColor: '#503225',
  },
  horseChestnutBrown: {
    colorLabel: 'dark brown',
    colorGroup: 'brown',
    hexColor: '#3c2724',
  },
  blackberryOlive: {
    colorLabel: 'olive brown',
    colorGroup: 'brown',
    hexColor: '#ad994e',
  },
  raspberryGrey: {
    colorLabel: 'grey green',
    colorGroup: 'grey',
    hexColor: '#aaac83',
  },
  meadowSageGreen: {
    colorLabel: 'green-yellow',
    colorGroup: 'green',
    hexColor: '#e3cc2a',
  },
  fieldScabiousOrange: {
    colorLabel: 'coral orange',
    colorGroup: 'orange',
    hexColor: '#f9563f',
  },
  meadowsweetGreen: {
    colorLabel: 'green',
    colorGroup: 'green',
    hexColor: '#7c9028',
  },
  bellHeathGreen: {
    colorLabel: 'soft green',
    colorGroup: 'green',
    hexColor: '#abb565',
  },
  eveningPrimroseYellow: {
    colorLabel: 'yellow',
    colorGroup: 'yellow',
    hexColor: '#e4ce22',
  },
} as const;

type ColorProfileKey = keyof typeof colorProfiles;

type PlantStyleRule = {
  match: RegExp;
  season?: SheffieldSeason;
  colorProfile?: ColorProfileKey;
};

const bloomPeriodToSeason: Record<BloomPeriod, SheffieldSeason> = {
  'early-spring': 'spring',
  spring: 'spring',
  'late-spring': 'summer',
  summer: 'summer',
  autumn: 'autumn',
};

const europeSeasonsBySeason: Record<SheffieldSeason, PollenSeasonCode[]> = {
  spring: ['early-spring', 'spring'],
  summer: ['spring', 'late-spring'],
  autumn: ['late-summer', 'autumn'],
};

const seasonPalettes: Record<SheffieldSeason, ColorProfileKey[]> = {
  spring: [
    'paleYellow',
    'amberOrange',
    'snowdropOrange',
    'blackthornRed',
    'plumOrange',
    'rapeYellow',
    'cream',
    'paleGreyGreen',
    'goldBeige',
  ],
  summer: [
    'willowOrange',
    'goldenOrange',
    'limeOrange',
    'rapeYellow',
    'fieldBeanBrown',
    'sycamoreBrown',
    'blackberryOlive',
    'blueBlack',
    'honeyYellow',
  ],
  autumn: [
    'ivyYellow',
    'bellGreen',
    'heatherGold',
    'meadowsweetGreen',
    'marjoramBrown',
    'travellerJoyOlive',
    'hollyOlive',
    'paleGreyGreen',
    'charcoalBlack',
    'cream',
  ],
};

const styleRules: PlantStyleRule[] = [
  { match: /oil[\s-]?seed rape/i, season: 'summer', colorProfile: 'rapeYellow' },
  { match: /\bwillow\b/i, season: 'summer', colorProfile: 'willowOrange' },
  { match: /\bhazel\b|\belder\b/i, season: 'summer', colorProfile: 'paleGreyGreen' },
  { match: /\bsnowdrop\b/i, season: 'spring', colorProfile: 'snowdropOrange' },
  { match: /\bgorse\b/i, season: 'spring', colorProfile: 'rustRed' },
  { match: /blackthorn|almond/i, season: 'spring', colorProfile: 'blackthornRed' },
  { match: /plum|wild cherry|cherry plum/i, season: 'spring', colorProfile: 'plumOrange' },
  { match: /crocus/i, season: 'spring', colorProfile: 'amberOrange' },
  { match: /\bdandelion\b/i, season: 'spring', colorProfile: 'tangerine' },
  { match: /\blime\b/i, season: 'summer', colorProfile: 'limeOrange' },
  { match: /clover/i, season: 'summer', colorProfile: 'cloverBrown' },
  { match: /sycamore|\bash\b|\bmaple\b/i, season: 'summer', colorProfile: 'sycamoreBrown' },
  { match: /hawthorn|\boak\b/i, season: 'summer', colorProfile: 'hawthornOlive' },
  { match: /horse chestnut/i, season: 'summer', colorProfile: 'horseChestnutBrown' },
  { match: /blackberry/i, season: 'summer', colorProfile: 'blackberryOlive' },
  { match: /raspberry/i, season: 'summer', colorProfile: 'raspberryGrey' },
  { match: /gooseberry/i, season: 'spring', colorProfile: 'beigeBrown' },
  { match: /broom/i, season: 'summer', colorProfile: 'coralOrange' },
  { match: /berberis/i, season: 'spring', colorProfile: 'berberisOlive' },
  { match: /lauristus/i, season: 'spring', colorProfile: 'marjoramBrown' },
  { match: /flowering currant/i, season: 'spring', colorProfile: 'floweringCurrantBrown' },
  { match: /wallflower/i, season: 'spring', colorProfile: 'amberOrange' },
  { match: /broccoli/i, season: 'spring', colorProfile: 'rapeYellow' },
  { match: /box/i, season: 'spring', colorProfile: 'amberOrange' },
  { match: /\belm\b/i, season: 'spring', colorProfile: 'beigeBrown' },
  { match: /pear|crab apple/i, season: 'spring', colorProfile: 'pearOrange' },
  { match: /apple|cabbage/i, season: 'spring', colorProfile: 'appleOrange' },
  { match: /winter heather/i, season: 'spring', colorProfile: 'winterHeathBrown' },
  { match: /blackcurrant/i, season: 'summer', colorProfile: 'beigeBrown' },
  { match: /redcurrant/i, season: 'summer', colorProfile: 'heatherGold' },
  { match: /white dead-nettle/i, season: 'spring', colorProfile: 'paleGreyGreen' },
  { match: /dead-nettle|red campion/i, season: 'spring', colorProfile: 'deepRed' },
  { match: /foxglove/i, season: 'summer', colorProfile: 'deepRed' },
  { match: /red horse chestnut/i, season: 'summer', colorProfile: 'chestnutBrown' },
  { match: /white horse chestnut/i, season: 'summer', colorProfile: 'darkBrown' },
  { match: /viper'?s bugloss|cornflower|chicory|phacelia|meadow sage|verbena|catmint/i, season: 'summer', colorProfile: 'blueBlack' },
  { match: /knapweed|borage/i, season: 'autumn', colorProfile: 'goldBeige' },
  { match: /marjoram/i, season: 'autumn', colorProfile: 'marjoramBrown' },
  { match: /field scabious/i, season: 'autumn', colorProfile: 'fieldScabiousOrange' },
  { match: /meadowsweet/i, season: 'autumn', colorProfile: 'meadowsweetGreen' },
  { match: /ivy/i, season: 'autumn', colorProfile: 'ivyYellow' },
  { match: /bell heather/i, season: 'autumn', colorProfile: 'bellGreen' },
  { match: /ling heather/i, season: 'autumn', colorProfile: 'heatherGold' },
  { match: /holly|mountain ash/i, season: 'autumn', colorProfile: 'hollyOlive' },
  { match: /traveller joy|clematis/i, season: 'autumn', colorProfile: 'travellerJoyOlive' },
  { match: /privet/i, season: 'autumn', colorProfile: 'rapeYellow' },
  { match: /evening primrose/i, season: 'autumn', colorProfile: 'eveningPrimroseYellow' },
  { match: /hairy willowherb/i, season: 'autumn', colorProfile: 'paleGreyGreen' },
  { match: /sweet chestnut|virginia creeper/i, season: 'autumn', colorProfile: 'rapeYellow' },
  { match: /hogweed/i, season: 'autumn', colorProfile: 'rapeYellow' },
  { match: /himalayan balsam/i, season: 'autumn', colorProfile: 'cream' },
  { match: /fuchsia/i, season: 'autumn', colorProfile: 'deepRed' },
  { match: /laurel/i, season: 'spring', colorProfile: 'honeyYellow' },
];

function hashString(value: string): number {
  let hash = 0;

  for (const character of value) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  return hash;
}

function resolveSeason(plant: PollenReferenceSeedPlant): SheffieldSeason {
  const normalizedPlantName = plant.plantName.toLowerCase();
  const rule = styleRules.find(({ match }) => match.test(normalizedPlantName));

  return rule?.season ?? bloomPeriodToSeason[plant.bloomPeriod];
}

function resolveColorProfile(
  plant: PollenReferenceSeedPlant,
  season: SheffieldSeason,
): PollenColorProfile {
  const normalizedPlantName = plant.plantName.toLowerCase();
  const rule = styleRules.find(({ match }) => match.test(normalizedPlantName));

  if (rule?.colorProfile) {
    return colorProfiles[rule.colorProfile];
  }

  const palette = seasonPalettes[season];
  const profileKey = palette[hashString(plant.plantName) % palette.length];

  return colorProfiles[profileKey];
}

function getEuropeSeasons(season: SheffieldSeason): PollenSeasonCode[] {
  return europeSeasonsBySeason[season];
}

const pollenReferenceCatalog: PollenReferenceSeedPlant[] = [
  { plantName: 'Willow', scientificName: 'Salix spp.', bloomPeriod: 'early-spring' },
  { plantName: 'Pussy willow', scientificName: 'Salix caprea', bloomPeriod: 'early-spring' },
  { plantName: 'Hazel', scientificName: 'Corylus avellana', bloomPeriod: 'early-spring' },
  { plantName: 'Alder', scientificName: 'Alnus glutinosa', bloomPeriod: 'early-spring' },
  { plantName: 'Snowdrop', scientificName: 'Galanthus nivalis', bloomPeriod: 'early-spring' },
  { plantName: 'Crocus', scientificName: 'Crocus spp.', bloomPeriod: 'early-spring' },
  {
    plantName: 'Grape hyacinth',
    scientificName: 'Muscari armeniacum',
    bloomPeriod: 'early-spring',
  },
  { plantName: 'Mahonia', scientificName: 'Mahonia aquifolium', bloomPeriod: 'early-spring' },
  { plantName: 'Blackthorn', scientificName: 'Prunus spinosa', bloomPeriod: 'early-spring' },
  {
    plantName: 'Forsythia',
    scientificName: 'Forsythia × intermedia',
    bloomPeriod: 'early-spring',
  },
  { plantName: 'Gorse', scientificName: 'Ulex europaeus', bloomPeriod: 'early-spring' },
  { plantName: 'Coltsfoot', scientificName: 'Tussilago farfara', bloomPeriod: 'early-spring' },
  { plantName: 'Primrose', scientificName: 'Primula vulgaris', bloomPeriod: 'early-spring' },
  {
    plantName: 'Cherry plum',
    scientificName: 'Prunus cerasifera',
    bloomPeriod: 'early-spring',
  },
  { plantName: 'Plum', scientificName: 'Prunus domestica', bloomPeriod: 'early-spring' },
  { plantName: 'Pear', scientificName: 'Pyrus communis', bloomPeriod: 'early-spring' },
  { plantName: 'Apple', scientificName: 'Malus domestica', bloomPeriod: 'early-spring' },
  { plantName: 'Dandelion', scientificName: 'Taraxacum officinale', bloomPeriod: 'spring' },
  { plantName: 'Field maple', scientificName: 'Acer campestre', bloomPeriod: 'spring' },
  { plantName: 'Winter heather', scientificName: 'Erica carnea', bloomPeriod: 'early-spring' },
  { plantName: 'White clover', scientificName: 'Trifolium repens', bloomPeriod: 'spring' },
  { plantName: 'Red clover', scientificName: 'Trifolium pratense', bloomPeriod: 'spring' },
  { plantName: 'Alsike clover', scientificName: 'Trifolium hybridum', bloomPeriod: 'spring' },
  { plantName: 'Hawthorn', scientificName: 'Crataegus monogyna', bloomPeriod: 'spring' },
  { plantName: 'Blackberry', scientificName: 'Rubus fruticosus agg.', bloomPeriod: 'spring' },
  { plantName: 'Raspberry', scientificName: 'Rubus idaeus', bloomPeriod: 'spring' },
  { plantName: 'Lime', scientificName: 'Tilia cordata', bloomPeriod: 'spring' },
  { plantName: 'Sycamore', scientificName: 'Acer pseudoplatanus', bloomPeriod: 'spring' },
  {
    plantName: 'Horse chestnut',
    scientificName: 'Aesculus hippocastanum',
    bloomPeriod: 'spring',
  },
  { plantName: 'Norway maple', scientificName: 'Acer platanoides', bloomPeriod: 'spring' },
  { plantName: 'Oilseed rape', scientificName: 'Brassica napus', bloomPeriod: 'spring' },
  { plantName: 'Vetch', scientificName: 'Vicia sativa', bloomPeriod: 'spring' },
  { plantName: 'Borage', scientificName: 'Borago officinalis', bloomPeriod: 'spring' },
  { plantName: 'Rosemary', scientificName: 'Salvia rosmarinus', bloomPeriod: 'spring' },
  { plantName: 'Thyme', scientificName: 'Thymus vulgaris', bloomPeriod: 'spring' },
  { plantName: 'Sage', scientificName: 'Salvia officinalis', bloomPeriod: 'spring' },
  { plantName: 'Lavender', scientificName: 'Lavandula angustifolia', bloomPeriod: 'spring' },
  { plantName: 'Broom', scientificName: 'Cytisus scoparius', bloomPeriod: 'spring' },
  {
    plantName: "Bird's-foot trefoil",
    scientificName: 'Lotus corniculatus',
    bloomPeriod: 'spring',
  },
  { plantName: 'Comfrey', scientificName: 'Symphytum officinale', bloomPeriod: 'spring' },
  {
    plantName: 'Foxglove',
    scientificName: 'Digitalis purpurea',
    bloomPeriod: 'late-spring',
  },
  {
    plantName: 'Meadow buttercup',
    scientificName: 'Ranunculus acris',
    bloomPeriod: 'late-spring',
  },
  { plantName: 'Red campion', scientificName: 'Silene dioica', bloomPeriod: 'late-spring' },
  {
    plantName: 'White dead-nettle',
    scientificName: 'Lamium album',
    bloomPeriod: 'late-spring',
  },
  {
    plantName: 'Dead-nettle',
    scientificName: 'Lamium purpureum',
    bloomPeriod: 'late-spring',
  },
  { plantName: 'Yarrow', scientificName: 'Achillea millefolium', bloomPeriod: 'late-spring' },
  { plantName: 'Cotoneaster', scientificName: 'Cotoneaster spp.', bloomPeriod: 'late-spring' },
  { plantName: 'Blackcurrant', scientificName: 'Ribes nigrum', bloomPeriod: 'late-spring' },
  { plantName: 'Gooseberry', scientificName: 'Ribes uva-crispa', bloomPeriod: 'late-spring' },
  { plantName: 'Redcurrant', scientificName: 'Ribes rubrum', bloomPeriod: 'late-spring' },
  { plantName: 'Wild rose', scientificName: 'Rosa canina', bloomPeriod: 'late-spring' },
  {
    plantName: 'Sainfoin',
    scientificName: 'Onobrychis viciifolia',
    bloomPeriod: 'late-spring',
  },
  {
    plantName: "Viper's bugloss",
    scientificName: 'Echium vulgare',
    bloomPeriod: 'late-spring',
  },
  { plantName: 'Sunflower', scientificName: 'Helianthus annuus', bloomPeriod: 'late-spring' },
  { plantName: 'Knapweed', scientificName: 'Centaurea nigra', bloomPeriod: 'late-spring' },
  { plantName: 'Thistle', scientificName: 'Cirsium spp.', bloomPeriod: 'late-spring' },
  { plantName: 'Ragwort', scientificName: 'Jacobaea vulgaris', bloomPeriod: 'late-spring' },
  { plantName: 'Chicory', scientificName: 'Cichorium intybus', bloomPeriod: 'late-spring' },
  { plantName: 'Wild marjoram', scientificName: 'Origanum vulgare', bloomPeriod: 'late-spring' },
  { plantName: 'Mint', scientificName: 'Mentha spp.', bloomPeriod: 'late-spring' },
  { plantName: 'Catmint', scientificName: 'Nepeta × faassenii', bloomPeriod: 'summer' },
  {
    plantName: 'Phacelia',
    scientificName: 'Phacelia tanacetifolia',
    bloomPeriod: 'summer',
  },
  { plantName: 'Tansy', scientificName: 'Tanacetum vulgare', bloomPeriod: 'summer' },
  { plantName: 'Oxeye daisy', scientificName: 'Leucanthemum vulgare', bloomPeriod: 'summer' },
  { plantName: 'Cornflower', scientificName: 'Centaurea cyanus', bloomPeriod: 'summer' },
  { plantName: 'Lucerne', scientificName: 'Medicago sativa', bloomPeriod: 'summer' },
  { plantName: 'Mallow', scientificName: 'Malva sylvestris', bloomPeriod: 'summer' },
  {
    plantName: 'Evening primrose',
    scientificName: 'Oenothera biennis',
    bloomPeriod: 'summer',
  },
  { plantName: 'Goat\'s rue', scientificName: 'Galega officinalis', bloomPeriod: 'summer' },
  { plantName: 'Teasel', scientificName: 'Dipsacus fullonum', bloomPeriod: 'summer' },
  { plantName: 'Meadow sage', scientificName: 'Salvia pratensis', bloomPeriod: 'summer' },
  {
    plantName: 'Verbena',
    scientificName: 'Verbena bonariensis',
    bloomPeriod: 'summer',
  },
  {
    plantName: 'Common valerian',
    scientificName: 'Valeriana officinalis',
    bloomPeriod: 'summer',
  },
  { plantName: 'Field scabious', scientificName: 'Knautia arvensis', bloomPeriod: 'summer' },
  {
    plantName: 'Great willowherb',
    scientificName: 'Epilobium hirsutum',
    bloomPeriod: 'summer',
  },
  {
    plantName: 'Bristly oxtongue',
    scientificName: 'Helminthotheca echioides',
    bloomPeriod: 'summer',
  },
  { plantName: 'Meadowsweet', scientificName: 'Filipendula ulmaria', bloomPeriod: 'summer' },
  { plantName: "Cat's-ear", scientificName: 'Hypochaeris radicata', bloomPeriod: 'summer' },
  { plantName: 'Bell heather', scientificName: 'Erica cinerea', bloomPeriod: 'summer' },
  { plantName: 'Common heather', scientificName: 'Calluna vulgaris', bloomPeriod: 'summer' },
  { plantName: 'Ivy', scientificName: 'Hedera helix', bloomPeriod: 'autumn' },
  { plantName: 'Aster', scientificName: 'Symphyotrichum spp.', bloomPeriod: 'autumn' },
  {
    plantName: 'Michaelmas daisy',
    scientificName: 'Symphyotrichum novi-belgii',
    bloomPeriod: 'autumn',
  },
  { plantName: 'Sedum', scientificName: 'Hylotelephium telephium', bloomPeriod: 'autumn' },
  {
    plantName: 'Goldenrod',
    scientificName: 'Solidago virgaurea',
    bloomPeriod: 'autumn',
  },
  {
    plantName: 'Autumn crocus',
    scientificName: 'Colchicum autumnale',
    bloomPeriod: 'autumn',
  },
  {
    plantName: 'Japanese anemone',
    scientificName: 'Anemone × hybrida',
    bloomPeriod: 'autumn',
  },
  { plantName: 'Fatsia', scientificName: 'Fatsia japonica', bloomPeriod: 'autumn' },
  { plantName: 'Buddleia', scientificName: 'Buddleja davidii', bloomPeriod: 'autumn' },
  {
    plantName: 'Honeysuckle',
    scientificName: 'Lonicera periclymenum',
    bloomPeriod: 'autumn',
  },
  { plantName: 'Snowberry', scientificName: 'Symphoricarpos albus', bloomPeriod: 'autumn' },
  { plantName: 'Laurel', scientificName: 'Prunus laurocerasus', bloomPeriod: 'autumn' },
  { plantName: 'Viburnum', scientificName: 'Viburnum tinus', bloomPeriod: 'autumn' },
  { plantName: 'Holly', scientificName: 'Ilex aquifolium', bloomPeriod: 'autumn' },
  { plantName: 'Clematis', scientificName: 'Clematis vitalba', bloomPeriod: 'autumn' },
  { plantName: 'Echinacea', scientificName: 'Echinacea purpurea', bloomPeriod: 'autumn' },
  { plantName: 'Rudbeckia', scientificName: 'Rudbeckia hirta', bloomPeriod: 'autumn' },
  {
    plantName: 'Chrysanthemum',
    scientificName: 'Chrysanthemum × morifolium',
    bloomPeriod: 'autumn',
  },
  { plantName: 'Helenium', scientificName: 'Helenium autumnale', bloomPeriod: 'autumn' },
  { plantName: 'Fuchsia', scientificName: 'Fuchsia magellanica', bloomPeriod: 'autumn' },
];

function buildSeedRecord(plant: PollenReferenceSeedPlant): PollenReferenceSeedRecord {
  const season = resolveSeason(plant);
  const colorProfile = resolveColorProfile(plant, season);

  return {
    plantName: plant.plantName,
    scientificName: plant.scientificName,
    colorLabel: colorProfile.colorLabel,
    colorGroup: colorProfile.colorGroup,
    hexColor: colorProfile.hexColor,
    notes: plant.notes ?? null,
    active: true,
    regions: [
      {
        region: 'UK_AND_IRELAND',
        seasons: [season],
        notes: null,
      },
      {
        region: 'EUROPE',
        seasons: getEuropeSeasons(season),
        notes: null,
      },
    ],
  };
}

export const pollenReferenceSeedRecords: PollenReferenceSeedRecord[] =
  pollenReferenceCatalog.map(buildSeedRecord);
