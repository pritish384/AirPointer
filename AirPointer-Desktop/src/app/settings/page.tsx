"use client"; // This is a client component 👈🏽

import { useState, useEffect } from "react";
import { IoMdArrowBack } from "react-icons/io";

export default function Home() {
  const [port, setPort] = useState(5000);
  const [password, setPassword] = useState("admin@1234");
  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && window.electronAPI) {
      window.electronAPI.invoke("get-config").then((config) => {
        console.log("Received config:", config);
        setPort(config.port || 5000);
        setPassword(config.password || "admin@1234");
      });
    }
  }, []); // Runs only once when component mounts

  const handleSave = () => {
    if (typeof window !== "undefined" && window.electronAPI) {
      window.electronAPI.invoke("update-config", {
        newPort: port,
        newPassword: password,
      });
    }
    setDisabled(true);
  };

  const handleReset = () => {
    setPort(5000);
    setPassword("admin@1234");
    if (typeof window !== "undefined" && window.electronAPI) {
      window.electronAPI.invoke("update-config", {
        newPort: port,
        newPassword: password,
      });
    }
  };

  return (
    <div className="flex h-screen items-center justify-center text-black">
      <div className="bg-white p-8 rounded-xl border-black border-2 shadow-lg text-black w-140">
        <div className="absolute top-4 left-4 flex flex-row items-center gap-4 rounded-full p-2 hover:bg-gray-300">
          <IoMdArrowBack
            className="text-2xl cursor-pointer"
            onClick={() => window.history.back()}
          />
        </div>
        <h1 className="text-xl font-bold">Settings</h1>
        <br />
        <div className="grid grid-cols-2 items-center">
          <p className="text-md text-gray-800 font-semibold">Port</p>
          <input
            type="text"
            className={`border-2 border-gray-400 p-2 rounded-lg ${disabled ? "bg-gray-200 cursor-not-allowed" : "bg-white"}`}
            placeholder="Enter Port"
            disabled={disabled}
            value={port}
            onChange={(e) =>
              setPort(e.target.value === "" ? 0 : parseInt(e.target.value) || 0)
            }
          />
        </div>
        <br />
        <div className="grid grid-cols-2 items-center">
          <p className="text-md text-gray-800 font-semibold">Password</p>
          <input
            type="password"
            className={`border-2 border-gray-400 p-2 rounded-lg ${disabled ? "bg-gray-200 cursor-not-allowed" : "bg-white"}`}
            placeholder="Enter Password"
            disabled={disabled}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <br />
        <div className="flex justify-center mt-8 gap-4">
          {!disabled ? (
            <button
              className="bg-blue-500 text-white p-2 rounded-lg w-40 hover:bg-blue-600"
              onClick={handleSave}
            >
              Update
            </button>
          ) : (
            <button
              className="bg-black text-white p-2 rounded-lg w-40 hover:bg-gray-600"
              onClick={() => setDisabled(false)}
            >
              Edit
            </button>
          )}
          <button
            className="bg-red-500 text-white p-2 rounded-lg w-40 hover:bg-red-600"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
        <h1 className="text-xl font-bold mt-8">App Info</h1>
        <div className="flex flex-col justify-center mt-2 bg-gray-200 p-2 rounded-lg w-full hover:bg-gray-300 p-5 border-2 border-black">
          <div className="flex flex-row place-content-between items-center">
            <p className="text-md text-gray-800 font-semibold">Version</p>
            <p className="text-md text-gray-800">1.0.0</p>
          </div>
          <div className="flex flex-row items-center place-content-between mt-4">
            <p className="text-md text-gray-800 font-semibold">Developer</p>
            <p className="text-md text-gray-800">Pritish Purav</p>
          </div>
        </div>
      </div>
    </div>
  );
}
