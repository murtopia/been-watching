'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';

export default function GoldThemePreview() {
  const [selectedGold, setSelectedGold] = useState<'electric' | 'bright'>('electric');
  const [isLiked, setIsLiked] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  
  const goldColors = {
    electric: '#FFC125',
    bright: '#FFD700',
  };
  
  const currentGold = goldColors[selectedGold];
  
  return (
    <div style={{
      minHeight: '100vh',
      background: '#000000',
      padding: '20px',
      paddingBottom: '120px',
    }}>
      {/* Color Picker */}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        right: '20px',
        zIndex: 100,
        background: 'rgba(20, 20, 25, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        padding: '16px',
        border: `1px solid ${currentGold}40`,
      }}>
        <h2 style={{ 
          color: 'white', 
          margin: '0 0 12px 0',
          fontSize: '16px',
          fontWeight: 600,
        }}>
          Gold Accent Preview
        </h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setSelectedGold('electric')}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '12px',
              border: selectedGold === 'electric' ? `2px solid ${goldColors.electric}` : '2px solid rgba(255,255,255,0.1)',
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
            <span style={{ color: 'white', fontSize: '12px' }}>Electric Gold</span>
            <br />
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>#FFC125</span>
          </button>
          <button
            onClick={() => setSelectedGold('bright')}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '12px',
              border: selectedGold === 'bright' ? `2px solid ${goldColors.bright}` : '2px solid rgba(255,255,255,0.1)',
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
            <span style={{ color: 'white', fontSize: '12px' }}>Bright Gold</span>
            <br />
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>#FFD700</span>
          </button>
        </div>
      </div>

      {/* Sample Card */}
      <div style={{
        marginTop: '140px',
        maxWidth: '398px',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}>
        {/* Mock Feed Card */}
        <div style={{
          borderRadius: '24px',
          overflow: 'hidden',
          background: '#1a1a1a',
          border: `1px solid ${currentGold}30`,
        }}>
          {/* Card Image Area */}
          <div style={{
            height: '500px',
            background: 'linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              textAlign: 'center',
              color: 'rgba(255,255,255,0.3)',
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
                    background: 'rgba(60, 60, 60, 0.4)',
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
                  />
                </button>
                <div style={{ 
                  color: 'white', 
                  fontSize: '12px', 
                  marginTop: '4px',
                  textShadow: '0 1px 3px rgba(0,0,0,0.8)',
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
                    background: 'rgba(60, 60, 60, 0.4)',
                    backdropFilter: 'blur(10px)',
                    border: `1.5px solid ${currentGold}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <Icon name="plus" state="default" size={24} />
                </button>
              </div>

              {/* Comment Button */}
              <div style={{ textAlign: 'center' }}>
                <button
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: 'rgba(60, 60, 60, 0.4)',
                    backdropFilter: 'blur(10px)',
                    border: `1.5px solid ${currentGold}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <Icon name="comment" state="default" size={24} />
                </button>
                <div style={{ 
                  color: 'white', 
                  fontSize: '12px', 
                  marginTop: '4px',
                  textShadow: '0 1px 3px rgba(0,0,0,0.8)',
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
                    background: 'rgba(60, 60, 60, 0.4)',
                    backdropFilter: 'blur(10px)',
                    border: `1.5px solid ${currentGold}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    opacity: 0.4,
                  }}
                >
                  <Icon name="share" state="default" size={24} />
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
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(10px)',
              padding: '6px 12px 6px 6px',
              borderRadius: '20px',
              border: `1px solid ${currentGold}40`,
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
              <span style={{ color: 'white', fontSize: '13px', fontWeight: 500 }}>
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
                background: 'rgba(60, 60, 60, 0.6)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${currentGold}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}>
                <Icon name="menu-dots" size={20} color="white" />
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
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>•</span>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>Drama</span>
            </div>
            <h3 style={{ 
              color: 'white', 
              margin: '0 0 4px 0',
              fontSize: '18px',
              fontWeight: 600,
            }}>
              Sample Show Title
            </h3>
            <p style={{ 
              color: 'rgba(255,255,255,0.5)', 
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
          background: 'rgba(20, 20, 25, 0.8)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '20px',
          border: `1px solid ${currentGold}30`,
        }}>
          <h3 style={{ 
            color: 'white', 
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
              background: `${currentGold}20`,
              border: `1px solid ${currentGold}`,
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
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '13px',
              cursor: 'pointer',
            }}>
              Want to Watch
            </button>
            <button style={{
              padding: '8px 16px',
              borderRadius: '20px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '13px',
              cursor: 'pointer',
            }}>
              Watched
            </button>
          </div>

          {/* Rating Stars */}
          <div style={{ marginBottom: '20px' }}>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginRight: '8px' }}>
              Rating:
            </span>
            <span style={{ color: currentGold, fontSize: '16px' }}>★★★★</span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '16px' }}>★</span>
          </div>

          {/* Progress Bar */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
            }}>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                Season Progress
              </span>
              <span style={{ color: currentGold, fontSize: '13px', fontWeight: 500 }}>
                6/10 episodes
              </span>
            </div>
            <div style={{
              height: '4px',
              background: 'rgba(255,255,255,0.1)',
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
          background: 'rgba(30, 30, 35, 0.8)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${currentGold}50`,
          color: 'white',
          fontSize: '13px',
          fontWeight: 600,
          letterSpacing: '0.5px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          HOME
        </button>

        {/* Plus Button */}
        <button style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(30, 30, 35, 0.8)',
          backdropFilter: 'blur(20px)',
          border: `1.5px solid ${currentGold}`,
          color: 'white',
          fontSize: '24px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          +
        </button>

        {/* Shows Button */}
        <button style={{
          width: '100px',
          height: '48px',
          borderRadius: '24px',
          background: 'rgba(30, 30, 35, 0.8)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${currentGold}50`,
          color: 'white',
          fontSize: '13px',
          fontWeight: 600,
          letterSpacing: '0.5px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
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

