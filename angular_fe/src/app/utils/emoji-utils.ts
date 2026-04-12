/**
 * @category Utils
 * 
 * @description List of commonly used smiley emojis.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 */
export const smileys = [
  '😀',
  '😃',
  '😄',
  '😁',
  '😆',
  '😅',
  '😂',
  '🤣',
  '😊',
  '😇',
  '🙂',
  '🙃',
  '😉',
  '😌',
  '😍',
  '🥰',
  '😘',
  '😗',
  '😙',
  '😚',
  '😋',
  '😛',
  '😝',
  '😜',
  '🤪',
  '🤨',
  '🧐',
  '🤓',
  '😎',
  '🤩',
  '🥳',
  '😏',
  '😒',
  '😞',
  '😔',
  '😟',
  '😕',
  '🙁',
  '☹️',
  '😣',
  '😖',
  '😫',
  '😩',
  '🥺',
  '😢',
  '😭',
  '😤',
  '😠',
  '😡',
  '🤬',
  '🤯',
  '😳',
  '🥵',
  '🥶',
  '😱',
  '😨',
  '😰',
  '😥',
  '😓',
  '🤗',
  '🤔',
  '🤭',
  '🤫',
  '🤥',
  '😶',
  '😐',
  '😑',
  '😬',
  '🙄',
  '😯',
  '😦',
  '😧',
  '😮',
  '😲',
  '🥱',
  '😴',
  '🤤',
  '😪',
  '😵',
  '🤐',
  '🥴',
  '🤢',
  '🤮',
  '🤧',
  '😷',
  '🤒',
  '🤕',
  '🤑',
];

/**
 * @category Utils
 * 
 * Mapping of selected emojis to human-readable names.
 * Can be extended to include more emojis as needed.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 */
export const emojiNames: Record<string, string> = {
  '😀': 'Smile',
  '😂': 'Laugh',
  '😍': 'Heart Eyes',
  '😊': 'Blush',
  '😎': 'Cool',
  '🥰': 'Love',
  '😘': 'Kiss',
  '🤔': 'Thinking',
  '😭': 'Cry',
  '😡': 'Angry',
  '🤯': 'Mind Blown',
  '🥺': 'Pleading',
  '❤️': 'Heart',
  '👍': 'Thumbs Up',
  '👏': 'Clap',
  '🙏': 'Pray',
};

/**
 * @category Utils
 * 
 * @description Returns a human-readable name for a given emoji.
 * If the emoji is not found in the `emojiNames` map, it returns the emoji itself.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param emoji - The emoji character to lookup.
 * @returns The human-readable name or the original emoji.
 *
 * @example
 * getEmojiName('😀'); // → "Smile"
 * getEmojiName('🤷'); // → "🤷" (not mapped)
 */
export function getEmojiName(emoji: string): string {
  return emojiNames[emoji] || emoji;
}
