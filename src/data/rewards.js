/**
 * Centralized Pearl Club Reward Outcomes Registry
 * Extensible for seasonal events, limited-time collectibles, and activity rewards.
 */

export const REWARD_REGISTRY = [
  {
    id: 'rew_pearl_white',
    name: 'Soft White Pearl',
    type: 'collectible',
    rarity: 'common',
    icon: 'circle',
    sourceTypes: ['daily_reward', 'focus_reward', 'found']
  },
  {
    id: 'rew_shell_conch',
    name: 'Spiral Conch',
    type: 'decoration',
    rarity: 'common',
    icon: 'water_drop',
    sourceTypes: ['daily_reward', 'focus_reward', 'found']
  },
  {
    id: 'rew_coral_blue',
    name: 'Azure Coral Branch',
    type: 'decoration',
    rarity: 'uncommon',
    icon: 'nature',
    sourceTypes: ['daily_reward', 'focus_reward', 'found']
  },
  {
    id: 'rew_starfish_gold',
    name: 'Sunlit Starfish',
    type: 'creature',
    rarity: 'uncommon',
    icon: 'stars',
    sourceTypes: ['daily_reward', 'focus_reward', 'found']
  },
  {
    id: 'rew_seahorse_golden',
    name: 'Golden Seahorse Companion',
    type: 'creature',
    rarity: 'rare',
    icon: 'cruelty_free',
    sourceTypes: ['daily_reward', 'focus_reward', 'found']
  },
  {
    id: 'rew_jellyfish_lum',
    name: 'Luminous Jellyfish',
    type: 'creature',
    rarity: 'rare',
    icon: 'bubble_chart',
    sourceTypes: ['achievement', 'focus_reward']
  }
];

export function getRandomReward(sourceType = 'focus_reward') {
  const matching = REWARD_REGISTRY.filter((r) => r.sourceTypes.includes(sourceType));
  const pool = matching.length > 0 ? matching : REWARD_REGISTRY;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}
