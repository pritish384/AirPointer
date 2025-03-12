import React, { useEffect } from "react";
import { View } from "react-native";
import { Gyroscope } from "expo-sensors";

interface GyroTrackpadProps {
  onMove?: (movement: { deltaX: number; deltaY: number }) => void;
  sensitivity?: number;
}

const GyroTrackpad = ({ onMove, sensitivity = 10 }: GyroTrackpadProps) => {
  useEffect(() => {
    const subscription = Gyroscope.addListener(({ x, y }) => {
      const deltaX = x * sensitivity; // Adjust sensitivity
      const deltaY = y * sensitivity;
      onMove?.({ deltaX, deltaY });
    });

    Gyroscope.setUpdateInterval(0); // Update every 50ms for smooth movement

    return () => subscription.remove(); // Cleanup on unmount
  }, [onMove, sensitivity]);

  return <View />;
};

export default GyroTrackpad;
