import React, { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { Slider } from "@miblanchard/react-native-slider";

interface CustomSliderProps {
  initialValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
}

const CustomSliderComponent: React.FC<CustomSliderProps> = ({
  initialValue = 20,
  min = 0,
  max = 100,
  step = 1,
  onChange = () => {},
}) => {
  const [value, setValue] = useState([initialValue]);

  const handleValueChange = (newValue: number[]) => {
    setValue(newValue);
    onChange(newValue[0]);
  };

  const thumbAbove = () => {
    return (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          transform: [{ translateX: -8 }, { translateY: 8 }],
        }}
      >
        <Text style={{ color: "#000" }}>{value[0].toFixed(2)}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Slider
        value={value}
        onValueChange={handleValueChange}
        minimumValue={min}
        maximumValue={max}
        step={step}
        animateTransitions={true}
        thumbTintColor="#ffffff"
        maximumTrackTintColor="#ffb3b3"
        minimumTrackTintColor="#1a73e8"
        renderAboveThumbComponent={thumbAbove}
        thumbStyle={{
          borderWidth: 1,
          borderColor: "#1a73e8",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.23,
          shadowRadius: 2.62,
          elevation: 4,
        }}
        trackStyle={{ height: 5, borderRadius: 5 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
});

export default CustomSliderComponent;
