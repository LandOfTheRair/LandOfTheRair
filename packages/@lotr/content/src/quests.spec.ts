import { beforeEach, describe, expect, it, vi } from 'vitest';
import { questGet } from './quests';

// Mock dependencies
vi.mock('./allcontent', () => ({
  getContentKey: vi.fn(),
}));

vi.mock('./errors', () => ({
  logErrorWithContext: vi.fn(),
}));

describe('Quests Functions', () => {
  let mockGetContentKey: any;
  let mockLogErrorWithContext: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    const allcontent = await import('./allcontent');
    const errors = await import('./errors');

    mockGetContentKey = vi.mocked(allcontent.getContentKey);
    mockLogErrorWithContext = vi.mocked(errors.logErrorWithContext);
  });

  describe('questGet', () => {
    it('should return quest when it exists', () => {
      const quests = {
        'find-the-sword': {
          name: 'Find the Sword',
          description: 'Locate the legendary sword',
          requirements: { level: 10 },
          rewards: { exp: 1000, gold: 500 },
        },
        'save-the-princess': {
          name: 'Save the Princess',
          description: 'Rescue the princess from the dragon',
          requirements: { level: 25 },
          rewards: { exp: 5000, gold: 2000 },
        },
      };

      mockGetContentKey.mockReturnValue(quests);

      const result = questGet('find-the-sword');

      expect(mockGetContentKey).toHaveBeenCalledWith('quests');
      expect(result).toEqual(quests['find-the-sword']);
      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });

    it('should log error and return undefined for nonexistent quest', () => {
      const quests = {
        'existing-quest': {
          name: 'Existing Quest',
          description: 'This quest exists',
        },
      };

      mockGetContentKey.mockReturnValue(quests);

      const result = questGet('nonexistent-quest');

      expect(mockGetContentKey).toHaveBeenCalledWith('quests');
      expect(result).toBeUndefined();
      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        'Content:Quest:nonexistent-quest',
        expect.any(Error),
      );

      const errorCall = mockLogErrorWithContext.mock.calls[0];
      expect(errorCall[1].message).toBe(
        'Quest nonexistent-quest does not exist.',
      );
    });

    it('should handle empty quest collection', () => {
      mockGetContentKey.mockReturnValue({});

      const result = questGet('any-quest');

      expect(result).toBeUndefined();
      expect(mockLogErrorWithContext).toHaveBeenCalledWith(
        'Content:Quest:any-quest',
        expect.any(Error),
      );
    });

    it('should handle quests with special characters in name', () => {
      const quests = {
        'quest-with_special.chars!': {
          name: 'Quest with Special Characters',
          description: 'A quest with unusual naming',
        },
      };

      mockGetContentKey.mockReturnValue(quests);

      const result = questGet('quest-with_special.chars!');

      expect(result).toEqual(quests['quest-with_special.chars!']);
      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });

    it('should handle quests with complex data structures', () => {
      const complexQuest = {
        name: 'Complex Quest',
        description: 'A quest with complex requirements',
        requirements: {
          level: 20,
          skills: { sword: 15, magic: 10 },
          items: ['Magic Key', 'Ancient Map'],
          completedQuests: ['intro-quest', 'training-quest'],
        },
        rewards: {
          exp: 3000,
          gold: 1500,
          items: ['Epic Sword', 'Magic Ring'],
          reputation: { faction: 'Knights', amount: 100 },
        },
        steps: [
          { description: 'Talk to the wizard', completed: false },
          { description: 'Gather magic herbs', completed: false },
          { description: 'Defeat the dark lord', completed: false },
        ],
      };

      const quests = {
        'complex-quest': complexQuest,
      };

      mockGetContentKey.mockReturnValue(quests);

      const result = questGet('complex-quest');

      expect(result).toEqual(complexQuest);
      expect((result as any).requirements.skills.sword).toBe(15);
      expect((result as any).steps).toHaveLength(3);
    });

    it('should call getContentKey exactly once per call', () => {
      const quests = { 'test-quest': { name: 'Test Quest' } };
      mockGetContentKey.mockReturnValue(quests);

      questGet('test-quest');

      expect(mockGetContentKey).toHaveBeenCalledTimes(1);
      expect(mockGetContentKey).toHaveBeenCalledWith('quests');
    });

    it('should handle multiple sequential quest lookups', () => {
      const quests = {
        quest1: { name: 'Quest 1', description: 'First quest' },
        quest2: { name: 'Quest 2', description: 'Second quest' },
        quest3: { name: 'Quest 3', description: 'Third quest' },
      };

      mockGetContentKey.mockReturnValue(quests);

      const result1 = questGet('quest1');
      const result2 = questGet('quest2');
      const result3 = questGet('nonexistent');

      expect(result1).toEqual(quests['quest1']);
      expect(result2).toEqual(quests['quest2']);
      expect(result3).toBeUndefined();

      expect(mockGetContentKey).toHaveBeenCalledTimes(3);
      expect(mockLogErrorWithContext).toHaveBeenCalledTimes(1);
    });

    it('should handle null/undefined quest values', () => {
      const quests = {
        'null-quest': null,
        'undefined-quest': undefined,
        'empty-quest': {},
      };

      mockGetContentKey.mockReturnValue(quests);

      const nullResult = questGet('null-quest');
      const undefinedResult = questGet('undefined-quest');
      const emptyResult = questGet('empty-quest');

      expect(nullResult).toBeNull();
      expect(undefinedResult).toBeUndefined();
      expect(emptyResult).toEqual({});

      // Only null and undefined should trigger error logging
      expect(mockLogErrorWithContext).toHaveBeenCalledTimes(2);
    });

    it('should return the exact object reference from content', () => {
      const questObject = {
        name: 'Reference Test Quest',
        description: 'Testing object references',
      };

      const quests = { 'reference-quest': questObject };
      mockGetContentKey.mockReturnValue(quests);

      const result = questGet('reference-quest');

      expect(result).toBe(questObject); // Same reference
    });

    it('should handle very long quest names', () => {
      const longQuestName = 'very-long-quest-name-' + 'x'.repeat(100);
      const quests = {
        [longQuestName]: {
          name: 'Quest with Very Long Name',
          description: 'A quest with an unusually long identifier',
        },
      };

      mockGetContentKey.mockReturnValue(quests);

      const result = questGet(longQuestName);

      expect(result).toEqual(quests[longQuestName]);
      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });

    it('should handle empty string quest name', () => {
      const quests = {
        '': {
          name: 'Empty Name Quest',
          description: 'Quest with empty string name',
        },
      };

      mockGetContentKey.mockReturnValue(quests);

      const result = questGet('');

      expect(result).toEqual(quests['']);
    });

    it('should be case sensitive in quest name lookup', () => {
      const quests = {
        CamelCaseQuest: { name: 'Camel Case Quest' },
        camelcasequest: { name: 'Lowercase Quest' },
        CAMELCASEQUEST: { name: 'Uppercase Quest' },
      };

      mockGetContentKey.mockReturnValue(quests);

      expect(questGet('CamelCaseQuest')).toEqual(quests['CamelCaseQuest']);
      expect(questGet('camelcasequest')).toEqual(quests['camelcasequest']);
      expect(questGet('CAMELCASEQUEST')).toEqual(quests['CAMELCASEQUEST']);

      // Should not find case-mismatched names
      const missingResult = questGet('camelCaseQuest');
      expect(missingResult).toBeUndefined();
      expect(mockLogErrorWithContext).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling Edge Cases', () => {
    it('should handle when getContentKey returns null', () => {
      mockGetContentKey.mockReturnValue(null);

      expect(() => questGet('any-quest')).toThrow();
    });

    it('should handle when getContentKey returns undefined', () => {
      mockGetContentKey.mockReturnValue(undefined);

      expect(() => questGet('any-quest')).toThrow();
    });

    it('should handle when getContentKey throws error', () => {
      mockGetContentKey.mockImplementation(() => {
        throw new Error('Content system error');
      });

      expect(() => questGet('any-quest')).toThrow('Content system error');
    });
  });

  describe('Integration Tests', () => {
    it('should work with realistic quest data', () => {
      const realisticQuests = {
        'tutorial-combat': {
          name: 'Learn to Fight',
          description: 'Master the basics of combat',
          type: 'tutorial',
          requirements: { level: 1 },
          rewards: {
            exp: 100,
            gold: 50,
            items: ['Training Sword'],
          },
          objectives: [
            { type: 'kill', target: 'Training Dummy', count: 5, completed: 0 },
            { type: 'equip', item: 'Training Sword', completed: false },
          ],
        },
        'collect-herbs': {
          name: 'Herb Collection',
          description: 'Gather healing herbs for the village healer',
          type: 'collection',
          requirements: { level: 5, reputation: { Herbalists: 10 } },
          rewards: {
            exp: 500,
            gold: 200,
            reputation: { Herbalists: 25 },
          },
          objectives: [
            { type: 'collect', item: 'Healing Herb', count: 10, completed: 0 },
            { type: 'collect', item: 'Mana Herb', count: 5, completed: 0 },
          ],
        },
      };

      mockGetContentKey.mockReturnValue(realisticQuests);

      const tutorialQuest = questGet('tutorial-combat');
      const herbQuest = questGet('collect-herbs');

      expect((tutorialQuest as any).objectives).toHaveLength(2);
      expect((herbQuest as any).rewards.reputation.Herbalists).toBe(25);
      expect(mockLogErrorWithContext).not.toHaveBeenCalled();
    });

    it('should maintain performance with large quest collections', () => {
      // Simulate a large number of quests
      const largeQuestCollection: any = {};
      for (let i = 0; i < 1000; i++) {
        largeQuestCollection[`quest-${i}`] = {
          name: `Quest ${i}`,
          description: `Description for quest ${i}`,
          rewards: { exp: i * 10, gold: i * 5 },
        };
      }

      mockGetContentKey.mockReturnValue(largeQuestCollection);

      // Should quickly find existing quests
      const quest500 = questGet('quest-500');
      expect(quest500.name).toBe('Quest 500');

      // Should quickly determine non-existence
      const nonExistent = questGet('quest-9999');
      expect(nonExistent).toBeUndefined();

      expect(mockLogErrorWithContext).toHaveBeenCalledTimes(1);
    });
  });
});
