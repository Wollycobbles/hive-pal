import { describe, it, expect } from 'vitest';
import enCommon from '../../../../public/locales/en/common.json';
import deCommon from '../../../../public/locales/de/common.json';
import frCommon from '../../../../public/locales/fr/common.json';
import esCommon from '../../../../public/locales/es/common.json';
import itCommon from '../../../../public/locales/it/common.json';
import nlCommon from '../../../../public/locales/nl/common.json';
import daCommon from '../../../../public/locales/da/common.json';
import skCommon from '../../../../public/locales/sk/common.json';
import srCommon from '../../../../public/locales/sr/common.json';
import { PAGDEN_CHECKPOINTS } from '../pagden-planner';
import { ARTIFICIAL_SWARM_CHECKPOINTS } from '../artificial-swarm-planner';

describe('Swarm Management i18n Keys', () => {
  const nonEnglishLocales = [
    { name: 'de', data: deCommon },
    { name: 'fr', data: frCommon },
    { name: 'es', data: esCommon },
    { name: 'it', data: itCommon },
    { name: 'nl', data: nlCommon },
    { name: 'da', data: daCommon },
    { name: 'sk', data: skCommon },
    { name: 'sr', data: srCommon },
  ];

  describe('Pagden i18n keys', () => {
    it('has all required Pagden keys in English locale', () => {
      expect(enCommon.swarmManagement.pagden).toBeDefined();
      expect(enCommon.swarmManagement.pagden.title).toBeTruthy();
      expect(enCommon.swarmManagement.pagden.description).toBeTruthy();
      expect(enCommon.swarmManagement.pagden.intro).toBeTruthy();
      expect(enCommon.swarmManagement.pagden.overviewTitle).toBeTruthy();
      expect(enCommon.swarmManagement.pagden.prerequisitesTitle).toBeTruthy();
      expect(enCommon.swarmManagement.pagden.stepsTitle).toBeTruthy();
      expect(enCommon.swarmManagement.pagden.followUpTitle).toBeTruthy();
      expect(enCommon.swarmManagement.pagden.prosConsTitle).toBeTruthy();
      expect(enCommon.swarmManagement.pagden.faq).toBeDefined();
      expect(enCommon.swarmManagement.pagden.faq.items).toHaveLength(4);
    });

    it('has all Pagden planner checkpoint keys in English locale', () => {
      PAGDEN_CHECKPOINTS.forEach(checkpoint => {
        // @ts-expect-error - dynamic path access
        expect(enCommon.swarmManagement.pagden.planner.checkpoints[checkpoint.id]).toBeDefined();
        // @ts-expect-error - dynamic path access
        expect(enCommon.swarmManagement.pagden.planner.checkpoints[checkpoint.id].title).toBeTruthy();
        // @ts-expect-error - dynamic path access
        expect(enCommon.swarmManagement.pagden.planner.checkpoints[checkpoint.id].summary).toBeTruthy();
        // @ts-expect-error - dynamic path access
        expect(enCommon.swarmManagement.pagden.planner.checkpoints[checkpoint.id].checklist).toHaveLength(3);
      });
    });

    it('has Pagden planner metadata keys in English locale', () => {
      expect(enCommon.swarmManagement.pagden.planner.title).toBeTruthy();
      expect(enCommon.swarmManagement.pagden.planner.description).toBeTruthy();
      expect(enCommon.swarmManagement.pagden.planner.checkpointPrefix).toBeTruthy();
      expect(enCommon.swarmManagement.pagden.planner.notesChecklistLabel).toBeTruthy();
      expect(enCommon.swarmManagement.pagden.planner.savedSuccess).toBeTruthy();
      expect(enCommon.swarmManagement.pagden.planner.savedPartial).toBeTruthy();
      expect(enCommon.swarmManagement.pagden.planner.savedError).toBeTruthy();
    });

    it('has Pagden keys as empty strings in non-English locales', () => {
      nonEnglishLocales.forEach(locale => {
        // @ts-expect-error - dynamic locale access
        expect(locale.data.swarmManagement.pagden).toBeDefined();
        // @ts-expect-error - dynamic locale access
        expect(locale.data.swarmManagement.pagden.title).toBe('');
        // @ts-expect-error - dynamic locale access
        expect(locale.data.swarmManagement.pagden.description).toBe('');
        // @ts-expect-error - dynamic locale access
        expect(locale.data.swarmManagement.pagden.planner.checkpointPrefix).toBe('');
      });
    });
  });

  describe('Artificial Swarm i18n keys', () => {
    it('has all required Artificial Swarm keys in English locale', () => {
      expect(enCommon.swarmManagement.artificialSwarm).toBeDefined();
      expect(enCommon.swarmManagement.artificialSwarm.title).toBeTruthy();
      expect(enCommon.swarmManagement.artificialSwarm.description).toBeTruthy();
      expect(enCommon.swarmManagement.artificialSwarm.intro).toBeTruthy();
      expect(enCommon.swarmManagement.artificialSwarm.overviewTitle).toBeTruthy();
      expect(enCommon.swarmManagement.artificialSwarm.prerequisitesTitle).toBeTruthy();
      expect(enCommon.swarmManagement.artificialSwarm.stepsTitle).toBeTruthy();
      expect(enCommon.swarmManagement.artificialSwarm.followUpTitle).toBeTruthy();
      expect(enCommon.swarmManagement.artificialSwarm.prosConsTitle).toBeTruthy();
      expect(enCommon.swarmManagement.artificialSwarm.faq).toBeDefined();
      expect(enCommon.swarmManagement.artificialSwarm.faq.items).toHaveLength(4);
    });

    it('has all Artificial Swarm planner checkpoint keys in English locale', () => {
      ARTIFICIAL_SWARM_CHECKPOINTS.forEach(checkpoint => {
        // @ts-expect-error - dynamic path access
        expect(enCommon.swarmManagement.artificialSwarm.planner.checkpoints[checkpoint.id]).toBeDefined();
        // @ts-expect-error - dynamic path access
        expect(enCommon.swarmManagement.artificialSwarm.planner.checkpoints[checkpoint.id].title).toBeTruthy();
        // @ts-expect-error - dynamic path access
        expect(enCommon.swarmManagement.artificialSwarm.planner.checkpoints[checkpoint.id].summary).toBeTruthy();
        // @ts-expect-error - dynamic path access
        expect(enCommon.swarmManagement.artificialSwarm.planner.checkpoints[checkpoint.id].checklist).toHaveLength(3);
      });
    });

    it('has Artificial Swarm planner metadata keys in English locale', () => {
      expect(enCommon.swarmManagement.artificialSwarm.planner.title).toBeTruthy();
      expect(enCommon.swarmManagement.artificialSwarm.planner.description).toBeTruthy();
      expect(enCommon.swarmManagement.artificialSwarm.planner.checkpointPrefix).toBeTruthy();
      expect(enCommon.swarmManagement.artificialSwarm.planner.notesChecklistLabel).toBeTruthy();
      expect(enCommon.swarmManagement.artificialSwarm.planner.savedSuccess).toBeTruthy();
      expect(enCommon.swarmManagement.artificialSwarm.planner.savedPartial).toBeTruthy();
      expect(enCommon.swarmManagement.artificialSwarm.planner.savedError).toBeTruthy();
    });

    it('has Artificial Swarm keys as empty strings in non-English locales', () => {
      nonEnglishLocales.forEach(locale => {
        // @ts-expect-error - dynamic locale access
        expect(locale.data.swarmManagement.artificialSwarm).toBeDefined();
        // @ts-expect-error - dynamic locale access
        expect(locale.data.swarmManagement.artificialSwarm.title).toBe('');
        // @ts-expect-error - dynamic locale access
        expect(locale.data.swarmManagement.artificialSwarm.description).toBe('');
        // @ts-expect-error - dynamic locale access
        expect(locale.data.swarmManagement.artificialSwarm.planner.checkpointPrefix).toBe('');
      });
    });
  });

  describe('Overview page i18n keys', () => {
    it('has Pagden card keys in English locale', () => {
      expect(enCommon.swarmManagement.cards.pagden.title).toBeTruthy();
      expect(enCommon.swarmManagement.cards.pagden.description).toBeTruthy();
      expect(enCommon.swarmManagement.cards.pagden.detail).toBeTruthy();
      expect(enCommon.swarmManagement.cards.pagden.cta).toBeTruthy();
    });

    it('has Artificial Swarm card keys in English locale', () => {
      expect(enCommon.swarmManagement.cards.artificialSwarm.title).toBeTruthy();
      expect(enCommon.swarmManagement.cards.artificialSwarm.description).toBeTruthy();
      expect(enCommon.swarmManagement.cards.artificialSwarm.detail).toBeTruthy();
      expect(enCommon.swarmManagement.cards.artificialSwarm.cta).toBeTruthy();
    });

    it('has Dave Cushman attribution keys in English locale', () => {
      expect(enCommon.swarmManagement.cushmanCredit.text).toBeTruthy();
      expect(enCommon.swarmManagement.cushmanCredit.linkLabel).toBeTruthy();
    });

    it('has Dave Cushman attribution keys as empty strings in non-English locales', () => {
      nonEnglishLocales.forEach(locale => {
        // @ts-expect-error - dynamic locale access
        expect(locale.data.swarmManagement.cushmanCredit.text).toBe('');
        // @ts-expect-error - dynamic locale access
        expect(locale.data.swarmManagement.cushmanCredit.linkLabel).toBe('');
      });
    });
  });

  describe('Content verification', () => {
    it('Pagden overview mentions queen moved to new hive on original stand', () => {
      const overviewText = JSON.stringify(enCommon.swarmManagement.pagden.overviewPoints).toLowerCase();
      expect(overviewText).toContain('queen');
      expect(overviewText).toContain('original stand');
    });

    it('Pagden Day 0 checklist mentions relocating queen', () => {
      const setupChecklist = enCommon.swarmManagement.pagden.planner.checkpoints.setup.checklist;
      const checklistText = setupChecklist.join(' ').toLowerCase();
      expect(checklistText).toContain('queen');
      expect(checklistText).toContain('original stand');
    });

    it('Artificial Swarm overview mentions queen NOT moved', () => {
      const overviewText = JSON.stringify(enCommon.swarmManagement.artificialSwarm.overviewPoints).toLowerCase();
      expect(overviewText).toContain('queen');
      expect(overviewText).toContain('parent');
    });

    it('Artificial Swarm Day 0 checklist mentions moving frame with queen cell', () => {
      const setupChecklist = enCommon.swarmManagement.artificialSwarm.planner.checkpoints.setup.checklist;
      const checklistText = setupChecklist.join(' ').toLowerCase();
      expect(checklistText).toContain('queen cell');
      expect(checklistText).toContain('frame');
    });

    it('Artificial Swarm description mentions queen cannot be found use case', () => {
      const description = enCommon.swarmManagement.artificialSwarm.description.toLowerCase();
      const intro = enCommon.swarmManagement.artificialSwarm.intro.toLowerCase();
      const combined = description + ' ' + intro;
      expect(combined).toContain('queen');
    });
  });
});
