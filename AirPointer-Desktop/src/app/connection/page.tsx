"use client"; // This is a client component 👈🏽

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { IoMdArrowBack } from "react-icons/io";

export default function Connect() {
  const [serverInfo, setServerInfo] = useState<{
    ip: string;
    port: number;
    password: string;
  } | null>(null);
  const [wsstatus, setWsStatus] = useState("Not Connected");
  const [deviceModel, setDeviceModel] = useState("Unknown Device");
  const [controlOn, setControlOn] = useState(false);
  const [airMouseOn, setAirMouseOn] = useState(false);

  function toTitleCase(text: string) {
    return text
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  useEffect(() => {
    if (typeof window !== "undefined" && window.electronAPI) {
      window.electronAPI.invoke("get-server-info").then((info) => {
        console.log("Received server info:", info);
        setServerInfo(info);

        window.electronAPI.on("websocket-status", (data) => {
          setWsStatus(data.status);
          console.log("Websocket connected:", data);
        });

        window.electronAPI.on("device-info", (data) => {
          setDeviceModel(data.deviceModel);
          console.log("Device info received:", data);
        });

        window.electronAPI.on("control-status", (data) => {
          setControlOn(data.controlOn);
          console.log("Control status received:", data);
        });

        window.electronAPI.on("airmouse-status", (data) => {
          setAirMouseOn(data.airMouseOn);
          console.log("AirMouse status received:", data);
        });
      });
    }
  }, []);

  if (wsstatus === "Authenticated") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="bg-white p-8 rounded-xl border-black border-2 shadow-lg text-black w-140">
          {/* Title */}
          <div className="flex flex-col items-center mb-6">
            <h1 className="text-2xl font-bold">AirPointer Dashboard</h1>
          </div>

          {/* Centered Dashboard Info Section */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-[400px] space-y-4">
              {/* Device Name */}
              <div className="grid grid-cols-2 items-center">
                <p className="text-lg text-gray-800 font-semibold">
                  Device Name:
                </p>
                <p className="text-lg text-gray-800">
                  {toTitleCase(deviceModel)}
                </p>
              </div>

              {/* Connection Status */}
              <div className="grid grid-cols-2 items-center">
                <p className="text-lg text-gray-800 font-semibold">
                  Connection Status:
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-green-500 rounded-full flex-shrink-0 border-1" />
                  <p className="text-lg text-gray-800">{wsstatus}</p>
                </div>
              </div>

              {/* Manual Control */}
              <div className="grid grid-cols-2 items-center">
                <p className="text-lg text-gray-800 font-semibold">
                  Manual Control:
                </p>
                <div className="flex items-center gap-2">
                  {controlOn ? (
                    <div className="h-4 w-4 bg-green-500 rounded-full flex-shrink-0 border-1" />
                  ) : (
                    <div className="h-4 w-4 bg-red-500 rounded-full flex-shrink-0 border-1" />
                  )}
                  <p className="text-lg text-gray-800">
                    {controlOn ? "ON" : "OFF"}
                  </p>
                </div>
              </div>

              {/* Air Mouse */}
              <div className="grid grid-cols-2 items-center">
                <p className="text-lg text-gray-800 font-semibold">
                  Air Mouse:
                </p>
                <div className="flex items-center gap-2">
                  {airMouseOn ? (
                    <div className="h-4 w-4 bg-green-500 rounded-full flex-shrink-0 border-1" />
                  ) : (
                    <div className="h-4 w-4 bg-red-500 rounded-full flex-shrink-0 border-1" />
                  )}
                  <p className="text-lg text-gray-800">
                    {airMouseOn ? "ON" : "OFF"}
                  </p>

                  {/* disconnect button */}
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-8">
              <button
                onClick={() => {
                  window.electronAPI.invoke("disconnect-client");
                }}
                className="bg-red-500 text-white p-2 rounded-lg border-2  border-black w-40 hover:bg-red-600"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="bg-white p-8 rounded-xl border-black border-2 shadow-lg text-black w-140 items-start">
        {/* Title */}
        <div className="flex flex-col items-start">
          {/* back button */}
          <div className="absolute top-4 left-4 flex flex-row items-center gap-4 rounded-full p-2 hover:bg-gray-300">
            <IoMdArrowBack
              className="text-2xl cursor-pointer"
              onClick={() => window.history.back()}
            />
          </div>
          <h1 className="text-2xl font-bold mb-4 ">
            Connect to AirPointer App
          </h1>
          <p className="text-sm text-gray-800">
            Easily link your device with AirPointer using the provided IP
            address, port, and QR code. Ensure both devices are on the same
            network for a seamless connection.
          </p>
        </div>

        <h2 className="text-lg font-semibold mt-4">Scan the QR Code</h2>
        <p className="text-sm text-gray-800">
          Scan the QR code below using the AirPointer app to connect your device
          or manually enter the IP address and port.
        </p>

        <div className="flex flex-row p-3 space-between bg-gray-100 border-black border-2 rounded-xl mt-4">
          <div className="p-4 bg-white rounded-xl shadow-lg mr-4 flex items-center justify-center border-black border-2">
            <QRCodeSVG
              value={JSON.stringify(serverInfo)}
              size={150}
              level="H"
              boostLevel
              bgColor="white"
              fgColor="black"
              imageSettings={{
                src: "/icon.png",
                height: 40,
                width: 40,
                excavate: true,
              }}
            />
          </div>

          <div className="flex flex-col">
            <h2 className="text-md font-semibold ml-4">
              Can&apos;t Scan QR Code?
            </h2>
            <p className="text-sm text-gray-800 ml-4">
              Enter the following details manually in the AirPointer app:
            </p>
            <p className="text-sm text-gray-800 ml-4 mt-4">
              <span className="font-semibold">IP:</span> {serverInfo?.ip}
            </p>
            <p className="text-sm text-gray-800 ml-4">
              <span className="font-semibold">Port:</span> {serverInfo?.port}
            </p>
            <p className="text-sm text-gray-800 ml-4">
              <span className="font-semibold">Password:</span>{" "}
              {serverInfo?.password}
            </p>
            <p className="text-sm text-gray-800 ml-4 mt-4">
              <span className="font-semibold">Status:</span> {wsstatus}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
