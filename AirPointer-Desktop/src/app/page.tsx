import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex h-screen items-center justify-center text-black">
      <div className="text-center">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <Image src="/icon.png" alt="AirPointer Icon" width={80} height={80} />
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-bold">Welcome to AirPointer</h1>

        {/* Description */}
        <p className="text-lg mt-2 text-gray-500">
          Control your laptop cursor effortlessly using your phone’s motion
          sensors.
        </p>
        <br></br>

        {/* Button */}
        <div className="flex gap-4 justify-center">
          <Link href="/connection">
            <button className="mt-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded w-40">
              Get Started
            </button>
          </Link>
          <Link href="/settings">
            <button className="mt-6 py-2 bg-gray-600 text-white hover:bg-gray-700 hover:text-white rounded w-40">
              Settings
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
