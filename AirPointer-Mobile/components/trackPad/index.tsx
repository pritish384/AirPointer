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
  onTap?: () => void; // ✅ Added tap event
  style?: ViewStyle;
  sensitivity?: number;
}

const Trackpad = ({
  onMove,
  onStart,
  onEnd,
  onTap,
  style,
  sensitivity = 1,
}: TrackpadProps) => {
  const previousDx = useRef(0);
  const previousDy = useRef(0);
  const startime = useRef(0); // ✅ Added startime
  const sensitivityRef = useRef(sensitivity);
  const onMoveRef = useRef(onMove); // Store latest onMove function
  const onTapRef = useRef(onTap); // ✅ Added tap event

  // Update refs on re-render
  sensitivityRef.current = sensitivity;
  onMoveRef.current = onMove;
  onTapRef.current = onTap; // ✅ Added tap event

  const handleMove = (dx: number, dy: number) => {
    const deltaX = (dx - previousDx.current) * sensitivityRef.current;
    const deltaY = (dy - previousDy.current) * sensitivityRef.current;
    previousDx.current = dx;
    previousDy.current = dy;

    // Use the latest function reference
    onMoveRef.current?.({ deltaX, deltaY });

    console.log({ deltaX, deltaY, sensitivity: sensitivityRef.current });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startime.current = Date.now(); // ✅ Added start
        previousDx.current = 0;
        previousDy.current = 0;
        Vibration.vibrate(100);
        onStart?.();
      },
      onPanResponderMove: (_, gestureState) => {
        handleMove(gestureState.dx, gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        const endtime = Date.now(); // ✅ Added end
        const movement = Math.sqrt(gestureState.dx ** 2 + gestureState.dy ** 2); // Distance moved
        if (endtime - startime.current < 200 && movement < 10) {
          // ✅ Added tap event
          console.log("Tapped");
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
