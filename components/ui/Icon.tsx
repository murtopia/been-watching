import React from 'react';

/**
 * Icon Component
 *
 * Displays SVG icons from the sprite sheet with support for:
 * - Multiple states (default, active, filled)
 * - Theming (light, dark)
 * - Custom colors
 * - Various sizes
 * - Accessibility
 *
 * @example
 * // Basic usage
 * <Icon name="heart" size={24} />
 *
 * @example
 * // With state
 * <Icon name="heart" state={isLiked ? 'active' : 'default'} />
 *
 * @example
 * // Custom color
 * <Icon name="star" color="#FFD700" size={16} />
 */

export interface IconProps {
  /** Icon name from sprite sheet (without state suffix) */
  name: string;
  /** Size in pixels or CSS unit */
  size?: number | string;
  /** Icon state (default, active, filled) */
  state?: 'default' | 'active' | 'filled';
  /** Theme (determines default color) */
  theme?: 'light' | 'dark';
  /** Custom color (overrides theme) */
  color?: string;
  /** Additional CSS classes */
  className?: string;
  /** Click handler */
  onClick?: () => void;
  /** Accessibility label */
  ariaLabel?: string;
  /** Aria hidden (for decorative icons) */
  ariaHidden?: boolean;
}

/**
 * Icons that have state variants (outline, filled, active)
 */
const STATEFUL_ICONS = [
  'heart',
  'bookmark',
  'bell',
  'thumbs-up',
  'meh-face',
  'check',
  'star',
  'play',
];

/**
 * Get the full icon ID including state suffix
 */
function getIconId(name: string, state: IconProps['state']): string {
  // Icons without state variants
  if (!STATEFUL_ICONS.includes(name)) {
    return name;
  }

  // Map state to suffix
  if (state === 'active' || state === 'filled') {
    return `${name}-filled`;
  }

  // Default to outline variant
  return `${name}-outline`;
}

/**
 * Get color based on theme and custom color
 */
function getColor(theme: IconProps['theme'], customColor?: string): string {
  if (customColor) {
    return customColor;
  }

  // Default colors by theme
  return theme === 'light' ? '#1a1a1a' : '#ffffff';
}

/**
 * Icon Component with static size variants
 */
interface IconComponent extends React.FC<IconProps> {
  Small: React.FC<Omit<IconProps, 'size'>>;
  Medium: React.FC<Omit<IconProps, 'size'>>;
  Large: React.FC<Omit<IconProps, 'size'>>;
}

/**
 * Icon Component
 */
const IconBase: React.FC<IconProps> = ({
  name,
  size = 24,
  state = 'default',
  theme = 'dark',
  color: customColor,
  className = '',
  onClick,
  ariaLabel,
  ariaHidden = false,
}) => {
  const iconId = getIconId(name, state);
  const color = getColor(theme, customColor);
  const sizeValue = typeof size === 'number' ? `${size}px` : size;

  return (
    <svg
      className={`icon ${className}`}
      width={sizeValue}
      height={sizeValue}
      onClick={onClick}
      aria-label={ariaHidden ? undefined : (ariaLabel || name)}
      aria-hidden={ariaHidden}
      role={onClick ? 'button' : 'img'}
      style={{
        color,
        cursor: onClick ? 'pointer' : 'default',
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
      }}
    >
      <use xlinkHref={`/icons/feed-sprite.svg?v=9#${iconId}`} />
    </svg>
  );
};

/**
 * Pre-defined icon sizes for consistency
 */
export const IconSize = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
} as const;

/**
 * Icon component with pre-defined size
 *
 * @example
 * <Icon.Small name="heart" />
 * <Icon.Large name="star" />
 */
const Icon = IconBase as IconComponent;
Icon.Small = (props: Omit<IconProps, 'size'>) => <IconBase size={IconSize.sm} {...props} />;
Icon.Medium = (props: Omit<IconProps, 'size'>) => <IconBase size={IconSize.md} {...props} />;
Icon.Large = (props: Omit<IconProps, 'size'>) => <IconBase size={IconSize.lg} {...props} />;

export { Icon };
export default Icon;
