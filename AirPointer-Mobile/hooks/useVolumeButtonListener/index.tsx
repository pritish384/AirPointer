import { useEffect, useRef } from "react";
import { Vibration } from "react-native";
import SystemSetting from "react-native-system-setting";

interface VolumeData {
  value: number;
}

interface Command {
  cmd: "KEYBOARD_ENTER" | "MOUSE_LEFT_CLICK" | "KEYBOARD_BACKSPACE";
}

type SendCommandFunction = (command: string) => void;
type TapType = "up" | "down";

const useVolumeButtonListener = (sendCommand: SendCommandFunction) => {
  const lastVolume = useRef<number>(0);
  const lastTapTimeUp = useRef<number>(0);
  const lastTapTimeDown = useRef<number>(0);
  const tapTimeoutUp = useRef<NodeJS.Timeout | null>(null);
  const tapTimeoutDown = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Store initial volume level
    SystemSetting.getVolume().then((volume: number) => {
      lastVolume.current = volume;
    });

    const volumeListener = SystemSetting.addVolumeListener(
      (data: VolumeData) => {
        if (data.value > lastVolume.current) {
          // Volume Up Pressed
          handleTap("up");
        } else if (data.value < lastVolume.current) {
          // Volume Down Pressed
          handleTap("down");
        }

        Vibration.vibrate(100);
        SystemSetting.setVolume(lastVolume.current); // Restore volume
      },
    );

    const handleTap = (type: TapType) => {
      const currentTime = Date.now();
      if (type === "up") {
        const timeDiff = currentTime - lastTapTimeUp.current;
        if (timeDiff < 300) {
          if (tapTimeoutUp.current) clearTimeout(tapTimeoutUp.current);
          sendCommand(JSON.stringify({ cmd: "MOUSE_LEFT_CLICK" } as Command)); // Double tap UP
        } else {
          sendCommand(JSON.stringify({ cmd: "KEYBOARD_ENTER" } as Command)); // Single tap UP
          tapTimeoutUp.current = setTimeout(() => {}, 300);
        }
        lastTapTimeUp.current = currentTime;
      } else if (type === "down") {
        const timeDiff = currentTime - lastTapTimeDown.current;
        if (timeDiff < 300) {
          if (tapTimeoutDown.current) clearTimeout(tapTimeoutDown.current);
          sendCommand(JSON.stringify({ cmd: "KEYBOARD_BACKSPACE" } as Command)); // Double tap DOWN (if needed)
        } else {
          tapTimeoutDown.current = setTimeout(() => {
            sendCommand(
              JSON.stringify({ cmd: "KEYBOARD_BACKSPACE" } as Command),
            ); // Single tap DOWN
          }, 300);
        }
        lastTapTimeDown.current = currentTime;
      }
    };

    return () => {
      if (volumeListener) {
        SystemSetting.removeVolumeListener(volumeListener);
      }
    };
  }, [sendCommand]);

  return null;
};

export default useVolumeButtonListener;
