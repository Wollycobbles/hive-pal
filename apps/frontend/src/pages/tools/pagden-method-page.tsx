import { useTranslation } from 'react-i18next';
import { ToolMeta, buildFaqJsonLd, type FaqItem } from '@/components/tool-page';
import {
  generatePagdenPlan,
  getPagdenWarnings,
} from './pagden-planner';
import {
  SwarmMethodPageLayout,
  type CheckpointPlan,
  type CheckpointWarning,
} from './swarm-method-page-layout';

const METHOD_DETAIL_SECTIONS = [
  {
    id: 'preparation',
    items: [0, 1],
    children: {} as Record<number, number[]>,
  },
  {
    id: 'relocateQueen',
    items: [0, 1, 2, 3],
    children: {} as Record<number, number[]>,
  },
  {
    id: 'queenCells',
    items: [0, 1, 2],
    children: {} as Record<number, number[]>,
  },
  {
    id: 'reassembly',
    items: [0, 1, 2],
    children: {} as Record<number, number[]>,
  },
];

function PagdenToolMeta() {
  const { t } = useTranslation('common');
  const faqItems = t('swarmManagement.pagden.faq.items', {
    returnObjects: true,
  }) as FaqItem[];

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: 'Pagden Split Method Guide and Planner',
        url: 'https://hivepal.app/tools/swarm-management/pagden',
        applicationCategory: 'EducationalApplication',
        applicationSubCategory: 'Beekeeping Reference',
        operatingSystem: 'Web',
        browserRequirements: 'Requires JavaScript',
        description:
          'Reference guide and inspection planner for the Pagden split swarm-control method, with prerequisites, step-by-step instructions, pros/cons, and follow-up timing.',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        publisher: {
          '@type': 'Organization',
          name: 'Hive Pal',
          url: 'https://hivepal.app',
        },
      },
      {
        '@type': 'HowTo',
        name: 'How to perform the Pagden split method',
        description:
          'Step-by-step Pagden procedure for relieving swarm pressure by moving the queen to a new hive on the original stand while relocating the parent colony with brood.',
        step: [
          {
            '@type': 'HowToStep',
            name: 'Preparation',
            text: 'Find a spare brood box with drawn comb and prepare a second hive floor and stand positioned a few metres away from the original location.',
          },
          {
            '@type': 'HowToStep',
            name: 'Relocate the Queen',
            text: 'Locate the laying queen, place her and the frame she is on into the centre of the new brood box, and remove any queen cells from that frame. Place the new box on the original hive floor so flying bees return to her.',
          },
          {
            '@type': 'HowToStep',
            name: 'Manage the Parent Colony',
            text: 'Move the original hive to the second floor a few metres away. Reduce queen cells to one or two well-placed, well-formed cells so the colony can raise a new queen.',
          },
          {
            '@type': 'HowToStep',
            name: 'Reassembly',
            text: 'Place a queen excluder on top of the new hive if adding supers, add supers as needed, and fit crown board and roof on both hives.',
          },
          {
            '@type': 'HowToStep',
            name: 'Follow-up at day 7-8',
            text: 'Inspect the parent colony and reduce queen cells to one well-placed, well-formed cell to reduce the risk of secondary swarming.',
          },
          {
            '@type': 'HowToStep',
            name: 'Follow-up at day 14-15',
            text: 'Check that the retained queen cell is capped and developing. Remove any additional cells.',
          },
          {
            '@type': 'HowToStep',
            name: 'Follow-up at day 21-22',
            text: 'Confirm the new queen is mated and laying in the parent colony. Assess both colonies and decide on next steps.',
          },
        ],
      },
      buildFaqJsonLd(faqItems),
    ],
  };

  return (
    <ToolMeta
      title="Pagden Split Method: Swarm Control Guide and Planner — Hive Pal"
      description="Free reference guide and inspection planner for the Pagden split swarm-control method. Prerequisites, step-by-step instructions, follow-up timing, and pros/cons for honey bee beekeepers."
      ogDescription="Step-by-step Pagden split method for honey bee swarm control, with follow-up timing and an inspection planner."
      path="/tools/swarm-management/pagden"
      structuredData={structuredData}
    />
  );
}

export function PagdenMethodPage() {
  return (
    <SwarmMethodPageLayout
      ns="swarmManagement.pagden"
      plannerNs="swarmManagement.planner"
      methodPlannerNs="swarmManagement.pagden.planner"
      prerequisiteCount={5}
      prosConsCount={5}
      methodDetailSections={METHOD_DETAIL_SECTIONS}
      generatePlan={generatePagdenPlan as (d: Date) => CheckpointPlan[]}
      getWarnings={getPagdenWarnings as (c: CheckpointPlan[]) => CheckpointWarning[]}
      meta={<PagdenToolMeta />}
      faqI18nKey="swarmManagement.pagden.faq.items"
    />
  );
}
