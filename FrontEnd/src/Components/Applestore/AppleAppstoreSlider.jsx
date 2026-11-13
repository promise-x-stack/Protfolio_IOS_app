import React, { useState, useEffect, useRef, useCallback } from 'react';

// Default app data – Apple Store style
const defaultApps = [
  {
    name: 'Flask',
    category: 'Back End API',
    rating: 3.8,
    ratingCount: 'Ratings',
    price: 'Free',
    priceDetail: 'Contuct me to get started',
    artworkGradient: 'linear-gradient(115deg, #1D267D, #5C469C)',
    iconBig: 'fa-solid fa-code',
    iconSmall: 'fa-solid fa-code',
  },
  {
    name: 'Media Querys',
    category: 'Responsive layout desighn',
    rating: 4.9,
    ratingCount: 'Ratings',
    price: 'Free',
    priceDetail: 'Contuct me to get started',
    artworkGradient: 'linear-gradient(145deg, #11998E, #38EF7D)',
    iconBig: 'fas fa-desktop',
    iconSmall: 'fas fa-laptop',
  },
  {
    name: 'REACT',
    category: 'Front end Dev (UI/UX)',
    rating: 3.7,
    ratingCount: 'Ratings',
    price: 'Free',
    priceDetail: 'Contuct me to get started',
    artworkGradient: 'linear-gradient(120deg, #F2994A, #F2C94C)',
    iconBig: 'fa-solid fa-atom',
    iconSmall: 'fa-solid fa-atom',
  },
  {
    name: 'Cascading Style Sheet (CSS)',
    category: 'Styling',
    rating: 4.9,
    ratingCount: 'Ratings',
    price: 'Free',
    priceDetail: 'Contuct me to get started',
    artworkGradient: 'linear-gradient(135deg, #00C6FB, #005BEA)',
    iconBig: 'fa-solid fa-palette',
    iconSmall: 'fa-solid fa-palette',
  },
  {
    name: 'Hyper Text Murkap Language',
    category: 'Markap',
    rating: 4.8,
    ratingCount: 'Ratings',
    price: 'Free',
    priceDetail: 'Contuct me to get started',
    artworkGradient: 'linear-gradient(135deg, #8E2DE2, #4A00E0)',
    iconBig: 'fa-solid fa-code',
    iconSmall: 'fa-solid fa-code',
  },
];




// Helper: generate star icons
const renderStars = (rating) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.3 && rating % 1 <= 0.8;
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(<i key={i} className="fas fa-star" style={{ color: '#ffb340' }} />);
    } else if (i === fullStars + 1 && hasHalf) {
      stars.push(<i key={i} className="fas fa-star-half-alt" style={{ color: '#ffb340' }} />);
    } else {
      stars.push(<i key={i} className="far fa-star" style={{ color: '#d4d4d6' }} />);
    }
  }
  return stars;
};

