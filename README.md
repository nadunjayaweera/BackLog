# Browser Identification and Fingerprinting Learning Project

This project is a learning-focused Node.js and Express application that demonstrates how websites can collect browser and device characteristics, including information that may remain available when a user opens the website in Incognito or Private Browsing mode.

The project collects several browser signals separately and then allows all methods to be executed through a single browser analysis action.

> This project is intended for educational, security-testing, fraud-prevention, and device-recognition research. It should not be used for hidden user tracking. Users should be clearly informed about the information being collected.

---

## Project Features

The application currently supports the following browser identification methods:

1. Client IP address detection
2. HTTP request header collection
3. Browser and device property collection
4. Canvas fingerprinting
5. WebGL and GPU fingerprinting
6. Audio fingerprinting
7. Font availability and text-measurement fingerprinting
8. Combined browser analysis summary

The frontend displays:

- Progress for each collection method
- Individual method results
- Success or failure status
- Client IP information
- Browser and hardware summary
- Generated fingerprint hashes
- Complete combined JSON output

---

## Important Privacy Information

This project collects information that may contribute to browser or device fingerprinting.

The application does not request:

- Camera access
- Microphone access
- Contacts
- Files
- Location permission

The audio fingerprinting method uses `OfflineAudioContext`. It generates audio data locally and does not record microphone input or play audible sound.

The application sends the generated browser information and hashes to the Express backend for demonstration and logging.

The application does not include permanent database storage by default.

Before using this project in a real application, you should:

- Display a clear privacy notice
- Obtain consent where required
- Define a data-retention policy
- Protect collected information
- Avoid treating fingerprints as permanent identities
- Follow applicable privacy laws and regulations

---

## Technology Stack

### Backend

- Node.js
- Express.js
- Helmet
- CORS
- Morgan
- JavaScript

### Frontend

- HTML5
- CSS3
- Vanilla JavaScript
- Canvas API
- WebGL API
- Web Audio API
- FontFaceSet API
- Web Crypto API

---

## Project Structure

```text
browser-tracking-project/
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
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## How the Project Works

When the user clicks the **Run Complete Browser Analysis** button, the frontend runs each method sequentially.

The overall process is:

```text
User clicks Run Complete Browser Analysis
                │
                ▼
        Request client IP
                │
                ▼
    Collect browser properties
                │
                ▼
      Generate canvas hash
                │
                ▼
    Generate WebGL/GPU hash
                │
                ▼
      Generate audio hash
                │
                ▼
     Generate font hash
                │
                ▼
      Send results to backend
                │
                ▼
   Display individual results
                │
                ▼
      Display final summary
