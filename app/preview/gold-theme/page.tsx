'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';

export default function GoldThemePreview() {
  const [selectedGold, setSelectedGold] = useState<'electric' | 'bright'>('electric');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [goldIcons, setGoldIcons] = useState(false);
  const [goldGlass, setGoldGlass] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  
  const goldColors = {
    electric: '#FFC125',
    bright: '#FFD700',
  };
  
  const currentGold = goldColors[selectedGold];
  const iconColor = goldIcons ? currentGold : 'white';
  
  // Gold glass background - subtle gold tint
  const goldGlassBg = isDarkMode 
    ? `rgba(${parseInt(currentGold.slice(1,3), 16)}, ${parseInt(currentGold.slice(3,5), 16)}, ${parseInt(currentGold.slice(5,7), 16)}, 0.15)`
    : `rgba(${parseInt(currentGold.slice(1,3), 16)}, ${parseInt(currentGold.slice(3,5), 16)}, ${parseInt(currentGold.slice(5,7), 16)}, 0.2)`;
  
  // Theme colors
  const theme = {
    bg: isDarkMode ? '#0d0d0d' : '#ffffff',
    cardBg: isDarkMode ? '#1a1a1a' : '#f5f5f5',
    cardGradient: isDarkMode 
      ? 'linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)' 
      : 'linear-gradient(180deg, #e0e0e0 0%, #f5f5f5 100%)',
    text: isDarkMode ? 'white' : '#1a1a1a',
    textMuted: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
    textFaint: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
    glassBg: isDarkMode ? 'rgba(20, 20, 25, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    buttonBg: goldGlass 
      ? goldGlassBg 
      : (isDarkMode ? 'rgba(60, 60, 60, 0.4)' : 'rgba(200, 200, 200, 0.6)'),
    buttonBorder: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
  };
  
  return (
    <div style={{
      minHeight: '100vh',
      background: theme.bg,
      padding: '20px',
      paddingBottom: '120px',
      transition: 'background 0.3s',
    }}>
      {/* Control Panel */}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        right: '20px',
        zIndex: 100,
        background: theme.glassBg,
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        padding: '16px',
        border: `1px solid ${currentGold}40`,
        transition: 'background 0.3s',
      }}>
        <h2 style={{ 
          color: theme.text, 
          margin: '0 0 12px 0',
          fontSize: '16px',
          fontWeight: 600,
        }}>
          Gold Accent Preview
        </h2>
        
        {/* Gold Color Selection */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <button
            onClick={() => setSelectedGold('electric')}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '12px',
              border: selectedGold === 'electric' ? `2px solid ${goldColors.electric}` : `2px solid ${theme.buttonBorder}`,
              background: selectedGold === 'electric' ? `${goldColors.electric}20` : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div style={{
              width: '100%',
              height: '24px',
              borderRadius: '6px',
              background: goldColors.electric,
              marginBottom: '8px',
            }} />
            <span style={{ color: theme.text, fontSize: '12px' }}>Electric Gold</span>
            <br />
            <span style={{ color: theme.textMuted, fontSize: '10px' }}>#FFC125</span>
          </button>
          <button
            onClick={() => setSelectedGold('bright')}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '12px',
              border: selectedGold === 'bright' ? `2px solid ${goldColors.bright}` : `2px solid ${theme.buttonBorder}`,
              background: selectedGold === 'bright' ? `${goldColors.bright}20` : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div style={{
              width: '100%',
              height: '24px',
              borderRadius: '6px',
              background: goldColors.bright,
              marginBottom: '8px',
            }} />
            <span style={{ color: theme.text, fontSize: '12px' }}>Bright Gold</span>
            <br />
            <span style={{ color: theme.textMuted, fontSize: '10px' }}>#FFD700</span>
          </button>
        </div>

        {/* Mode Toggles - Row 1 */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
          {/* Light/Dark Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '10px',
              border: `1.5px solid ${isDarkMode ? currentGold : `${currentGold}60`}`,
              background: isDarkMode ? `${currentGold}15` : 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: '16px' }}>🌙</span>
            <span style={{ color: theme.text, fontSize: '12px', fontWeight: 500 }}>
              Dark
            </span>
          </button>

          {/* Light Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '10px',
              border: `1.5px solid ${!isDarkMode ? currentGold : `${currentGold}60`}`,
              background: !isDarkMode ? `${currentGold}15` : 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: '16px' }}>☀️</span>
            <span style={{ color: theme.text, fontSize: '12px', fontWeight: 500 }}>
              Light
            </span>
          </button>
        </div>

        {/* Mode Toggles - Row 2 */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
          {/* Icon Color Toggle */}
          <button
            onClick={() => setGoldIcons(!goldIcons)}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '10px',
              border: `1.5px solid ${goldIcons ? currentGold : `${currentGold}60`}`,
              background: goldIcons ? `${currentGold}15` : 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
          >
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: currentGold,
              border: `2px solid ${currentGold}`,
            }} />
            <span style={{ color: theme.text, fontSize: '12px', fontWeight: 500 }}>
              Gold Icons
            </span>
          </button>

          {/* White Icons Toggle */}
          <button
            onClick={() => setGoldIcons(!goldIcons)}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '10px',
              border: `1.5px solid ${!goldIcons ? currentGold : `${currentGold}60`}`,
              background: !goldIcons ? `${currentGold}15` : 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
          >
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: isDarkMode ? 'white' : '#333',
              border: `2px solid ${currentGold}`,
            }} />
            <span style={{ color: theme.text, fontSize: '12px', fontWeight: 500 }}>
              White Icons
            </span>
          </button>
        </div>

        {/* Mode Toggles - Row 3: Gold Glass */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {/* Gold Glass Toggle */}
          <button
            onClick={() => setGoldGlass(!goldGlass)}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '10px',
              border: `1.5px solid ${goldGlass ? currentGold : `${currentGold}60`}`,
              background: goldGlass ? `${currentGold}15` : 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
          >
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${currentGold}40, ${currentGold}20)`,
              border: `2px solid ${currentGold}`,
            }} />
            <span style={{ color: theme.text, fontSize: '12px', fontWeight: 500 }}>
              Gold Glass Fill
            </span>
          </button>

          {/* Grey Glass Toggle */}
          <button
            onClick={() => setGoldGlass(!goldGlass)}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '10px',
              border: `1.5px solid ${!goldGlass ? currentGold : `${currentGold}60`}`,
              background: !goldGlass ? `${currentGold}15` : 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
          >
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: isDarkMode ? 'rgba(60, 60, 60, 0.6)' : 'rgba(200, 200, 200, 0.8)',
              border: `2px solid ${currentGold}`,
            }} />
            <span style={{ color: theme.text, fontSize: '12px', fontWeight: 500 }}>
              Grey Glass Fill
            </span>
          </button>
        </div>
      </div>

      {/* Sample Card */}
      <div style={{
        marginTop: '280px',
        maxWidth: '398px',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}>
        {/* Mock Feed Card */}
        <div style={{
          borderRadius: '24px',
          overflow: 'hidden',
          background: theme.cardBg,
          border: `1.5px solid ${currentGold}`,
          transition: 'background 0.3s',
        }}>
          {/* Card Image Area */}
          <div style={{
            height: '500px',
            background: theme.cardGradient,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.3s',
          }}>
            <div style={{
              textAlign: 'center',
              color: theme.textFaint,
            }}>
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎬</div>
              <div>Sample Show Poster</div>
            </div>

            {/* Action Buttons - Right Side */}
            <div style={{
              position: 'absolute',
              right: '12px',
              bottom: '80px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              alignItems: 'center',
            }}>
              {/* Heart Button */}
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: theme.buttonBg,
                    backdropFilter: 'blur(10px)',
                    border: `1.5px solid ${currentGold}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <Icon 
                    name="heart-nav" 
                    state={isLiked ? 'active' : 'default'} 
                    size={24}
                    color={isLiked ? undefined : iconColor}
                  />
                </button>
                <div style={{ 
                  color: theme.text, 
                  fontSize: '12px', 
                  marginTop: '4px',
                  textShadow: isDarkMode ? '0 1px 3px rgba(0,0,0,0.8)' : 'none',
                }}>
                  {isLiked ? 1 : 0}
                </div>
              </div>

              {/* Plus Button */}
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={() => setShowOverlay(!showOverlay)}
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: theme.buttonBg,
                    backdropFilter: 'blur(10px)',
                    border: `1.5px solid ${currentGold}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <Icon name="plus" state="default" size={24} color={iconColor} />
                </button>
              </div>

              {/* Comment Button */}
              <div style={{ textAlign: 'center' }}>
                <button
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: theme.buttonBg,
                    backdropFilter: 'blur(10px)',
                    border: `1.5px solid ${currentGold}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <Icon name="comment" state="default" size={24} color={iconColor} />
                </button>
                <div style={{ 
                  color: theme.text, 
                  fontSize: '12px', 
                  marginTop: '4px',
                  textShadow: isDarkMode ? '0 1px 3px rgba(0,0,0,0.8)' : 'none',
                }}>
                  0
                </div>
              </div>

              {/* Share Button */}
              <div style={{ textAlign: 'center' }}>
                <button
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: theme.buttonBg,
                    backdropFilter: 'blur(10px)',
                    border: `1.5px solid ${currentGold}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    opacity: 0.4,
                  }}
                >
                  <Icon name="share" state="default" size={24} color={iconColor} />
                </button>
              </div>
            </div>

            {/* User Badge */}
            <div style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: goldGlass ? goldGlassBg : (isDarkMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)'),
              backdropFilter: 'blur(10px)',
              padding: '6px 12px 6px 6px',
              borderRadius: '20px',
              border: `1.5px solid ${currentGold}`,
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${currentGold}, ${currentGold}80)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
              }}>
                👤
              </div>
              <span style={{ color: theme.text, fontSize: '13px', fontWeight: 500 }}>
                Sample User
              </span>
            </div>

            {/* Menu Dots */}
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
            }}>
              <button style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: theme.buttonBg,
                backdropFilter: 'blur(10px)',
                border: `1.5px solid ${currentGold}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}>
                <Icon name="menu-dots" size={20} color={iconColor} />
              </button>
            </div>
          </div>

          {/* Card Footer */}
          <div style={{ padding: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
            }}>
              <span style={{ 
                color: currentGold, 
                fontSize: '11px', 
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                HBO
              </span>
              <span style={{ color: theme.textFaint }}>•</span>
              <span style={{ color: theme.textMuted, fontSize: '12px' }}>Drama</span>
            </div>
            <h3 style={{ 
              color: theme.text, 
              margin: '0 0 4px 0',
              fontSize: '18px',
              fontWeight: 600,
            }}>
              Sample Show Title
            </h3>
            <p style={{ 
              color: theme.textMuted, 
              margin: 0,
              fontSize: '13px',
            }}>
              2024 • Season 1
            </p>
          </div>
        </div>

        {/* Divider Example */}
        <div style={{
          margin: '32px 0',
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${currentGold}60, transparent)`,
        }} />

        {/* Additional UI Elements */}
        <div style={{
          background: goldGlass ? goldGlassBg : (isDarkMode ? 'rgba(20, 20, 25, 0.8)' : 'rgba(255, 255, 255, 0.9)'),
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '20px',
          border: `1.5px solid ${currentGold}`,
          transition: 'background 0.3s',
        }}>
          <h3 style={{ 
            color: theme.text, 
            margin: '0 0 16px 0',
            fontSize: '16px',
          }}>
            Other UI Elements
          </h3>

          {/* Tabs Example */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '20px',
          }}>
            <button style={{
              padding: '8px 16px',
              borderRadius: '20px',
              background: goldGlass ? goldGlassBg : `${currentGold}20`,
              border: `1.5px solid ${currentGold}`,
              color: currentGold,
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
            }}>
              Watching
            </button>
            <button style={{
              padding: '8px 16px',
              borderRadius: '20px',
              background: 'transparent',
              border: `1.5px solid ${currentGold}50`,
              color: theme.textMuted,
              fontSize: '13px',
              cursor: 'pointer',
            }}>
              Want to Watch
            </button>
            <button style={{
              padding: '8px 16px',
              borderRadius: '20px',
              background: 'transparent',
              border: `1.5px solid ${currentGold}50`,
              color: theme.textMuted,
              fontSize: '13px',
              cursor: 'pointer',
            }}>
              Watched
            </button>
          </div>

          {/* Rating Stars */}
          <div style={{ marginBottom: '20px' }}>
            <span style={{ color: theme.textMuted, fontSize: '13px', marginRight: '8px' }}>
              Rating:
            </span>
            <span style={{ color: currentGold, fontSize: '16px' }}>★★★★</span>
            <span style={{ color: theme.textFaint, fontSize: '16px' }}>★</span>
          </div>

          {/* Progress Bar */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
            }}>
              <span style={{ color: theme.textMuted, fontSize: '13px' }}>
                Season Progress
              </span>
              <span style={{ color: currentGold, fontSize: '13px', fontWeight: 500 }}>
                6/10 episodes
              </span>
            </div>
            <div style={{
              height: '4px',
              background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              borderRadius: '2px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: '60%',
                height: '100%',
                background: `linear-gradient(90deg, ${currentGold}, ${currentGold}cc)`,
                borderRadius: '2px',
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Preview */}
      <div style={{
        position: 'fixed',
        bottom: '34px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 100,
      }}>
        {/* Home Button */}
        <button style={{
          width: '100px',
          height: '48px',
          borderRadius: '24px',
          background: goldGlass ? goldGlassBg : (isDarkMode ? 'rgba(30, 30, 35, 0.8)' : 'rgba(255, 255, 255, 0.9)'),
          backdropFilter: 'blur(20px)',
          border: `1.5px solid ${currentGold}`,
          color: theme.text,
          fontSize: '13px',
          fontWeight: 600,
          letterSpacing: '0.5px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s',
        }}>
          HOME
        </button>

        {/* Plus Button */}
        <button style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: goldGlass ? goldGlassBg : (isDarkMode ? 'rgba(30, 30, 35, 0.8)' : 'rgba(255, 255, 255, 0.9)'),
          backdropFilter: 'blur(20px)',
          border: `1.5px solid ${currentGold}`,
          color: goldIcons ? currentGold : theme.text,
          fontSize: '24px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s',
        }}>
          +
        </button>

        {/* Shows Button */}
        <button style={{
          width: '100px',
          height: '48px',
          borderRadius: '24px',
          background: goldGlass ? goldGlassBg : (isDarkMode ? 'rgba(30, 30, 35, 0.8)' : 'rgba(255, 255, 255, 0.9)'),
          backdropFilter: 'blur(20px)',
          border: `1.5px solid ${currentGold}`,
          color: theme.text,
          fontSize: '13px',
          fontWeight: 600,
          letterSpacing: '0.5px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s',
        }}>
          SHOWS
        </button>
      </div>

      <style jsx>{`
        button:hover {
          transform: scale(1.02);
        }
        button:active {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
}

