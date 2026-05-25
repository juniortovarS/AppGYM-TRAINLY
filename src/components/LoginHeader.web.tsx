import React, { useEffect, useRef } from 'react';
import { useTheme } from '../hooks/useTheme';
import { gsap } from 'gsap';

export const LoginHeader: React.FC = () => {
  const { colors, typography } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  const letters = ['T', 'R', 'A', 'I', 'N', 'L', 'Y'];

  // Resolve logo source
  const logoSource = require('../../assets/logo.png');
  const logoUri = logoSource && (logoSource.uri || logoSource.default || logoSource);

  useEffect(() => {
    // Only run on web environment
    if (typeof window !== 'undefined' && containerRef.current) {
      const el = containerRef.current;
      const logo = el.querySelector('.login-logo');
      const lettersElements = el.querySelectorAll('.login-letter');
      const tagline = el.querySelector('.login-tagline');

      const tl = gsap.timeline();

      // 1. Logo animation: elastic scale and rotation
      tl.fromTo(logo,
        { opacity: 0, scale: 0.4, rotate: -20 },
        { opacity: 1, scale: 1, rotate: 0, duration: 0.9, ease: 'back.out(1.5)' }
      );

      // 2. Letters animation: staggered slide down with elastic bounce
      tl.fromTo(lettersElements,
        { opacity: 0, y: -50, scale: 0.3, rotateY: 90 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotateY: 0,
          duration: 0.8,
          stagger: 0.06,
          ease: 'elastic.out(1, 0.5)',
        },
        '-=0.5' // overlaps with logo animation
      );

      // 3. Tagline animation: tracking-in and fade in
      tl.fromTo(tagline,
        { opacity: 0, y: 15, letterSpacing: '4px' },
        { opacity: 0.8, y: 0, letterSpacing: '0px', duration: 0.7, ease: 'power3.out' },
        '-=0.4'
      );
    }
  }, [colors]);

  return (
    <div ref={containerRef} style={styles.logoContainer}>
      {/* Logo Image */}
      <div className="login-logo" style={styles.logoWrapper}>
        <img
          src={logoUri}
          style={styles.logoImage}
          alt="Trainly Logo"
        />
      </div>

      {/* Letters "TRAINLY" */}
      <div style={styles.lettersContainer}>
        {letters.map((char, index) => (
          <span
            key={index}
            className="login-letter"
            style={{
              ...styles.logoTextChar,
              color: index >= 5 ? colors.primary : colors.textPrimary,
              fontSize: `${typography.sizes.display}px`,
              fontWeight: typography.weights.heavy as any,
            }}
          >
            {char}
          </span>
        ))}
      </div>

      {/* Tagline */}
      <p
        className="login-tagline"
        style={{
          ...styles.tagline,
          color: colors.textSecondary,
          fontSize: `${typography.sizes.sm}px`,
        }}
      >
        Performance & Elite Fitness Tracking
      </p>
    </div>
  );
};

const styles = {
  logoContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    marginBottom: '40px',
  },
  logoWrapper: {
    marginBottom: '12px',
  },
  logoImage: {
    width: '100px',
    height: '100px',
    objectFit: 'contain' as const,
  },
  lettersContainer: {
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTextChar: {
    letterSpacing: '-1px',
    display: 'inline-block',
    transformOrigin: 'center bottom',
    fontFamily: 'System-ui, -apple-system, sans-serif',
  },
  tagline: {
    marginTop: '6px',
    opacity: 0.8,
    textAlign: 'center' as const,
    fontFamily: 'System-ui, -apple-system, sans-serif',
  },
};