```

The frontend sends each method to a separate backend endpoint.

The backend:

- Validates incoming data
- Normalizes values
- Extracts request IP and user-agent information
- Logs results to the console
- Returns a success response

---

# Identification Methods

## 1. IP Address Detection

The backend attempts to determine the client IP address using:

- `req.clientIp`
- `X-Forwarded-For`
- `req.ip`
- `req.socket.remoteAddress`

Example endpoint:

```http
GET /api/v1/tracking/client-ip
```

Example response:

```json
{
  "success": true,
  "message": "Client IP information retrieved successfully.",
  "data": {
    "ipAddress": "127.0.0.1",
    "expressIp": "127.0.0.1",
    "forwardedFor": null,
    "forwardedIpList": [],
    "socketAddress": "127.0.0.1",
    "protocol": "http",
    "hostname": "localhost",
    "secureConnection": false,
    "userAgent": "Mozilla/5.0 ...",
    "receivedAt": "2026-07-18T10:30:00.000Z"
  }
}
```

During local development, the IP normally appears as:

```text
127.0.0.1
```

or:

```text
::1
```

After deployment, the public IP may be available through trusted proxy headers.

---

## 2. Request Headers and Client Hints

The backend can collect selected request headers such as:

- User-Agent
- Accept
- Accept-Language
- Accept-Encoding
- Origin
- Referer
- Sec-Fetch-Site
- Sec-Fetch-Mode
- Sec-Fetch-Dest
- Sec-CH-UA
- Sec-CH-UA-Mobile
- Sec-CH-UA-Platform
- Sec-CH-UA-Arch
- Sec-CH-UA-Bitness
- Sec-CH-UA-Model
- Do Not Track
- Global Privacy Control

Sensitive headers should not be logged.

Examples of sensitive headers that should be excluded:

- Authorization
- Cookie
- Set-Cookie
- Proxy-Authorization
- X-API-Key

Some Client Hint values are available only over HTTPS.

---

## 3. Browser and Device Properties

The browser collector gathers information exposed by standard browser APIs.

Collected information may include:

### Screen information

- Screen width
- Screen height
- Available width
- Available height
- Color depth
- Pixel depth
- Device pixel ratio
- Viewport size
- Screen orientation

### Language information

- Primary language
- Preferred language list

### Timezone information

- Timezone name
- Locale
- Calendar type
- Numbering system
- UTC offset

### Hardware information

- Logical processor count
- Approximate device memory
- Platform
- Mobile indication

### Touch information

- Maximum touch points
- Touch-event support

### Network information

Where supported:

- Effective connection type
- Estimated downlink
- Round-trip time
- Data-saver status

### Browser capabilities

- Cookie support
- Local storage
- Session storage
- IndexedDB
- Service workers
- WebSockets
- Web Workers
- PDF viewer
- Online status
- Do Not Track
- Global Privacy Control

Endpoint:

```http
POST /api/v1/tracking/browser-properties
```

---

## 4. Canvas Fingerprinting

Canvas fingerprinting creates a hidden HTML canvas and draws a consistent combination of:

- Text
- Different fonts
- Emojis
- Shapes
- Gradients
- Transparency
- Curves
- Composite operations

The canvas is rendered locally.

The image result is converted into data and hashed using SHA-256. Only the hash and limited metadata are sent to the backend.

Endpoint:

```http
POST /api/v1/tracking/canvas-fingerprint
```

Example output:

```json
{
  "canvasHash": "8bc93e278ccff14218c12c...",
  "pixelSampleHash": "17bbf109352dc4ad...",
  "canvas": {
    "width": 500,
    "height": 220,
    "dataUrlLength": 32318
  }
}
```

The result may depend on:

- Operating system
- Browser engine
- Installed fonts
- Emoji rendering
- Graphics drivers
- GPU
- Hardware acceleration
- Browser privacy protection

---

## 5. WebGL and GPU Fingerprinting

WebGL fingerprinting collects information from the browser graphics environment.

Collected information may include:

- WebGL version
- GLSL shading language version
- Standard WebGL vendor
- Standard WebGL renderer
- Unmasked GPU vendor
- Unmasked GPU renderer
- WebGL extensions
- Shader precision
- Maximum texture size
- Maximum viewport size
- Color, depth and stencil bit limits
- Rendering output hash

A small WebGL scene is rendered locally and its pixel output is hashed.

Endpoint:

```http
POST /api/v1/tracking/webgl-fingerprint
```

Example GPU information:

```json
{
  "standardVendor": "WebKit",
  "standardRenderer": "WebKit WebGL",
  "unmaskedVendor": "Google Inc. (NVIDIA)",
  "unmaskedRenderer": "ANGLE (NVIDIA, NVIDIA GeForce ..., Direct3D11)"
}
```

Some browsers disable or standardize unmasked renderer information.

---

## 6. Audio Fingerprinting

Audio fingerprinting uses the Web Audio API.

The application creates an offline audio-processing graph containing:

- Oscillator
- Gain node
- Biquad filter
- Dynamics compressor

The audio signal is rendered using `OfflineAudioContext`.

The resulting floating-point samples are normalized and hashed with SHA-256.

This method:

- Does not use the microphone
- Does not record audio
- Does not play audible sound
- Does not require microphone permission

Endpoint:

```http
POST /api/v1/tracking/audio-fingerprint
```

Example result:

```json
{
  "fingerprintHash": "3d63700c...",
  "renderingHash": "d92a7b75...",
  "microphoneUsed": false,
  "audibleOutputUsed": false
}
```

The result may vary due to:

- Browser audio engine
- Operating system
- Audio drivers
- Floating-point processing
- Browser version
- Privacy protection

---

## 7. Font Availability and Text Measurement

The font collector checks a limited list of common fonts.

It uses:

- `document.fonts.check()`
- Canvas `measureText()`
- Generic font fallback comparisons

Example tested fonts include:

- Arial
- Calibri
- Cambria
- Consolas
- Courier New
- Georgia
- Helvetica
- Segoe UI
- Tahoma
- Times New Roman
- Verdana
- Roboto
- Ubuntu
- Noto Sans
- DejaVu Sans

The project intentionally uses a limited list and does not scan thousands of font names.

Endpoint:

```http
POST /api/v1/tracking/font-fingerprint
```

Example response data:

```json
{
  "fingerprintHash": "91f34b78...",
  "detectedFontsHash": "98abc203...",
  "detectedFontCount": 18,
  "testedFontCount": 27
}
```

Installed fonts can change because of:

- Operating-system updates
- Office software
- Design software
- Language packs
- User-installed fonts
- Browser privacy settings

---

# API Endpoints

## Get client IP information

```http
GET /api/v1/tracking/client-ip
```

## Submit browser properties

```http
POST /api/v1/tracking/browser-properties
```

## Submit canvas fingerprint

```http
POST /api/v1/tracking/canvas-fingerprint
```

## Submit WebGL fingerprint

```http
POST /api/v1/tracking/webgl-fingerprint
```

## Submit audio fingerprint

```http
POST /api/v1/tracking/audio-fingerprint
```

## Submit font fingerprint

```http
POST /api/v1/tracking/font-fingerprint
```

## Health check

Depending on your application configuration:

```http
GET /health
```

or:

```http
GET /api/health
```

---

# Installation

## 1. Clone the repository

```bash
git clone <your-repository-url>
```

Move into the project directory:

```bash
cd browser-tracking-project
```

## 2. Install dependencies

```bash
npm install
```

Example dependencies:

```bash
npm install express cors helmet morgan dotenv
```

For development:

```bash
npm install --save-dev nodemon
```

---

# Environment Configuration

Create a `.env` file in the project root:

```env
NODE_ENV=development
PORT=5000
```

You can also create `.env.example`:

```env
NODE_ENV=development
PORT=5000
```

Do not commit sensitive environment files.

Recommended `.gitignore`:

```gitignore
node_modules/
.env
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.DS_Store
coverage/
dist/
```

---

# Package Scripts

Example `package.json` scripts:

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

Start in development mode:

```bash
npm run dev
```

Start in production mode:

```bash
npm start
```

---

# Running the Application

After starting the server, open:

```text
http://localhost:5000
```

Click:

```text
Run Complete Browser Analysis
```

The application will run all methods one by one.

The interface will show:

- Current progress
- Running method
- Success or failure badge
- IP information
- Browser properties
- Canvas result
- WebGL result
- Audio result
- Font result
- Final combined summary

---

# Express Proxy Configuration

When running behind a reverse proxy, configure Express trust proxy carefully.

Example for one trusted proxy:

```js
app.set("trust proxy", 1);
```

This may be suitable when the application is behind:

- Nginx
- AWS Application Load Balancer
- Render
- Railway
- Heroku
- Cloudflare
- Another trusted reverse proxy

Do not blindly trust every forwarded header when the application is directly exposed to the internet.

An attacker may manually send a false `X-Forwarded-For` header if the proxy chain is not configured correctly.

---

# HTTPS Requirements

Some browser APIs require a secure context.

Use either:

```text
http://localhost
```

for local development, or:

```text
https://your-domain.com
```

for deployment.

The following features may require HTTPS outside localhost:

- Web Crypto API
- Some Client Hints
- Service Worker detection
- Certain browser privacy and capability APIs

---

# Incognito and Private Browsing

Incognito or Private Browsing normally isolates or clears certain storage mechanisms, including:

- Cookies
- Local storage
- Session data
- Browsing history
- Cached information

Private Browsing does not necessarily hide or change:

- Public IP address
- Browser version
- Operating system
- Screen dimensions
- Timezone
- Language
- CPU core count
- Device memory estimate
- GPU renderer
- Canvas output
- Audio output
- Installed fonts

Therefore, normal and private browser windows on the same device may produce similar or identical results.

However, a fingerprint is not guaranteed to remain stable.

---

# Fingerprint Limitations

Browser fingerprints should not be treated as permanent or unique identifiers.

Fingerprint values may change after:

- Browser updates
- Operating-system updates
- GPU driver updates
- Font installation or removal
- Display changes
- Browser zoom changes
- Hardware acceleration changes
- Privacy extension installation
- Anti-fingerprinting protection
- Virtual-machine usage
- Remote-desktop usage
- Audio-device changes
- Browser configuration changes

Different users may also produce identical fingerprints when they use similar devices and browser configurations.

---

# Recommended Real-World Usage

For legitimate security use cases, treat browser fingerprinting as one signal in a larger risk evaluation.

Example signals:

- Authenticated user ID
- Trusted-device token
- Session ID
- IP history
- Login location
- Login time
- User-Agent
- Browser properties
- Canvas hash
- WebGL hash
- Audio hash
- Font hash
- Failed login count
- MFA status

A recommended approach is to calculate a confidence or risk score instead of asking:

```text
Is this definitely the same device?
```

Ask:

```text
How likely is this to be the same device?
```

Example:

```text
Same trusted-device token: +50
Same canvas hash: +10
Same WebGL hash: +15
Same audio hash: +5
Same font hash: +5
Same browser properties: +10
Different country: -25
Different operating system: -30
```

The final score can be used to decide whether to:

- Allow the session
- Request OTP verification
- Request MFA
- Send a login notification
- Block a suspicious attempt
- Require account recovery

---

# Security Recommendations

Before production use:

1. Add request rate limiting.
2. Add request-body size limits.
3. Validate every incoming field.
4. Avoid logging authentication tokens.
5. Avoid logging cookies.
6. Avoid logging complete sensitive headers.
7. Use HTTPS.
8. Configure CORS correctly.
9. Configure trusted proxy settings.
10. Add a consent notice.
11. Define data retention.
12. Avoid storing raw fingerprint data unnecessarily.
13. Prefer hashed or minimized data.
14. Restrict access to collected information.
15. Protect logs from unauthorized access.

Example request-body limit:

```js
app.use(
  express.json({
    limit: "100kb",
  }),
);
```

---

# Data Storage

This project does not require a database.

By default, results are:

- Generated in the browser
- Sent to the Express backend
- Validated by the backend
- Printed in the backend console
- Returned to the frontend

If database storage is added later, recommended fields may include:

```text
id
session_id
user_id
ip_hash
user_agent
browser_properties_hash
canvas_hash
webgl_hash
audio_hash
font_hash
confidence_score
consent_version
created_at
expires_at
```

Avoid permanently storing raw IP addresses or detailed fingerprint data unless necessary and legally permitted.

---

# Testing Recommendations

Test the application in:

- Chrome normal window
- Chrome Incognito
- Microsoft Edge normal window
- Microsoft Edge InPrivate
- Firefox normal window
- Firefox Private Browsing
- Safari normal window
- Safari Private Browsing
- Different computers
- Different operating systems
- Virtual machines
- Remote desktop
- Mobile browsers

Compare:

- Which values remain the same
- Which values change
- Which APIs are unavailable
- Which browsers apply privacy protection
- Whether hashes remain stable after browser restart

---

# Troubleshooting

## IP address is `127.0.0.1`

This is expected during local development because the frontend and backend are running on the same machine.

## IP address is the proxy address

Check:

```js
app.set("trust proxy", 1);
```

Also verify that the reverse proxy sends the correct forwarding headers.

## Web Crypto API is unavailable

Use:

```text
http://localhost
```

or deploy with HTTPS.

## WebGL is unavailable

Possible reasons:

- Hardware acceleration is disabled
- Browser policy blocks WebGL
- GPU driver is unavailable
- Browser is running in a restricted environment
- Remote desktop disables graphics features

## GPU renderer is hidden

The browser may block:

```text
WEBGL_debug_renderer_info
```

The application should continue using standard renderer values.

## Audio fingerprint fails

Possible reasons:

- `OfflineAudioContext` is unsupported
- Browser privacy settings block audio fingerprinting
- Browser requires a user interaction
- Audio processing is restricted

The analysis button itself counts as a user interaction in most browsers.

## Font detection gives unexpected results

Font detection is not perfectly reliable.

`document.fonts.check()` may return true because fallback rendering is available. The project also uses text measurement comparisons to improve detection.

## Fingerprint changes between tests

Possible causes:

- Browser update
- Operating-system update
- Font changes
- GPU driver changes
- Hardware acceleration change
- Browser privacy randomization
- Different browser zoom
- Different monitor or display scale
- Different browser profile

---

# Future Improvements

Possible next improvements include:

- Combined fingerprint generation
- Confidence scoring
- Device recognition history
- Trusted-device registration
- OTP or MFA challenge logic
- Fingerprint stability comparison
- Browser-risk scoring
- Privacy consent management
- Expiring fingerprint records
- Hashed IP storage
- Admin dashboard
- Exportable test reports
- Automated browser comparison
- Rate limiting
- Unit and integration tests

---

# Example Combined Result

```json
{
  "startedAt": "2026-07-18T10:00:00.000Z",
  "completedAt": "2026-07-18T10:00:02.120Z",
  "durationMilliseconds": 2120,
  "methods": {
    "ip": {
      "success": true,
      "name": "IP Address"
    },
    "browser": {
      "success": true,
      "name": "Browser Properties"
    },
    "canvas": {
      "success": true,
      "name": "Canvas Fingerprint"
    },
    "webgl": {
      "success": true,
      "name": "WebGL/GPU Fingerprint"
    },
    "audio": {
      "success": true,
      "name": "Audio Fingerprint"
    },
    "font": {
      "success": true,
      "name": "Font Fingerprint"
    }
  }
}
```

---

# Ethical Use

This project should be used responsibly.

Appropriate use cases include:

- Learning browser APIs
- Security research
- Fraud detection
- Bot detection
- Account protection
- Suspicious-login detection
- Trusted-device recognition
- Browser compatibility testing

Inappropriate use cases include:

- Secretly tracking users
- Bypassing user privacy choices
- Tracking users across unrelated websites
- Discriminating against users
- Creating permanent identity records without consent
- Collecting unnecessary personal information

---

# License

Add the license that matches your project requirements.

Example:

```text
MIT License
```

You may create a separate `LICENSE` file containing the full license text.

---

# Disclaimer

This project is provided for educational and research purposes.

Browser fingerprinting is probabilistic. It cannot guarantee that two requests came from the same person or device.

The project authors are not responsible for misuse, privacy violations, legal violations, inaccurate identification, account blocking, or security decisions made solely from fingerprint information.
