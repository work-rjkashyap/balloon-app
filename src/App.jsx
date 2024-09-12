// src/App.js
import React, { useState, useEffect, memo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sphere, OrbitControls, Sky } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import balloonPopSound from './sounds/balloon-pop.wav'; // Adjust path as needed

const Balloon = memo(({ position, color, speed, onClick }) => {
  const [y, setY] = useState(position[1]);
  const { scale, opacity } = useSpring({
    scale: y > position[1] ? 1 : 0,
    opacity: y > position[1] ? 1 : 0,
    config: { tension: 300, friction: 10 }
  });

  useEffect(() => {
    const animate = () => {
      setY((prevY) => {
        if (prevY >= 5) {
          return position[1]; // Reset to start position if it reaches the top
        }
        return prevY + speed;
      });
      requestAnimationFrame(animate);
    };
    animate();
  }, [speed, position]);

  return (
    <animated.mesh
      position={[position[0], y, position[2]]}
      onClick={() => {
        const audio = new Audio(balloonPopSound);
        audio.preload = 'auto'; // Preload audio
        audio.play();
        onClick();
      }}
      scale={scale}
      opacity={opacity}
      castShadow
      receiveShadow
    >
      <Sphere args={[0.5, 32, 32]}>
        <meshStandardMaterial attach="material" color={color} roughness={0.8} metalness={0.2} />
      </Sphere>
    </animated.mesh>
  );
});

function Scene({ score, setScore, stopMotion, setStopMotion, gameOver, difficulty }) {
  const [balloons, setBalloons] = useState([]);
  const [spawnRate, setSpawnRate] = useState(2000);

  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      const x = (Math.random() - 0.5) * 6;
      const z = (Math.random() - 0.5) * 6;
      const balloonType = Math.random();
     const speed = 0.05 + difficulty * 0.01;

      let color = `hsl(${Math.random() * 360}, 100%, 50%)`; // Random colorful balloon
      if (balloonType < 0.1) {
        color = 'black'; // Bomb balloon
      } else if (balloonType < 0.2) {
        color = 'yellow'; // Star balloon
      }

      setBalloons((prev) => [
        ...prev,
        { position: [x, -5, z], color, speed },
      ]);
    }, spawnRate);

    return () => clearInterval(interval);
  }, [gameOver, spawnRate, difficulty]);

  useEffect(() => {
    if (gameOver) return;

    const difficultyInterval = setInterval(() => {
      if (spawnRate > 500) {
        setSpawnRate((prev) => prev - 100);
      }
    }, 10000);

    return () => clearInterval(difficultyInterval);
  }, [gameOver]);

  const popBalloon = (index, color) => {
    setBalloons((balloons) => balloons.filter((_, i) => i !== index));

    if (color === 'black') {
      setScore((prev) => prev - 20);
    } else if (color === 'yellow') {
      setStopMotion(true);
      setTimeout(() => setStopMotion(false), 3000);
    } else {
      setScore((prev) => prev + 10);
    }
  };

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        castShadow
        position={[5, 10, 5]}
        intensity={1.5}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {balloons.map(({ position, color, speed }, index) => (
        <Balloon
          key={index}
          position={position}
          color={color}
          speed={speed}
          onClick={() => popBalloon(index, color)}
        />
      ))}

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={false} // Optional: allows rotation if desired
      />
      <Sky
        distance={450000}
        sunPosition={[1, 1, 0]}
        inclination={0.49}
        azimuth={0.25}
      />
    </>
  );
}

function App() {
  const [score, setScore] = useState(0);
  const [stopMotion, setStopMotion] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [difficulty, setDifficulty] = useState(0.3);

  useEffect(() => {
    if (timeLeft === 0) {
      setGameOver(true);
    } else if (!gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, gameOver]);

  const restartGame = () => {
    setScore(0);
    setStopMotion(false);
    setTimeLeft(30);
    setGameOver(false);
    setDifficulty(0.3);
  };

  return (
    <>
      <h1>Score: {score}</h1>
      <h2>Time Left: {timeLeft} sec</h2>

      {gameOver ? (
        <>
          <h1>Game Over! Final Score: {score}</h1>
          <button onClick={restartGame}>Restart Game</button>
        </>
      ) : (
        <Canvas
          shadows
          style={{ height: '100vh', width: '100vw' }}
          camera={{ position: [0, 0, 10], fov: 50 }}
        >
          <Scene
            score={score}
            setScore={setScore}
            stopMotion={stopMotion}
            setStopMotion={setStopMotion}
            gameOver={gameOver}
            difficulty={difficulty}
          />
        </Canvas>
      )}
    </>
  );
}

export default App;
