> [!NOTE]
> This README was AI-generated and may require verification and updates.

# QwkSpd 🚀

A modern, fast, and beautiful internet speed test application powered by Cloudflare's global network. QwkSpd provides real-world speed measurements by testing against Cloudflare's servers, giving you insights into your actual browsing experience rather than idealized speed test results.

![QwkSpd Interface](public/cloudflare.png)

## ✨ Features

- **Real-world Speed Testing**: Uses Cloudflare's global network for practical speed measurements
- **Beautiful Modern UI**: Clean, responsive design built with Mantine components
- **Comprehensive Metrics**: Download, upload, ping, and jitter measurements
- **Location-aware**: Automatically detects your location and nearest Cloudflare server
- **Advanced Statistics**: Detailed insights into your network performance
- **Usage Estimates**: See what you can do with your current connection speed
- **Debug Mode**: Manual speed value setting for testing (Cmd+G to toggle)
- **Mobile Responsive**: Works seamlessly across all devices

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **UI Framework**: Mantine v8
- **Build Tool**: Vite
- **Speed Testing**: Cloudflare Speedtest API
- **Styling**: CSS with custom animations
- **Icons**: React Icons

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/barxilly/BenJSSpeedTest.git
cd BenJSSpeedTest
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment.

## 📱 Usage

1. **Start a Test**: Click the speed test button to begin measuring your connection
2. **View Results**: See real-time updates of download/upload speeds, ping, and jitter
3. **Location Info**: Your location and nearest Cloudflare server are automatically detected
4. **Advanced Stats**: Click to view detailed network performance insights
5. **Usage Estimates**: See what activities your connection can handle
6. **Debug Mode**: Press `Cmd+G` to access debug controls for manual testing

## 🌍 Why Cloudflare?

Unlike traditional speed tests that use dedicated speed test servers, QwkSpd uses Cloudflare's Content Delivery Network (CDN). This provides:

- **Real-world Results**: Tests against the same infrastructure that powers much of the modern web
- **Global Coverage**: Cloudflare's extensive network ensures testing from nearby servers
- **Practical Insights**: Results reflect actual browsing and streaming performance
- **Consistency**: Standardized testing across different locations and ISPs

## 🎨 Features Breakdown

### Core Speed Testing
- Download speed measurement in real-time
- Upload speed testing
- Ping latency measurement
- Network jitter analysis

### Location Services
- Automatic IP-based location detection
- Fallback to browser geolocation API
- Distance calculation to nearest Cloudflare server
- Server location display with distance in km/miles

### User Interface
- Gradient background design
- Smooth animations and transitions
- Responsive layout for all screen sizes
- Modal overlays for detailed information
- Custom loading states and progress indicators

### Advanced Features
- Keyboard shortcuts for power users
- Debug mode for developers and testing
- Comprehensive error handling
- Performance optimization for smooth testing

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run lint` - Run ESLint for code quality
- `npm run preview` - Preview production build locally

### Project Structure

```
src/
├── App.tsx          # Main application component
├── App.css          # Application styles and animations
├── main.tsx         # Application entry point
├── index.css        # Global styles
└── assets/          # Static assets
```

### Key Components

- **Speed Test Engine**: Handles connection testing using Cloudflare's API
- **Location Detection**: IP-based and GPS location services
- **UI Components**: Modal dialogs, progress indicators, and responsive layouts
- **Animation System**: CSS keyframe animations for smooth transitions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Cloudflare](https://cloudflare.com) for providing the speed test infrastructure
- [Mantine](https://mantine.dev) for the excellent React components
- [Vite](https://vitejs.dev) for the lightning-fast build tool
- [React Icons](https://react-icons.github.io/react-icons/) for the beautiful icons

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/barxilly/BenJSSpeedTest/issues) page
2. Create a new issue with detailed information
3. Include your browser, OS, and connection details

---

<div align="center">
  <strong>QwkSpd</strong> - Fast, accurate, beautiful speed testing for the modern web
</div>