import { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Vibration,
  ScrollView,
} from "react-native";
import SystemSetting from "react-native-system-setting";
import { router, useLocalSearchParams } from "expo-router";
import CustomSwitch from "../components/customSwitch";
import Trackpad from "@/components/trackPad";
import * as Device from "expo-device";
import GyroTrackpad from "@/components/gyroTrackPad";
import CustomSlider from "@/components/customSlider";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function Control() {
  const { ip, port, password } = useLocalSearchParams();
  const [status, setStatus] = useState("Connecting...");
  const [statusColor, setStatusColor] = useState("#f59e0b"); // Default Orange
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [controlOn, setControlOn] = useState(false);
  const [airMouseOn, setAirMouseOn] = useState(false);
  const [manualPosition, setManualPosition] = useState({ x: 0, y: 0 });
  const [gyroPosition, setGyroPosition] = useState({ x: 0, y: 0 });
  const [deviceModel, setDeviceModel] = useState("");
  const [sensitivity, setSensitivity] = useState(20);
  const [tap, setTap] = useState(false);
  const lastVolume = useRef(0);
  const airMouseOnRef = useRef(airMouseOn);
  const controlOnRef = useRef(controlOn);

  useEffect(() => {
    if (Device.brand && Device.modelName) {
      setDeviceModel(`${Device.brand} ${Device.modelName}`);
    } else {
      setDeviceModel("Unknown Device");
    }
  }, []);

  useEffect(() => {
    if (ip && port && password && deviceModel) {
      console.log("Connecting to WebSocket:", { ip, port });

      const wsAddress = `ws://${ip}:${port}`;
      const newSocket = new WebSocket(wsAddress);

      setSocket(newSocket);

      newSocket.onopen = () => {
        console.log("✅ WebSocket Connected:", wsAddress);
        newSocket.send(String(password));
        setStatus("Connected");
        setStatusColor("#10b981"); // Green
      };

      newSocket.onmessage = (event) => {
        console.log("📩 Message from Server:", event.data);
        if (event.data === "AUTH_SUCCESS") {
          newSocket.send(JSON.stringify({ cmd: "DEVICE_INFO", deviceModel }));
          newSocket.send(
            JSON.stringify({
              cmd: "CONTROL_STATUS",
              controlOn: controlOnRef.current,
            }),
          );
          newSocket.send(
            JSON.stringify({
              cmd: "AIRMOUSE_STATUS",
              airMouseOn: airMouseOnRef.current,
            }),
          );
          console.log("🔓 Authenticated Successfully");
        } else if (event.data === "AUTH_FAILED") {
          console.error("🔒 Authentication Failed");
          setStatus("Authentication Failed");
          setStatusColor("#ef4444"); // Red
        }
      };

      newSocket.onclose = (event) => {
        // Add event parameter
        console.log(
          "🔌 WebSocket Closed. Code:",
          event.code,
          "Reason:",
          event.reason,
        );
        setStatus(`Disconnected`);
        setStatusColor("#dc2626");
      };

      newSocket.onerror = (error) => {
        // Ignore WebSocket errors if they come from a 1005 or 1006 closure
        if (
          newSocket.readyState === WebSocket.CLOSING ||
          newSocket.readyState === WebSocket.CLOSED
        ) {
          newSocket.close();
          return;
        }
        setStatus("Error");
        setStatusColor("#ef4444"); // Red
      };

      return () => {
        newSocket.close();
      };
    }
  }, [ip, port, password, deviceModel]);

  const sendCommand = useCallback(
    (cmd: string) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(cmd);
      }
    },
    [socket],
  );

  const handleTapWrapper = useCallback(() => {
    if (controlOn) {
      handleTap();
    }
  }, [controlOn]);

  // ✅ Listen for Volume Button Press
  useEffect(() => {
    SystemSetting.getVolume().then((volume) => {
      lastVolume.current = volume; // Store initial volume level
    });

    const volumeListener = SystemSetting.addVolumeListener((data) => {
      if (data.value !== lastVolume.current) {
        setTap(true); // Trigger tap event
        Vibration.vibrate(100);
        SystemSetting.setVolume(lastVolume.current); // Prevent actual volume change
      }
    });

    return () => {
      SystemSetting.removeVolumeListener(volumeListener);
    };
  }, []);

  useEffect(() => {
    sendCommand(
      JSON.stringify({ cmd: "CONTROL_STATUS", controlOn: controlOn }),
    );
  }, [controlOn, sendCommand]);

  useEffect(() => {
    sendCommand(
      JSON.stringify({ cmd: "AIRMOUSE_STATUS", airMouseOn: airMouseOn }),
    );
  }, [airMouseOn, sendCommand]);

  useEffect(() => {
    if (controlOn) {
      sendCommand(
        JSON.stringify({
          cmd: "MOUSE_MOVE",
          x: manualPosition.x,
          y: manualPosition.y,
        }),
      );
    }

    if (airMouseOn) {
      sendCommand(
        JSON.stringify({
          cmd: "MOUSE_MOVE",
          x: gyroPosition.x,
          y: gyroPosition.y,
        }),
      );
    }
  }, [gyroPosition, manualPosition, controlOn, airMouseOn, sendCommand]);

  const handleManualMove = (movement: { deltaX: number; deltaY: number }) => {
    setManualPosition({ x: movement.deltaX, y: movement.deltaY });
  };

  const handleGyroMove = (movement: { deltaX: number; deltaY: number }) => {
    setGyroPosition({ x: movement.deltaX, y: movement.deltaY });
  };

  useEffect(() => {
    if (tap) {
      sendCommand(JSON.stringify({ cmd: "MOUSE_LEFT_CLICK" }));
      setTap(false);
    }
  }, [tap, sendCommand]);

  const handleTap = () => {
    console.log("Tapped");
    setTap(true);
  };

  const handleDisconnect = () => {
    console.log("Disconnecting WebSocket");
    if (socket) {
      socket.close();
    }
    router.replace("/"); // Navigate back to Home
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.elementContainer}>
          {/* WebSocket Status */}
          <View style={styles.cardContainer}>
            <View style={styles.rowContainer}>
              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: statusColor },
                ]}
              />
              <Text style={styles.statusText}>{status}</Text>
            </View>
          </View>

          {/* Control Toggle */}
          <View style={styles.cardContainer}>
            <View
              style={[styles.rowContainer, { justifyContent: "space-between" }]}
            >
              <Text style={styles.label}>Manual Control</Text>
              <CustomSwitch
                value={controlOn}
                onValueChange={(value) => setControlOn(value)}
              />
            </View>
            <View
              style={[
                styles.rowContainer,
                { justifyContent: "space-between", marginTop: 15 },
              ]}
            >
              <Text style={styles.label}>Air Mouse</Text>
              <CustomSwitch
                value={airMouseOn}
                onValueChange={(value) => setAirMouseOn(value)}
              />
            </View>

            <View
              style={[
                styles.rowContainer,
                {
                  justifyContent: "space-between",
                  alignItems: "center",
                },
              ]}
            >
              <MaterialCommunityIcons name="tortoise" size={24} color="gray" />
              <CustomSlider
                initialValue={sensitivity}
                min={0}
                max={100}
                step={0.01}
                onChange={(value) => setSensitivity(value)}
              />
              <MaterialCommunityIcons name="rabbit" size={24} color="gray" />
            </View>
            <Pressable
              onPress={() =>
                sendCommand(JSON.stringify({ cmd: "RECENTER_MOUSE" }))
              }
              android_ripple={{ color: "#ffffff" }}
              style={styles.recenterButton}
            >
              <Text style={styles.buttonLabel}>Recenter</Text>
            </Pressable>
          </View>
          {/* Control Buttons */}
          <View style={styles.cardContainer}>
            <Trackpad
              onMove={controlOn ? handleManualMove : undefined}
              onTap={handleTapWrapper}
              sensitivity={sensitivity}
            />
            <GyroTrackpad
              onMove={airMouseOn ? handleGyroMove : undefined}
              sensitivity={sensitivity} // Adjust sensitivity if needed
            />
          </View>

          {/* Disconnect Button */}
          <View style={styles.cardContainer}>
            <Pressable
              onPress={() => handleDisconnect()}
              android_ripple={{ color: "#ffffff" }}
              style={styles.disconnectButton}
            >
              <Text style={styles.buttonLabel}>Disconnect</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#e5e5e5", // Light gray background
    padding: 20,
  },
  elementContainer: {
    width: "100%",
    marginTop: 50,
  },
  cardContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000000",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },

  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
    borderColor: "#000000",
    borderWidth: 1,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#374151",
  },
  controlContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  label: {
    fontSize: 20,
    color: "#374151",
  },

  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "center",
  },
  controlButton: {
    backgroundColor: "#e5e7eb",
    padding: 20,
    borderRadius: 12,
    margin: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    fontSize: 24,
    color: "#374151",
  },
  recenterButton: {
    backgroundColor: "#012ee180",
    fontWeight: "bold",
    width: "100%",
    alignItems: "center",

    padding: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#000000",
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  disconnectButton: {
    backgroundColor: "#f87171",
    fontWeight: "bold",
    width: "100%",
    alignItems: "center",
    padding: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#000000",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  buttonLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  spacer: {
    width: 50,
  },

  trackContainer: {
    width: 300,
    height: 20, // Makes the track thicker
    backgroundColor: "#ddd", // Track background
    borderRadius: 10,
    justifyContent: "center",
    overflow: "hidden",
  },
  slider: {
    width: "100%",
    height: 40, // Ensures touchability
    marginTop: -10, // Aligns thumb properly
  },
});
