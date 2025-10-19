import React, { useEffect, useState } from 'react';

interface CardData {
  id: number;
  title: string;
  width: string;
  type: 'publication' | 'coming-soon';
  // For publication type
  authors?: string;
  myName?: string;
  conference?: string;
  abstract?: string;
  url?: string;
  // For coming-soon type
  message?: string;
}

interface StackedCardsProps {
  cards: CardData[];
}

export default function StackedCards({ cards }: StackedCardsProps) {
  const [cardStates, setCardStates] = useState<Array<{
    top: number;
    isSticky: boolean;
  }>>(cards.map(() => ({ top: 50, isSticky: false }))); // 初始位置在视口中间
  
  const STICKY_TOP = 80; // 5rem = 80px

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      
      const newStates = cards.map((_, index) => {
        // 每张卡片开始滚动的触发点
        // 第一张卡片从一开始就显示（triggerPoint = 0），后续卡片依次延后 1.2 屏（增加间隔）
        const triggerPoint = index * windowHeight * 1.2;
        
        // 每张卡片从触发点到停在顶部需要滚动的距离（1.5倍视口高度，让移动更慢）
        const scrollDistance = windowHeight * 1.5;
        
        // 初始位置（第一张在中间，后续在底部）
        const initialTop = index === 0 ? 50 : 100;
        
        if (scrollY < triggerPoint) {
          // 还没到触发点，保持初始位置
          return { top: initialTop, isSticky: false };
        } else if (scrollY >= triggerPoint && scrollY < triggerPoint + scrollDistance) {
          // 正在滚动中
          const progress = (scrollY - triggerPoint) / scrollDistance;
          const top = initialTop - (progress * (initialTop - (STICKY_TOP / windowHeight * 100)));
          return { top, isSticky: false };
        } else {
          // 已经到达顶部固定位置
          return { top: (STICKY_TOP / windowHeight * 100), isSticky: true };
        }
      });
      
      setCardStates(newStates);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // 初始化

    return () => window.removeEventListener('scroll', handleScroll);
  }, [cards]);

  // 计算总高度：每张卡片的滚动距离总和
  const totalHeight = typeof window !== 'undefined' 
    ? cards.length * (window.innerHeight * 1.2 + window.innerHeight * 1.5)
    : 3000;

  return (
    <div style={{ height: `${totalHeight}px`, position: 'relative', width: '100%' }}>
      {cards.map((card, index) => {
        const state = cardStates[index];
        
        return (
          <div
            key={card.id}
            style={{
              position: 'fixed',
              top: `${state.top}vh`,
              left: '50%',
              transform: 'translateX(-50%)',
              width: card.width,
              transition: 'opacity 0.3s ease-out', // 只对透明度做过渡，位置变化立即响应
              zIndex: 10 + index, // 后面的卡片 z-index 更高
              borderRadius: '20px 20px 0 0',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderTop: '2px solid rgba(102, 126, 234, 0.5)',
              borderLeft: '2px solid rgba(102, 126, 234, 0.3)',
              borderRight: '2px solid rgba(102, 126, 234, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              overflow: 'hidden',
              minHeight: '50vh',
              opacity: state.top < 100 ? 1 : 0,
              pointerEvents: state.top < 100 ? 'auto' : 'none',
              willChange: 'top', // 优化性能提示浏览器
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderTopColor = 'rgba(120, 219, 255, 0.7)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(102, 126, 234, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'translateX(-50%) translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderTopColor = 'rgba(102, 126, 234, 0.5)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'translateX(-50%)';
            }}
          >
            <h2 
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                marginLeft: '0.5rem',
                marginTop: '0.25rem',
                paddingLeft: '1.5rem',
                paddingTop: '1rem',
                marginBottom: '1rem',
                background: 'linear-gradient(135deg, #78dbff 0%, #667eea 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {card.title}
            </h2>
            <div style={{ padding: '1.5rem' }}>
              {card.type === 'publication' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <h3 style={{ 
                      color: 'rgba(255, 255, 255, 0.9)', 
                      fontSize: '1.1rem',
                      lineHeight: '1.6',
                      marginBottom: '1rem'
                    }}>
                      Authors: {card.authors}, <span style={{
                        background: 'linear-gradient(135deg, #78dbff 0%, #667eea 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: 700
                      }}>{card.myName}</span>
                    </h3>
                    <p style={{ 
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontStyle: 'italic',
                      marginTop: '0.5rem'
                    }}>
                      {card.conference}
                    </p>
                  </div>

                  <div style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    padding: '2rem',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
                  }}>
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.85)',
                      lineHeight: '1.7',
                      fontSize: '1rem',
                      textAlign: 'justify'
                    }}>
                      {card.abstract}
                    </p>
                  </div>

                  {card.url && (
                    <div style={{ textAlign: 'center' }}>
                      <a
                        href={card.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(10px)',
                          color: 'white',
                          padding: '1rem 2rem',
                          borderRadius: '16px',
                          fontWeight: 600,
                          boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        View Publication →
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(255, 119, 198, 0.1) 0%, rgba(189, 147, 249, 0.1) 100%)',
                  border: '1px solid rgba(255, 119, 198, 0.2)',
                  textAlign: 'center',
                  padding: '3rem 2rem',
                  borderRadius: '16px',
                  margin: '2rem'
                }}>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.85)',
                    lineHeight: '1.7',
                    fontSize: '1rem'
                  }}>
                    {card.message}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
