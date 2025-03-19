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
  const subscriptionRef = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    const initGyro = async () => {
      try {
        const isAvailable = await Gyroscope.isAvailableAsync();
        if (!isAvailable) {
          console.warn("Gyroscope not available on this device");
          return;
        }

        if (subscriptionRef.current) {
          subscriptionRef.current.remove();
        }

        subscriptionRef.current = Gyroscope.addListener(({ x, y, z }) => {
          const now = Date.now();
          const deltaTime = (now - lastTime.current) / 1000;

          const adjustedX = x - y * 0.1;
          const adjustedZ = z - y * 0.1;

          // Apply smoothing
          smoothedX.current =
            adjustedX * smoothingFactor +
            smoothedX.current * (1 - smoothingFactor);
          smoothedZ.current =
            adjustedZ * smoothingFactor +
            smoothedZ.current * (1 - smoothingFactor);

          // Apply dead zone
          const applyDeadZone = (value: number) =>
            Math.abs(value) > deadZone ? value : 0;

          let deltaX =
            applyDeadZone(smoothedZ.current) * -sensitivity * deltaTime * 100;
          let deltaY =
            applyDeadZone(smoothedX.current) * -sensitivity * deltaTime * 100;

          onMove?.({ deltaX, deltaY });

          lastTime.current = now;
        });

        Gyroscope.setUpdateInterval(16);
      } catch (error) {
        console.error("Failed to initialize gyroscope:", error);
      }
    };

    initGyro();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
    };
  }, [sensitivity, deadZone, smoothingFactor, onMove]);

  return <View />;
};

export default GyroTrackpad;
