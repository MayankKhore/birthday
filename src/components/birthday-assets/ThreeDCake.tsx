/**
 * ThreeDCake — Interactive 3D birthday cake built with Three.js.
 *
 * This is an original procedurally-generated 3D cake model (not a static illustration).
 * Supports actual rotation via mouse/touch drag and auto-rotation, plus candle flame
 * animation. Inspired by the birthday cake reference artwork in public/assets/cakes/.
 *
 * Colors follow the project visual identity:
 *   - midnight-plum: #2B2452 (cake base accents)
 *   - lavender: #C3BDEC (cake layers)
 *   - coral: #F472B6 (frosting, candles, decorations)
 *   - warm-ivory: #FBF2E7 (frosting drips, plate)
 */
import { useRef, useEffect, useCallback, useState } from 'react';
import * as THREE from 'three';

interface Props {
  recipientName?: string;
  candleCount?: number;
  autoRotate?: boolean;
  onCandleBlown?: () => void;
  reducedMotion?: boolean;
}

const CAKE_COLORS = {
  layer1: 0xc3bdec,
  layer2: 0xdfd8f3,
  layer3: 0xf3c5d7,
  drip: 0xfbf2e7,
  plate: 0xe0a428,
  candle1: 0xa78bfa,
  candle2: 0xf472b6,
  candle3: 0xfcd34d,
  flame: 0xfcd34d,
  flame2: 0xfb923c,
};

