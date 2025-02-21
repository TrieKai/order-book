# Order Book

A real-time cryptocurrency order book visualization built with React and Vite. This application displays live market data showing buy and sell orders in an interactive interface.

## Demo

🔗 [Live Demo](https://order-book-liard.vercel.app/)

| video |
| ----- |
| <img style="width: 350px" src='https://github.com/user-attachments/assets/56c37337-96fd-4a3a-8602-45dc1253fdd3' alt='demo video' /> |

## Features

- Real-time WebSocket connection for live market data
- Visual representation of order book with buy/sell orders
- Efficient data handling and updates
- TypeScript implementation for better code reliability

## Tech Stack

- React 19
- TypeScript
- Vite
- WebSocket for real-time data
- Tailwind CSS for styling

## Project Structure

```
├── public/             # Static files
├── src/                # Source code
│   ├── assets/         # Images and other assets
│   ├── components/     # Reusable React components
│   ├── hooks/          # Custom React hooks
│   ├── icons/          # SVG icons and icon components
│   ├── modules/        # Feature-specific modules
│   ├── services/       # API and WebSocket services
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── App.tsx         # Root React component
│   └── main.tsx        # Application entry point
├── index.html          # HTML entry point
├── package.json        # Project dependencies and scripts
├── tailwind.config.js  # Tailwind CSS configuration
├── tsconfig.json       # TypeScript configuration
└── vite.config.js      # Vite configuration
```

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Install dependencies
```bash
npm install
# or
yarn install
```

2. Start the development server
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## Development

This project uses Vite as the build tool, providing:
- Hot Module Replacement (HMR)
- Fast development server
- Optimized production builds

## Build

To create a production build:
```bash
npm run build
# or
yarn build
```