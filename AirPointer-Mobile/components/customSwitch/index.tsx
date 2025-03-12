import React from "react";
import { Switch } from "react-native-switch";
import { View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

interface CustomSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  activeText?: string;
  inActiveText?: string;
  circleSize?: number;
  barHeight?: number;
  backgroundActive?: string;
  backgroundInactive?: string;
  circleActiveColor?: string;
  circleInActiveColor?: string;
}

const CircleIcon = ({ value }: { value: boolean }) =>
  value ? (
    <View style={{ justifyContent: "center", alignItems: "center" }}>
      <Ionicons name="flash" color="#7356FF" />
    </View>
  ) : (
    <View style={{ justifyContent: "center", alignItems: "center" }}>
      <Ionicons name="flash-off" color="#cf6d61" />
    </View>
  );

const CustomSwitch = ({
  value,
  onValueChange,
  circleSize = 24,
  barHeight = 30,
  backgroundActive = "#7356FF",
  backgroundInactive = "#cf6d61",
  circleActiveColor = "#ffffff",
  circleInActiveColor = "#ffffff",
}: CustomSwitchProps) => {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      circleSize={circleSize}
      barHeight={barHeight}
      backgroundActive={backgroundActive}
      backgroundInactive={backgroundInactive}
      circleActiveColor={circleActiveColor}
      circleInActiveColor={circleInActiveColor}
      changeValueImmediately={true}
      renderInsideCircle={() => <CircleIcon value={value} />}
      switchLeftPx={2.5}
      switchRightPx={2.5}
      renderActiveText={false}
      renderInActiveText={false}
      switchWidthMultiplier={2}
      switchBorderRadius={30}
    />
  );
};

export default CustomSwitch;