export function ThreeDCake({
  recipientName = 'Someone Special',
  candleCount = 4,
  autoRotate = true,
  onCandleBlown,
  reducedMotion = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isBlown, setIsBlown] = useState(false);
  const [candlesLit, setCandlesLit] = useState<boolean[]>(Array(candleCount).fill(true));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1826);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 2, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(5, 5, 5);
    scene.add(mainLight);

    const fillLight = new THREE.PointLight(0xf472b6, 0.4);
    fillLight.position.set(-3, 2, 3);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xa78bfa, 0.3);
    rimLight.position.set(3, -2, 3);
    scene.add(rimLight);

    const layerMaterial = new THREE.MeshStandardMaterial({ color: CAKE_COLORS.layer1, roughness: 0.7, metalness: 0.1 });
    const layerMaterial2 = new THREE.MeshStandardMaterial({ color: CAKE_COLORS.layer2, roughness: 0.7, metalness: 0.1 });
    const frostingMaterial = new THREE.MeshStandardMaterial({ color: CAKE_COLORS.layer3, roughness: 0.8, metalness: 0.05 });
    const dripMaterial = new THREE.MeshStandardMaterial({ color: CAKE_COLORS.drip, roughness: 0.4, metalness: 0 });
    const plateMaterial = new THREE.MeshStandardMaterial({ color: CAKE_COLORS.plate, roughness: 0.3, metalness: 0.6 });
    const candleMaterial = new THREE.MeshStandardMaterial({ color: CAKE_COLORS.candle1, roughness: 0.5, metalness: 0.1 });
    const flameMaterial = new THREE.MeshBasicMaterial({ color: CAKE_COLORS.flame });

    function createCakeLayer(radius: number, height: number, material: THREE.Material) {
      const geometry = new THREE.CylinderGeometry(radius, radius * 0.95, height, 32);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    }

    const cakeGroup = new THREE.Group();
    scene.add(cakeGroup);

    const plateGeo = new THREE.CylinderGeometry(2.2, 2.0, 0.3, 32);
    const plate = new THREE.Mesh(plateGeo, plateMaterial);
    plate.position.y = 0;
    plate.receiveShadow = true;
    cakeGroup.add(plate);

    const layer1 = createCakeLayer(1.6, 0.9, layerMaterial);
    layer1.position.y = 0.45;
    cakeGroup.add(layer1);

    const layer2 = createCakeLayer(1.2, 0.7, layerMaterial2);
    layer2.position.y = 1.15;
    cakeGroup.add(layer2);

    const layer3 = createCakeLayer(0.85, 0.5, frostingMaterial);
    layer3.position.y = 1.65;
    cakeGroup.add(layer3);

    const dripCount = 8;
    for (let i = 0; i < dripCount; i++) {
      const angle = (i / dripCount) * Math.PI * 2;
      const dripGeo = new THREE.CylinderGeometry(0.08, 0.04, 0.35, 8);
      const drip = new THREE.Mesh(dripGeo, dripMaterial);
      drip.position.set(Math.cos(angle) * 1.35, 1.45, Math.sin(angle) * 1.35);
      drip.rotation.z = Math.random() * 0.3;
      cakeGroup.add(drip);
    }

    const heartShape = new THREE.Shape();
    const heartX = 0, heartY = 0;
    heartShape.moveTo(heartX + 0.25, heartY + 0.1);
    heartShape.bezierCurveTo(heartX + 0.25, heartY + 0.01, heartX + 0.1, heartY - 0.1, heartX, heartY - 0.05);
    heartShape.bezierCurveTo(heartX - 0.1, heartY - 0.1, heartX - 0.25, heartY + 0.01, heartX - 0.25, heartY + 0.1);
    heartShape.bezierCurveTo(heartX - 0.25, heartY + 0.19, heartX, heartY + 0.3, heartX, heartY + 0.3);
    heartShape.bezierCurveTo(heartX, heartY + 0.3, heartX + 0.25, heartY + 0.19, heartX + 0.25, heartY + 0.1);

    const heartGeo = new THREE.ShapeGeometry(heartShape);
    const heartMesh = new THREE.Mesh(heartGeo, new THREE.MeshStandardMaterial({ color: CAKE_COLORS.candle2 }));
    heartMesh.position.set(0, 1.92, 0);
    heartMesh.rotation.x = -Math.PI / 2;
    cakeGroup.add(heartMesh);

    const candles: THREE.Mesh[] = [];
    const flames: THREE.Mesh[] = [];
    const candlePositions = [
      { x: -0.6, z: -0.4, color: CAKE_COLORS.candle1 },
      { x: 0.6, z: -0.4, color: CAKE_COLORS.candle2 },
      { x: -0.4, z: 0.5, color: CAKE_COLORS.candle3 },
      { x: 0.4, z: 0.5, color: CAKE_COLORS.candle1 },
    ];

    for (let i = 0; i < Math.min(candleCount, candlePositions.length); i++) {
      const pos = candlePositions[i];
      const candleMat = new THREE.MeshStandardMaterial({ color: pos.color, roughness: 0.6 });
      const candleGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 12);
      const candle = new THREE.Mesh(candleGeo, candleMat);
      candle.position.set(pos.x, 1.95, pos.z);
      candle.castShadow = true;
      candles.push(candle);
      cakeGroup.add(candle);

      const flameGeo = new THREE.ConeGeometry(0.08, 0.25, 8);
      const flame = new THREE.Mesh(flameGeo, flameMaterial);
      flame.position.set(pos.x, 2.2, pos.z);
      flame.scale.set(0.7, 1, 0.7);
      flames.push(flame);
      cakeGroup.add(flame);

      const wickGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.08, 8);
      const wick = new THREE.Mesh(wickGeo, new THREE.MeshStandardMaterial({ color: 0x333333 }));
      wick.position.set(pos.x, 2.08, pos.z);
      cakeGroup.add(wick);
    }

    const berryColors = [0xec4899, 0x3b82f6, 0xfcd34d];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const berryGeo = new THREE.SphereGeometry(0.07, 12, 12);
      const berry = new THREE.Mesh(berryGeo, new THREE.MeshStandardMaterial({ color: berryColors[i % berryColors.length] }));
      berry.position.set(Math.cos(angle) * 0.75, 1.85, Math.sin(angle) * 0.75);
      cakeGroup.add(berry);
    }

    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let autoRotationAngle = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;
      cakeGroup.rotation.y += deltaX * 0.005;
      cakeGroup.rotation.x += deltaY * 0.005;
      cakeGroup.rotation.x = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, cakeGroup.rotation.x));
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => { isDragging = false; };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePosition.x;
      const deltaY = e.touches[0].clientY - previousMousePosition.y;
      cakeGroup.rotation.y += deltaX * 0.008;
      cakeGroup.rotation.x += deltaY * 0.008;
      cakeGroup.rotation.x = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, cakeGroup.rotation.x));
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onTouchEnd = () => { isDragging = false; };

    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseup', onMouseUp);
    container.addEventListener('mouseleave', onMouseUp);
    container.addEventListener('touchstart', onTouchStart, { passive: false });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd);

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();

    function animate() {
      const elapsed = clock.getElapsedTime();

      if (autoRotate && !isDragging) {
        autoRotationAngle += 0.008;
        cakeGroup.rotation.y = Math.sin(autoRotationAngle * 0.5) * 0.3;
      }

      if (!isBlown) {
        flames.forEach((flame, i) => {
          if (candlesLit[i]) {
            const flicker = Math.sin(elapsed * (8 + i * 2)) * 0.05 + Math.cos(elapsed * (5 + i)) * 0.03;
            flame.scale.y = 1 + flicker;
            flame.scale.x = 0.7 + flicker * 0.3;
            flame.scale.z = 0.7 + flicker * 0.3;
            flame.position.y = 2.2 + flicker * 0.2;
            flame.visible = true;
          } else {
            flame.visible = false;
          }
        });
      } else {
        flames.forEach((f) => { f.visible = false; });
      }

      if (!reducedMotion) {
        const float = Math.sin(elapsed * 1.5) * 0.02;
        cakeGroup.position.y = float;
      }

      renderer.render(scene, camera);
    }

    renderer.setAnimationLoop(animate);

    return () => {
      container.removeEventListener('mousedown', onMouseDown);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('mouseleave', onMouseUp);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', onResize);
      renderer.setAnimationLoop(null);
      renderer.dispose();
      if (container) container.removeChild(renderer.domElement);
    };
  }, [candleCount, autoRotate, reducedMotion, isBlown, candlesLit]);

  const blowOutCandles = useCallback(() => {
    setIsBlown(true);
    setCandlesLit(Array(candleCount).fill(false));
    if (onCandleBlown) onCandleBlown();
  }, [candleCount, onCandleBlown]);

  const relightCandles = useCallback(() => {
    setIsBlown(false);
    setCandlesLit(Array(candleCount).fill(true));
  }, [candleCount]);

  return (
    <div
      ref={containerRef}
      className="w-full max-w-md h-[400px] bg-[var(--color-surface)] rounded-3xl shadow-lg border border-[var(--color-border)] overflow-hidden relative"
      aria-label={`Interactive 3D birthday cake for ${recipientName}`}
      role="img"
      tabIndex={0}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6" aria-hidden="true">
        <svg className="w-24 h-24 mb-4 text-[var(--color-lavender)]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="4">
          <path d="M 30 70 Q 30 50 50 50 Q 70 50 70 70 Q 70 85 50 85 Q 30 85 30 70 Z"/>
          <path d="M 40 45 L 40 30" strokeLinecap="round"/>
          <path d="M 60 40 L 60 30" strokeLinecap="round"/>
        </svg>
        <p className="text-sm text-[var(--color-text-secondary)]">3D cake preview</p>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        <button
          type="button"
          onClick={blowOutCandles}
          disabled={isBlown}
          aria-label={isBlown ? 'Relight candles' : 'Blow out candles'}
          className="clay-btn clay-btn-ghost clay-btn-sm"
        >
          {isBlown ? 'Relight ✦' : 'Blow out 🕯️'}
        </button>
        <button
          type="button"
          onClick={relightCandles}
          disabled={!isBlown}
          aria-label="Relight candles"
          className="clay-btn clay-btn-ghost clay-btn-sm hidden sm:block"
        >
          Relight ✦
        </button>
      </div>

      <div className="absolute top-4 left-4 right-4 text-center pointer-events-none">
        <p className="text-xs font-semibold text-[var(--color-text-primary)] bg-[var(--color-surface)] px-3 py-1 rounded-full inline-block border border-[var(--color-border)]">
          {recipientName}'s Cake
        </p>
      </div>

      <div className="absolute bottom-4 left-4 text-[var(--color-text-tertiary)] text-xs pointer-events-none">
        {autoRotate ? 'Drag to rotate • ' : ''}Click candles to blow
      </div>
    </div>
  );
}