# Browser Fingerprinting Demo

A simple Node.js and Express project created to learn how browser and device information can be collected using standard browser APIs.

The project collects several browser signals and displays the results in one page.

This project does not use a database. The collected information is sent to the Express backend, printed in the server console, and returned to the frontend.

## Features

The project currently collects:

1. Client IP address
2. Request headers and Client Hints
3. Browser and device properties
4. Canvas fingerprint
5. WebGL and GPU fingerprint
6. Audio fingerprint
7. Font fingerprint

The user can click one button to run all collection methods.

The page displays:

- Individual method results
- Success or failed status
- Browser and device summary

## Technologies

### Backend

- Node.js
- Express.js
- JavaScript

### Frontend

- HTML
- CSS
- Vanilla JavaScript
- Canvas API
- WebGL API
- Web Audio API
- FontFaceSet API
- Web Crypto API

## Project Structure

```text
project/
├── public/
│   ├── index.html
│   └── js/
│       ├── browserCollector.js
│       ├── canvasCollector.js
│       ├── webglCollector.js
│       ├── audioCollector.js
│       ├── fontCollector.js
│       └── allCollector.js
│
├── src/
│   ├── config/
│   │   └── environment.js
│   │
│   ├── controllers/
│   │   └── tracking.controller.js
│   │
│   ├── middleware/
│   │   ├── ipTracking.middleware.js
│   │   ├── requestHeaders.middleware.js
│   │   ├── routeNotFound.middleware.js
│   │   └── errorHandler.middleware.js
│   │
│   ├── routes/
│   │   └── tracking.routes.js
│   │
│   ├── services/
│   │   └── tracking.service.js
│   │
│   ├── utils/
│   │   ├── request.util.js
│   │   └── clientHints.util.js
│   │
│   ├── app.js
│   └── server.js
│
├── .env
├── .gitignore
├── package.json
└── README.md
```

## How It Works

The application provides a separate button for each browser identification method.

The user can run the following tests individually:

- Browser properties collection
- Canvas fingerprint generation
- WebGL and GPU fingerprint generation
- Audio fingerprint generation
- Font fingerprint generation

When a user clicks a button, the related JavaScript collector gathers the information and sends it to its Express backend endpoint.

The backend then:

- Receives the collected data
- Validates and normalizes the values
- Adds request information such as the IP address and User-Agent
- Prints the result in the backend console
- Returns a response to the frontend

Each result is displayed under its related section on the page.

```text
User clicks a fingerprint button
              │
              ▼
Frontend collects browser information
              │
              ▼
Frontend sends the result to Express
              │
              ▼
Backend validates and logs the result
              │
              ▼
Frontend displays the returned result
```

## Available Tests

### Browser Properties

Click:

```text
Collect Browser Information
```

This collects browser, screen, language, timezone, hardware, touch, network, storage, and browser-capability information.

### Canvas Fingerprint

Click:

```text
Generate Canvas Fingerprint
```

This renders text and shapes on a hidden canvas and generates hashes from the rendered output.

### WebGL and GPU Fingerprint

Click:

```text
Generate WebGL Fingerprint
```

This collects WebGL capabilities, GPU renderer information, supported extensions, shader precision, and a WebGL rendering hash.

### Audio Fingerprint

Click:

```text
Generate Audio Fingerprint
```

This generates and processes an offline audio signal and creates a hash from the rendered audio samples.

It does not use the microphone or play audible sound.

### Font Fingerprint

Click:

```text
Generate Font Fingerprint
```

This checks a limited list of common fonts and compares text measurements against fallback fonts.

## Running the Application

Start the development server:

```bash
npm run dev
```

Open the application:

```text
http://localhost:5000
```

Run each test using its individual button.

The generated result will appear below the selected test.

The complete backend result will also be printed in the server terminal.

## Privacy Notice

This project is created for learning and testing browser APIs.

The project does not request:

- Camera access
- Microphone access
- Location permission
- File access

Browser information is collected using JavaScript in the browser.

The collected information and generated hashes are then sent to the Express backend for validation and console logging.

The project does not currently store the results in a database.

Each fingerprint is sent to a separate Express endpoint.

The backend validates and normalizes the received data, prints the result in the terminal, and returns a response to the browser.

## Collection Methods

### Client IP Address

The IP address is detected by the Express backend using values such as:

```js
req.ip;
req.headers["x-forwarded-for"];
req.socket.remoteAddress;
```

Endpoint:

```http
GET /api/v1/tracking/client-ip
```

