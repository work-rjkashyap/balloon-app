import React, { useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/three';

function Balloon({ position, color, type, speed, onClick }) {
  const [y, setY] = useState(position[1]);
  const [scale, setScale] = useState(1);

  // Spring animation for popping effect
  const { scale: springScale, opacity } = useSpring({
    scale: scale === 0 ? 0 : 1,
    opacity: scale === 0 ? 0 : 1,
    config: { tension: 300, friction: 10 }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setY((prevY) => prevY + speed);
      setScale((prevScale) => {
        const newScale = 1 + Math.sin(y / 2) * 0.1;
        return newScale;
      });
    }, 100);

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [y, speed]);

  return (
    <animated.mesh
      position={[position[0], y, position[2]]}
      scale={springScale}
      onClick={onClick}
    >
      <sphereBufferGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color={color} opacity={opacity} transparent />
    </animated.mesh>
  );
}

export default Balloon;