const AppleAppSlider = ({ apps = defaultApps }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideWidth, setSlideWidth] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const trackRef = useRef(null);
  const viewportRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isSwiping = useRef(false);

  const totalSlides = apps.length;

  // Update slide dimensions based on viewport width
  const updateDimensions = useCallback(() => {
    if (viewportRef.current) {
      const width = viewportRef.current.clientWidth;
      setSlideWidth(width);
    }
  }, []);

  // Move to a specific slide
  const goToSlide = useCallback(
    (index, smooth = true) => {
      if (index < 0) index = 0;
      if (index >= totalSlides) index = totalSlides - 1;
      if (index === currentIndex && !smooth) {
        if (trackRef.current && slideWidth) {
          trackRef.current.style.transition = 'none';
          trackRef.current.style.transform = `translateX(-${index * slideWidth}px)`;
          void trackRef.current.offsetHeight; // force reflow
          trackRef.current.style.transition = '';
        }
        return;
      }
      if (index === currentIndex) return;

      setCurrentIndex(index);
      if (trackRef.current && slideWidth) {
        trackRef.current.style.transition = smooth
          ? 'transform 0.5s cubic-bezier(0.2, 0.9, 0.4, 1.1)'
          : 'none';
        trackRef.current.style.transform = `translateX(-${index * slideWidth}px)`;
        if (!smooth) {
          setTimeout(() => {
            if (trackRef.current) trackRef.current.style.transition = '';
          }, 20);
        }
      }
    },
    [currentIndex, slideWidth, totalSlides]
  );

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    if (currentIndex < totalSlides - 1) goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide, isTransitioning, totalSlides]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    if (currentIndex > 0) goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide, isTransitioning]);


  //////////////////
  //////////////////
  // Handle resize
  useEffect(() => {
    updateDimensions();
    const handleResize = () => {
      updateDimensions();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateDimensions]);

  // Update track position when slideWidth or currentIndex changes
  useEffect(() => {
    if (trackRef.current && slideWidth > 0) {
      trackRef.current.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
    }
  }, [slideWidth, currentIndex]);

  // Touch swipe handlers
  const onTouchStart = (e) => {
    if (isTransitioning) return;
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    isSwiping.current = true;
  };

  const onTouchMove = (e) => {
    if (!isSwiping.current || isTransitioning) return;
    const touch = e.touches[0];
    const diffX = touch.clientX - touchStartX.current;
    const diffY = touch.clientY - (touchStartY.current ?? touch.clientY);
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 12) {
      e.preventDefault();
      touchEndX.current = touch.clientX;
    }
  };

  let touchStartY = useRef(0);
  const onTouchStartWithY = (e) => {
    touchStartY.current = e.touches[0].clientY;
    onTouchStart(e);
  };

  const onTouchMoveWithPrevent = (e) => {
    if (!isSwiping.current || isTransitioning) return;
    const diffX = e.touches[0].clientX - touchStartX.current;
    const diffY = e.touches[0].clientY - touchStartY.current;
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 12) {
      e.preventDefault();
      touchEndX.current = e.touches[0].clientX;
    }
  };

  const onTouchEnd = () => {
    if (!isSwiping.current || isTransitioning) {
      isSwiping.current = false;
      return;
    }
    isSwiping.current = false;
    const deltaX = touchEndX.current - touchStartX.current;
    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0 && currentIndex > 0) {
        prevSlide();
      } else if (deltaX < 0 && currentIndex < totalSlides - 1) {
        nextSlide();
      }
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // Transition listeners to lock state
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onTransitionStart = () => setIsTransitioning(true);
    const onTransitionEnd = () => setIsTransitioning(false);
    track.addEventListener('transitionstart', onTransitionStart);
    track.addEventListener('transitionend', onTransitionEnd);
    track.addEventListener('transitioncancel', onTransitionEnd);
    return () => {
      track.removeEventListener('transitionstart', onTransitionStart);
      track.removeEventListener('transitionend', onTransitionEnd);
      track.removeEventListener('transitioncancel', onTransitionEnd);
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevSlide, nextSlide]);

  // Inject Font Awesome (if not already present)
  useEffect(() => {
    if (!document.querySelector('#font-awesome-cdn')) {
      const link = document.createElement('link');
      link.id = 'font-awesome-cdn';
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css';
      document.head.appendChild(link);
    }
  }, []);

  return (
    <div className="app-slider-wrapper">

      <div className="slider-viewport" ref={viewportRef}>
        <div
          className="slider-track"
          ref={trackRef}
          onTouchStart={onTouchStartWithY}
          onTouchMove={onTouchMoveWithPrevent}
          onTouchEnd={onTouchEnd}
        >
          {apps.map((app, idx) => (
            <div key={idx} className="slide-card" style={{ flex: `0 0 ${slideWidth}px` }}>
              <div className="app-artwork" style={{ background: app.artworkGradient }}>
                <div className="artwork-gradient"></div>
                <div className="icon-large">
                  <i className={app.iconBig}></i>
                </div>
              </div>
              <div className="app-details">
                <div className="app-info-row">
                  <div className="app-icon-small">
                    <i className={app.iconSmall} style={{ fontSize: '1.8rem', color: '#007aff' }}></i>
                  </div>
                  <div className="app-name-box">
                    <div className="app-name">{app.name}</div>
                    <div className="app-category">{app.category}</div>
                  </div>
                </div>
                <div className="rating-section">
                  <div className="stars">{renderStars(app.rating)}</div>
                  <div className="rating-count">{app.rating} • {app.ratingCount}</div>
                </div>
                <div className="price-get">
                  <div className="price-tag">
                    {app.price}
                    <span style={{ fontSize: '0.7rem', fontWeight: 'normal', color: '#8e8e93' }}>
                      {' • '}{app.priceDetail}
                    </span>
                  </div>
                  
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="slider-controls">
        <button className={`nav-btn ${currentIndex === 0 ? 'disabled' : ''}`} onClick={prevSlide}>
          <i className="fas fa-chevron-left"></i>
        </button>
        <button className={`nav-btn ${currentIndex === totalSlides - 1 ? 'disabled' : ''}`} onClick={nextSlide}>
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>

      <div className="dots-container">
        {apps.map((_, idx) => (
          <div
            key={idx}
            className={`dot ${idx === currentIndex ? 'active' : ''}`}
            onClick={() => goToSlide(idx)}
          ></div>
        ))}
      </div>

      {/* Inject styles (once) */}
      <style>{`
        .app-slider-wrapper {
          max-width: 1280px;
          width: 100%;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.81);
          backdrop-filter: blur(12px);
          border-radius: 10px;
          padding:10px 60px;
          box-shadow: 0 25px 45px -12px rgba(0, 0, 0, 0.14), 0 2px 6px rgba(0, 0, 0, 0.02);
          font-family: -apple-system, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        @media(min-width:1200px){
          .app-slider-wrapper{
            margin-top: 1.6cm;
          }
        }
        .title-section h2 {
          font-size: 1.8rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, #1c1c1e, #3a3a44);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .title-section p {
          color: #6c6c70;
          font-size: 0.9rem;
          font-weight: 500;
          margin-top: 4px;
        }
        .badge-apple {
          background: #007aff10;
          backdrop-filter: blur(8px);
          padding: 6px 14px;
          border-radius: 40px;
          font-size: 0.8rem;
          font-weight: 500;
          color: #007aff;
          border: 0.5px solid rgba(0, 122, 255, 0.2);
        }
        .slider-viewport {
          position: relative;
          overflow: hidden;
          border-radius: 48px;
          margin: 1rem 0 2rem;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
        }
        .slider-track {
          display: flex;
          transition: transform 0.5s cubic-bezier(0.2, 0.9, 0.4, 1.1);
          will-change: transform;
        }
        .slide-card {
          background: white;
          border-radius: 44px;
          overflow: hidden;
          box-shadow: 0 20px 35px -12px rgba(0, 0, 0, 0.1);
        }
        .app-artwork {
          height: 280px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          background-size: cover;
          background-position: center;
        }
        .artwork-gradient {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 30% 20%, rgba(255,255,240,0.2) 0%, rgba(0,0,0,0.05) 100%);
          z-index: 1;
        }
        .icon-large {
          font-size: 5rem;
          color: white;
          filter: drop-shadow(0 8px 16px rgba(0,0,0,0.2));
          z-index: 2;
          background: rgba(255,255,255,0.25);
          backdrop-filter: blur(8px);
          padding: 24px;
          border-radius: 60px;
        }
        .app-details {
          padding: 1.5rem 2rem 2rem 2rem;
        }
        .app-info-row {
          display: flex;
          gap: 1rem;
          align-items: center;
          margin-bottom: 1rem;
        }
        .app-icon-small {
          width: 52px;
          height: 52px;
          background: #f2f2f7;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 8px rgba(0,0,0,0.05);
        }
        .app-name {
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.3px;
          color: #1c1c1e;
        }
        .app-category {
          font-size: 0.8rem;
          font-weight: 500;
          color: #8e8e93;
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }
        .rating-section {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 12px 0 16px 0;
          flex-wrap: wrap;
        }
        .stars {
          display: flex;
          gap: 3px;
          font-size: 0.85rem;
        }
        .rating-count {
          font-size: 0.8rem;
          color: #8e8e93;
          font-weight: 500;
        }
        .price-get {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 6px;
        }
        .price-tag {
          font-weight: 700;
          font-size: 1rem;
          color: #1c1c1e;
        }
        .get-button {
          background: #007aff;
          padding: 8px 22px;
          border-radius: 40px;
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .get-button:hover {
          background: #005fc1;
          transform: scale(0.98);
        }
        .slider-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          margin-top: 0.8rem;
        }
        .nav-btn {
          width: 52px;
          height: 52px;
          border-radius: 60px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(4px);
          border: 0.5px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.05);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          color: #1c1c1e;
          transition: all 0.2s;
        }
        .nav-btn:active {
          transform: scale(0.94);
          background: #ffffff;
        }
        .nav-btn.disabled {
          opacity: 0.35;
          pointer-events: none;
        }
        .dots-container {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 2rem;
        }
        .dot {
          width: 8px;
          height: 8px;
          background: #c6c6c8;
          border-radius: 20px;
          transition: all 0.25s;
          cursor: pointer;
        }
        .dot.active {
          width: 28px;
          background: #007aff;
        }
        @media (max-width: 680px) {
          .app-slider-wrapper { padding: 1.2rem; border-radius: 10px; }
          .app-artwork { height: 220px; }
          .app-details { padding: 1.2rem; }
          .app-name { font-size: 1.3rem; }
          .icon-large { font-size: 3.6rem; padding: 16px; }
          .slider-header { flex-direction: column; gap: 10px; }
        }
        @media (max-width: 480px) {
          .app-info-row { flex-wrap: wrap; }
          .get-button { padding: 6px 18px; }
          .nav-btn { width: 44px; height: 44px; }
        }
      `}</style>
    </div>
  );
};

export default AppleAppSlider;