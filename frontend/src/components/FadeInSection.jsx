import React, { useEffect, useRef, useState } from 'react';
import './FadeInSection.css';

export default function FadeInSection({ children, className = '', style = {} }) {
  const [isVisible, setVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisible(entry.isIntersecting);
          observer.unobserve(entry.target); // Trigger only once
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px"
    });
    
    const current = domRef.current;
    if (current) {
      observer.observe(current);
    }
    
    return () => {
      if (current) observer.unobserve(current);
    };
  }, []);

  return (
    <div
      className={`fade-in-section ${isVisible ? 'is-visible' : ''} ${className}`}
      ref={domRef}
      style={style}
    >
      {children}
    </div>
  );
}
