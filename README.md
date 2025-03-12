# AirPointer
![Air Pointer Presentation](https://cdn.pritishpurav.in/Readme_Assets/AirPointer-Presentation.png)
AirPointer is an Electron-based application that allows users to control their computer's mouse using their mobile phone's gyroscope. The app connects via WebSocket and provides an intuitive air mouse experience.

## Features

- **Wireless Mouse Control**: Move your mouse using your phone's motion sensors.
- **WebSocket Connection**: Establish a connection between the mobile app and the Electron backend.
- **Manual Mouse Control**: Use the mobile app to move the mouse pointer.
- **Secure Authentication**: Connect with a password to prevent unauthorized access.
- **Recenter Mouse**: Quickly bring the pointer back to the screen center.
- **Left-Click Support**: Trigger a left click from your mobile device.
- **Real-Time Status Updates**: Displays connection status and device information in the Electron app.
- **Customizable Settings**: Configure the WebSocket server port and password.

## Download
Desktop App: [AirPointer-Desktop](https://github.com/pritish384/AirPointer/releases/)
Mobile App: [AirPointer-Mobile](https://github.com/pritish384/AirPointer/releases/)

## Installation

### Mobile App

1. Clone the repository:
   ```sh
   git clone https://github.com/pritish384/airpointer.git
   cd airpointer/AirPointer-Mobile
   ```
2. Install dependencies:
   ```sh
   npm i
   ```
3. Run the application:
   ```sh
   npm start
   ```

### Desktop App
1. Clone the repository:
   ```sh
   git clone
   cd airpointer/AirPointer-Desktop
   ```
2. Install dependencies:
   ```sh
   npm i
   ``` 
3. Run the application:
   ```sh
   npm run dev
   ```

## Configuration

You can change the WebSocket port and password in the Desktop app:
- Open the settings menu.
- Enter a new port or password.
- Click **Update** to apply changes.

## Mobile App Integration

- A React Native app connects to the Electron backend.
- Users input the **IP address** , **Port** and **Password** to authenticate.
- The mobile app sends motion data to move the mouse.

## Troubleshooting

- **WebSocket Connection Issues**:
  - Ensure the mobile device and PC are on the same network.
  - Check the IP address, port, and password.

- **App Not Responding**:
  - Close all instances of Electron and restart the app.
  - Check the console logs for errors.

## Contributing

Feel free to fork and submit pull requests to improve the app!

## License

MIT License. See `LICENSE` for more details.