During local development, the IP will normally be:

```text
127.0.0.1
```

or:

```text
::1
```

### Request Headers

The backend reads selected request headers, including:

- User-Agent
- Accept-Language
- Accept-Encoding
- Referer
- Origin
- Sec-Fetch headers
- Client Hint headers
- Do Not Track
- Global Privacy Control

Sensitive headers such as cookies and authorization tokens should not be logged.

### Browser Properties

The browser collector gathers information such as:

- Screen size
- Viewport size
- Device pixel ratio
- Language
- Timezone
- Platform
- CPU core count
- Device memory
- Touch support
- Network information
- Storage support
- Browser capabilities

Endpoint:

```http
POST /api/v1/tracking/browser-properties
```

### Canvas Fingerprint

A hidden canvas draws text, emojis, shapes, gradients, and curves.

The rendered result is converted into a SHA-256 hash.

Endpoint:

```http
POST /api/v1/tracking/canvas-fingerprint
```

### WebGL Fingerprint

The WebGL collector reads graphics information such as:

- WebGL version
- GPU vendor
- GPU renderer
- Supported extensions
- Graphics limits
- Shader precision

It also renders a small WebGL scene and creates a hash from the rendered pixels.

Endpoint:

```http
POST /api/v1/tracking/webgl-fingerprint
```

### Audio Fingerprint

The audio collector uses `OfflineAudioContext`.

It creates an audio signal using:

- Oscillator
- Gain node
- Biquad filter
- Dynamics compressor

The generated samples are converted into a SHA-256 hash.

This method does not use the microphone and does not play sound.

Endpoint:

```http
POST /api/v1/tracking/audio-fingerprint
```

### Font Fingerprint

The font collector checks a limited list of common fonts using:

```js
document.fonts.check();
```

and:

```js
canvasContext.measureText();
```

The detected fonts and measurements are converted into a hash.

Endpoint:

```http
POST /api/v1/tracking/font-fingerprint
```

## API Endpoints

| Method | Endpoint                              | Description               |
| ------ | ------------------------------------- | ------------------------- |
| GET    | `/api/v1/tracking/client-ip`          | Get client IP information |
| POST   | `/api/v1/tracking/browser-properties` | Submit browser properties |
| POST   | `/api/v1/tracking/canvas-fingerprint` | Submit canvas fingerprint |
| POST   | `/api/v1/tracking/webgl-fingerprint`  | Submit WebGL fingerprint  |
| POST   | `/api/v1/tracking/audio-fingerprint`  | Submit audio fingerprint  |
| POST   | `/api/v1/tracking/font-fingerprint`   | Submit font fingerprint   |

## Installation

Clone the repository:

```bash
git clone https://github.com/nadunjayaweera/BackLog.git
```

Move into the project directory:

```bash
cd BackLog
```

Install dependencies:

```bash
npm install
```

## Environment Variables

Create a `.env` file in the project root:

```env
NODE_ENV=development
PORT=5000
```

## Run the Project

Development mode:

```bash
npm run dev
```

Normal mode:

```bash
npm start
```

Open the application:

```text
http://localhost:5000
```

## Example Scripts

Your `package.json` may contain:

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

## Incognito Mode

Incognito mode normally removes or isolates browser storage such as cookies, local storage, and browsing history.

However, many browser characteristics may remain similar, including:

- IP address
- Browser version
- Operating system
- Screen resolution
- Timezone
- GPU information
- Canvas output
- Audio output
- Installed fonts

Because of this, the same device may produce similar fingerprint results in both normal and Incognito mode.

The results are not guaranteed to remain the same.

## Limitations

Browser fingerprints are not permanent device IDs.

A fingerprint may change when:

- The browser is updated
- The operating system is updated
- Fonts are installed or removed
- GPU drivers are updated
- Hardware acceleration is changed
- Browser privacy settings are changed
- The user changes browser or device
- Anti-fingerprinting protection is enabled

Two different devices may also produce similar results.

## Privacy Notice

This project is for learning and testing browser APIs.

The project does not request:

- Camera access
- Microphone access
- Location permission
- File access

The browser fingerprint data is sent to the backend and displayed on the page.

The project does not currently store the results in a database.

Users should be informed before collecting browser fingerprint information.

## Purpose

This project was created to understand:

- What browser information is available to websites
- Which information remains visible in Incognito mode
- How browser fingerprints are generated
- How frontend data can be validated by an Express backend
- Why browser fingerprints should not be treated as fully unique device identifiers

## License

This project is for educational use.
