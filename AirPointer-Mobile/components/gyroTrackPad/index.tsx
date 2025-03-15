import React, { useEffect, useRef } from "react";
import { View } from "react-native";
import { Gyroscope } from "expo-sensors";

interface GyroTrackpadProps {
  onMove?: (movement: { deltaX: number; deltaY: number }) => void;
  sensitivity?: number;
  deadZone?: number;
  smoothingFactor?: number;
}

const GyroTrackpad = ({
  onMove,
  sensitivity = 10,
  deadZone = 0.02,
  smoothingFactor = 0.2,
}: GyroTrackpadProps) => {
  const smoothedX = useRef(0);
  const smoothedZ = useRef(0);
  const lastTime = useRef(Date.now());

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    const initGyro = async () => {
      try {
        const isAvailable = await Gyroscope.isAvailableAsync();
        if (!isAvailable) {
          console.warn("Gyroscope not available on this device");
          return;
        }

        subscription = Gyroscope.addListener(({ x, y, z }) => {
          const now = Date.now();
          const deltaTime = (now - lastTime.current) / 1000;

          // Apply smoothing
          const newSmoothedX =
            x * smoothingFactor + smoothedX.current * (1 - smoothingFactor);
          const newSmoothedZ =
            z * smoothingFactor + smoothedZ.current * (1 - smoothingFactor);

          // Apply dead zone
          const applyDeadZone = (value: number) =>
            Math.abs(value) > deadZone ? value : 0;

          let deltaX =
            applyDeadZone(newSmoothedZ) * -sensitivity * deltaTime * 100; // Rotation-based movement
          let deltaY =
            applyDeadZone(newSmoothedX) * -sensitivity * deltaTime * 100; // Forward-back tilt

          onMove?.({ deltaX, deltaY });

          // Update refs
          smoothedX.current = newSmoothedX;
          smoothedZ.current = newSmoothedZ;
          lastTime.current = now;
        });

        Gyroscope.setUpdateInterval(16);
      } catch (error) {
        console.error("Failed to initialize gyroscope:", error);
      }
    };

    initGyro();

    return () => {
      subscription?.remove();
    };
  }, [onMove, sensitivity, deadZone, smoothingFactor]);

  return <View />;
};

export default GyroTrackpad;
