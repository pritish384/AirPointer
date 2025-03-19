import React, { useRef } from "react";
import {
  View,
  PanResponder,
  StyleSheet,
  ViewStyle,
  Vibration,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

interface TrackpadProps {
  onMove?: (movement: { deltaX: number; deltaY: number }) => void;
  onStart?: () => void;
  onEnd?: () => void;
  onTap?: () => void;
  style?: ViewStyle;
  sensitivity?: number;
  smoothingFactor?: number; // ✅ Added smoothing factor
}

const Trackpad = ({
  onMove,
  onStart,
  onEnd,
  onTap,
  style,
  sensitivity = 1,
  smoothingFactor = 0.2, // ✅ Default smoothing
}: TrackpadProps) => {
  const previousDx = useRef(0);
  const previousDy = useRef(0);
  const smoothedDx = useRef(0);
  const smoothedDy = useRef(0);
  const startTime = useRef(0);
  const sensitivityRef = useRef(sensitivity);
  const smoothingRef = useRef(smoothingFactor);
  const onMoveRef = useRef(onMove);
  const onTapRef = useRef(onTap);

  // Update refs on re-render
  sensitivityRef.current = sensitivity;
  smoothingRef.current = smoothingFactor;
  onMoveRef.current = onMove;
  onTapRef.current = onTap;

  const handleMove = (dx: number, dy: number) => {
    const rawDeltaX = (dx - previousDx.current) * sensitivityRef.current;
    const rawDeltaY = (dy - previousDy.current) * sensitivityRef.current;

    // Apply exponential smoothing
    smoothedDx.current =
      smoothingRef.current * rawDeltaX +
      (1 - smoothingRef.current) * smoothedDx.current;
    smoothedDy.current =
      smoothingRef.current * rawDeltaY +
      (1 - smoothingRef.current) * smoothedDy.current;

    previousDx.current = dx;
    previousDy.current = dy;

    onMoveRef.current?.({
      deltaX: smoothedDx.current,
      deltaY: smoothedDy.current,
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startTime.current = Date.now();
        previousDx.current = 0;
        previousDy.current = 0;
        smoothedDx.current = 0;
        smoothedDy.current = 0;
        Vibration.vibrate(50);
        onStart?.();
      },
      onPanResponderMove: (_, gestureState) => {
        handleMove(gestureState.dx, gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        const endTime = Date.now();
        const movement = Math.sqrt(gestureState.dx ** 2 + gestureState.dy ** 2);
        if (endTime - startTime.current < 200 && movement < 10) {
          Vibration.vibrate(100);
          onTapRef.current?.();
        } else {
          onEnd?.();
        }
      },
      onPanResponderTerminate: () => onEnd?.(),
    }),
  ).current;

  return (
    <View style={[styles.container, style]}>
      <Ionicons
        name="chevron-up-outline"
        size={40}
        style={styles.topArrow}
        color="rgba(0,0,0,0.5)"
      />
      <Ionicons
        name="chevron-down-outline"
        size={40}
        style={styles.bottomArrow}
        color="rgba(0,0,0,0.5)"
      />
      <Ionicons
        name="chevron-back-outline"
        size={40}
        style={styles.leftArrow}
        color="rgba(0,0,0,0.5)"
      />
      <Ionicons
        name="chevron-forward-outline"
        size={40}
        style={styles.rightArrow}
        color="rgba(0,0,0,0.5)"
      />
      <View style={styles.trackpad} {...panResponder.panHandlers} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  trackpad: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(240,240,240,0.9)",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.2)",
  },
  topArrow: {
    position: "absolute",
    top: 10,
    alignSelf: "center",
    zIndex: 1,
  },
  bottomArrow: {
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
    zIndex: 1,
  },
  leftArrow: {
    position: "absolute",
    left: 10,
    top: "50%",
    transform: [{ translateY: -20 }],
    zIndex: 1,
  },
  rightArrow: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -20 }],
    zIndex: 1,
  },
});

export default Trackpad;
