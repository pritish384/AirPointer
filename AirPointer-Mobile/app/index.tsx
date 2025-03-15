import { useState, useEffect } from "react";
import {
  Text,
  View,
  Image,
  Pressable,
  Modal,
  StyleSheet,
  TextInput,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Camera, CameraView } from "expo-camera";
import { useRouter } from "expo-router";

export default function Index() {
  const [modalVisible, setModalVisible] = useState(false);
  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const [ipdetailsmodal, setIPDetailsModal] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [ip, setIP] = useState<string>("");
  const [port, setPort] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status === "granted") {
        setHasPermission(true);
      } else {
        setHasPermission(false);
      }
    };
    getCameraPermissions();
  }, []);

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    setCameraModalVisible(false);
    setModalVisible(false);
    try {
      const { ip, port, password } = JSON.parse(data);
      router.replace(`/control?ip=${ip}&port=${port}&password=${password}`);
    } catch {
      alert("Invalid QR Code Data. Please try again.");
    }
  };

  const handleIPDetailsSubmit = () => {
    setIPDetailsModal(false);
    setModalVisible(false);
    // redirect
    console.log("IP Details:", { ip, port, password });
    router.replace(`/control?ip=${ip}&port=${port}&password=${password}`);
  };

  if (cameraModalVisible) {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={cameraModalVisible}
        onRequestClose={() => setCameraModalVisible(false)}
      >
        {/* Background Overlay */}
        <View style={styles.overlay}>
          <StatusBar backgroundColor="rgba(1, 46, 225, 0.5)" />
          <Text style={styles.modalOverlayTitle}>Scan QR Code to connect</Text>
        </View>

        {/* Modal Content */}
        <View style={styles.modalContainer}>
          {/* Back Button */}
          <Pressable
            style={styles.backButton}
            onPress={() => setCameraModalVisible(false)}
          >
            <Ionicons name="chevron-back-outline" size={32} color="black" />
          </Pressable>

          {/* Camera Frame */}
          {hasPermission ? (
            <>
              <View style={styles.cameraContainer}>
                <CameraView
                  onBarcodeScanned={handleBarcodeScanned}
                  barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                  style={styles.camera}
                />
              </View>
              <Text style={[styles.helperText, { marginTop: 20 }]}>
                Make sure you're on the same network.
              </Text>
            </>
          ) : (
            <>
              <View style={styles.alertContainer}>
                <Ionicons
                  name="alert-circle"
                  size={32}
                  color="#c62828"
                  style={styles.alertIcon}
                />
                <Text style={styles.alertText}>
                  Camera access is required to scan QR codes. Please enable it
                  in your device settings.
                </Text>
              </View>
              <View style={{ marginTop: 5 }}>
                <Pressable
                  style={({ pressed }) => [
                    {
                      backgroundColor: pressed ? "#f5f7fb" : "white",
                      padding: 10,
                      borderRadius: 5,
                      width: "100%",
                      alignItems: "center",
                      alignSelf: "center",
                    },
                  ]}
                  android_ripple={{ color: "white" }}
                  onPress={() => {
                    setCameraModalVisible(false);
                    setIPDetailsModal(true);
                  }}
                >
                  <Text style={{ color: "#007bff", fontWeight: "bold" }}>
                    Having Trouble? Enter IP Manually
                  </Text>
                </Pressable>
              </View>
            </>
          )}

          {/* Helper Text */}
        </View>
      </Modal>
    );
  }

  if (ipdetailsmodal) {
    return (
      <Modal
        animationType="fade"
        transparent={true} // Make it transparent
        visible={ipdetailsmodal}
        onRequestClose={() => setIPDetailsModal(false)}
      >
        {/* Background Overlay */}
        <View style={styles.overlay}>
          <StatusBar backgroundColor="rgba(1, 46, 225, 0.5)" />
          <Text style={styles.modalOverlayTitle}>
            Enter your IP Details manually to connect
          </Text>
        </View>

        {/* Modal Content */}
        <View style={styles.modalContainer}>
          {/* Back Button */}
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              { opacity: pressed ? 0.5 : 1 },
            ]}
            onPress={() => setIPDetailsModal(false)}
          >
            <Text style={{ color: "black" }}>
              <Ionicons name="chevron-back-outline" size={32} />
            </Text>
          </Pressable>

          {/* Content */}
          <View style={styles.modalContent}>
            {/* Add input field for IP Address here */}
            {/* form helper text */}
            <Text
              style={{
                color: "#6c757d",
                fontSize: 16,
                marginTop: 20,
                alignSelf: "flex-start",
              }}
            >
              Enter your IP Address
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: "#6c757d",
                borderRadius: 5,
                padding: 10,
                width: "100%",
                marginTop: 10,
              }}
              placeholder="eg. 192.168.0.1"
              inputMode="numeric"
              keyboardType="numeric"
              selectionColor={"#007bff"}
              onChangeText={(text) => setIP(text)}
            />
            <Text
              style={{
                color: "#6c757d",
                fontSize: 16,
                marginTop: 20,
                alignSelf: "flex-start",
              }}
            >
              Enter your Port Number
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: "#6c757d",
                borderRadius: 5,
                padding: 10,
                width: "100%",
                marginTop: 10,
              }}
              placeholder="eg. 8080"
              keyboardType="numeric"
              inputMode="numeric"
              selectionColor={"#007bff"}
              onChangeText={(text) => setPort(text)}
            />
            <Text
              style={{
                color: "#6c757d",
                fontSize: 16,
                marginTop: 20,
                alignSelf: "flex-start",
              }}
            >
              Enter your Secret Password
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: "#6c757d",
                borderRadius: 5,
                padding: 10,
                width: "100%",
                marginTop: 10,
              }}
              placeholder="eg. Admin@123"
              selectionColor={"#007bff"}
              secureTextEntry
              onChangeText={(text) => setPassword(text)}
            />
            <Pressable
              style={{
                backgroundColor: "#007bff",
                padding: 10,
                borderRadius: 5,
                width: "100%",
                alignItems: "center",
                marginTop: 20,
              }}
              android_ripple={{ color: "white" }}
              onPress={() => handleIPDetailsSubmit()}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Connect</Text>
            </Pressable>
            <Text
              style={{
                color: "#6c757d",
                fontSize: 16,
                marginTop: 20,
                alignSelf: "center",
              }}
            >
              Make sure you're on the same network.
            </Text>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f7fb",
        padding: 20,
      }}
    >
      <Image
        source={require("../assets/images/icon.png")}
        style={{ width: 120, height: 120 }}
      />
      <Text style={{ fontSize: 24, fontWeight: "bold", marginTop: 5 }}>
        Welcome to Air Pointer
      </Text>
      <Text
        style={{
          fontSize: 16,
          color: "#666",
          marginTop: 10,
          textAlign: "center",
        }}
      >
        Control your laptop cursor effortlessly using your phone’s motion
        sensors.
      </Text>
      <View style={{ marginTop: 20 }}>
        <Pressable
          style={{
            backgroundColor: "#007bff",
            padding: 10,
            borderRadius: 5,
            width: 200,
            alignItems: "center",
          }}
          android_ripple={{ color: "white" }}
          onPress={() => setModalVisible(true)}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Get Started</Text>
        </Pressable>

        <Modal
          animationType="fade"
          transparent={false}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.5)",
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                padding: 20,
                borderRadius: 10,
                elevation: 5,
                width: "80%",
              }}
            >
              <Image
                source={require("../assets/images/qr-code-scan.png")}
                style={{
                  width: 100,
                  height: 100,
                  alignSelf: "center",
                  marginTop: 10,
                }}
              />
              <Text
                style={{
                  marginTop: 10,
                  alignSelf: "center",
                  fontWeight: "bold",
                }}
              >
                Get Ready To Scan Desktop QR Code
              </Text>
              <Pressable
                style={({ pressed }) => [
                  {
                    position: "absolute",
                    top: -6,
                    right: 5,

                    borderRadius: 5,
                    marginTop: 15,
                    opacity: pressed ? 0.1 : 1,
                  },
                ]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: "white", textAlign: "center" }}>
                  <Ionicons name="close-circle-outline" size={32} color="red" />
                </Text>
              </Pressable>

              <View style={{ marginTop: 20 }}>
                <Pressable
                  style={{
                    backgroundColor: "#007bff",
                    padding: 10,
                    borderRadius: 5,
                    width: "100%",
                    alignItems: "center",
                    alignSelf: "center",
                  }}
                  android_ripple={{ color: "white" }}
                  onPress={() => setCameraModalVisible(true)}
                >
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>
                    Scan QR Code
                  </Text>
                </Pressable>
              </View>
              <View style={{ marginTop: 5 }}>
                <Pressable
                  style={({ pressed }) => [
                    {
                      backgroundColor: pressed ? "#f5f7fb" : "white",
                      padding: 10,
                      borderRadius: 5,
                      width: "100%",
                      alignItems: "center",
                      alignSelf: "center",
                    },
                  ]}
                  android_ripple={{ color: "white" }}
                  onPress={() => setIPDetailsModal(true)}
                >
                  <Text style={{ color: "#007bff", fontWeight: "bold" }}>
                    Having Trouble? Enter IP Manually
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(1, 46, 225, 0.5)", // Dim background
    alignItems: "center",
  },
  modalContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: "80%", // Half-screen modal
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
    borderRadius: 5,
    padding: 5,
  },
  modalContent: {
    marginTop: 50,
    width: "100%",
    alignItems: "center",
  },
  modalOverlayTitle: {
    color: "white",
    fontSize: 18,
    marginTop: 60,
  },
  title: {
    color: "white",
    fontSize: 18,
  },
  cameraContainer: {
    width: 250,
    height: 250,
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 30,
    borderColor: "black",
    borderWidth: 2,
    elevation: 5,
  },
  camera: {
    flex: 1,
  },
  input: {
    width: "90%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginTop: 20,
    textAlign: "center",
  },
  helperText: {
    color: "#6c757d",
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
  },
  alertContainer: {
    backgroundColor: "#ffebee",
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 50,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, // For Android shadow
  },
  alertIcon: {
    marginRight: 12,
  },
  alertText: {
    color: "#c62828",
    fontSize: 15,
    flex: 1, // Allows text to wrap properly
  },
});
