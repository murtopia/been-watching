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
  /** Icon variant (circle for modal icons) */
  variant?: 'circle';
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
  'heart-nav',
  'bookmark',
  'bell',
  'thumbs-up',
  'meh-face',
  'check',
  'star',
  'play',
  'close',
  'share',
];

/**
 * Get the full icon ID including state suffix and variant
 */
function getIconId(name: string, state: IconProps['state'], variant?: IconProps['variant']): string {
  // Icons without state variants (use as-is)
  if (!STATEFUL_ICONS.includes(name)) {
    return name;
  }

  // Build the icon ID with variant if provided
  const variantSuffix = variant === 'circle' ? '-c' : '';

  // Map state to suffix
  // Supports both old naming (-outline/-filled) and new naming (-default/-active)
  if (state === 'active') {
    return `${name}${variantSuffix}-active`;
  }

  if (state === 'filled') {
    return `${name}${variantSuffix}-filled`;
  }

  // Default state
  return `${name}${variantSuffix}-default`;
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
  variant,
  theme = 'dark',
  color: customColor,
  className = '',
  onClick,
  ariaLabel,
  ariaHidden = false,
}) => {
  const iconId = getIconId(name, state, variant);
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
        pointerEvents: onClick ? 'auto' : 'none',
      }}
    >
      <use xlinkHref={`/icons/feed-sprite.svg?v=20250119a#${iconId}`} />
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
