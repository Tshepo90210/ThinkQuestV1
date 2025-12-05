import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { useGLTF, Environment, Html, OrbitControls, Grid } from '@react-three/drei';
import { Mesh, Box3, Vector3 } from 'three';

interface Avatar3DViewerProps {
  glbUrl: string;
  fallbackImageUrl: string;
  size?: number; // Size of the viewer in pixels (width and height)
  cameraHeight?: number; // New prop for camera vertical position
}

interface ModelProps {
  url: string;
  cameraDistance: number;
  fov: number;
  fallbackImageUrl: string;
  size: number;
}

const Model = ({ url, cameraDistance, fov, fallbackImageUrl, size }: ModelProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<Error | null>(null);

  const { scene } = useGLTF(url, 
    (loader) => {
      setIsLoading(false);
      console.log("GLB model loaded successfully. Scene:", scene);
    },
    (error) => {
      console.error("Error loading GLB model with useGLTF:", error);
      setLoadError(error);
      setIsLoading(false);
    }
  );
  const meshRef = useRef<Mesh>(null);

  useEffect(() => {
    console.log(`Model component state: isLoading=${isLoading}, loadError=${loadError ? loadError.message : 'none'}`);
    if (!isLoading && !loadError && scene) {
      console.log("Model component: Scene object available for rendering.");
    }
  }, [isLoading, loadError, scene]);

  if (loadError) {
    return <img src={fallbackImageUrl} alt="Avatar Load Error" style={{ width: size, height: size, borderRadius: '9999px', objectFit: 'cover' }} />;
  }

  if (scene) {
    return <primitive object={scene} ref={meshRef} />;
  }

  return null;
};

const SceneCleanup = () => {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    return () => {
      gl.dispose();
      scene.traverse((object) => {
        if (object instanceof Mesh) {
          object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((material) => material.dispose());
            }
            else {
              object.material.dispose();
            }
          }
        }
      });
    };
  }, [gl, scene, camera]);

  return null;
};

export const Avatar3DViewer: React.FC<Avatar3DViewerProps> = ({ glbUrl, fallbackImageUrl, size = 64, cameraHeight = 0.5 }) => {
  const [error, setError] = useState(false);

  const cameraDistance = 10;
  const fov = 20;

  const finalGlbUrl = glbUrl.startsWith('https://models.readyplayer.me/')
    ? `${import.meta.env.VITE_API_BASE_URL}/api/rpm-avatar-proxy?url=${encodeURIComponent(glbUrl)}`
    : glbUrl;


  if (error) {
    return <img src={fallbackImageUrl} alt="Avatar Fallback" className={`w-${size} h-${size} rounded-full object-cover`} />;
  }

  return (
    <div style={{ width: size, height: size }} className="rounded-full overflow-hidden">
      <Canvas
        key={finalGlbUrl}
        shadows
        camera={{ position: [200, 65, 0], fov: fov }} // Use cameraHeight here
        onError={(e) => {
          console.error("Error loading 3D model:", e);
          setError(true);
        }}
      >
        <Suspense fallback={
          <Html center>
            <img src={fallbackImageUrl} alt="Loading Avatar" style={{ width: size, height: size, borderRadius: '9999px', objectFit: 'cover' }} />
          </Html>
        }>
          <Environment preset="sunset" background={false} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
          <OrbitControls makeDefault />
          <Grid args={[10, 10]} />
          <Model url={finalGlbUrl} cameraDistance={cameraDistance} fov={fov} fallbackImageUrl={fallbackImageUrl} size={size} />
          <SceneCleanup />
        </Suspense>
      </Canvas>
    </div>
  );
};