# Pokédex - Expo React Native Learning Project

A mobile Pokédex application built with Expo and React Native to learn mobile development fundamentals. This project demonstrates various native features, API integration, and modern tooling in a real-world application.

## 🎯 Project Overview

This Pokédex app fetches data from the [PokéAPI](https://pokeapi.co/) and displays Pokémon in an interactive, visually appealing interface. The project serves as a comprehensive learning exercise in mobile development with Expo.

## ✨ Features Implemented

### Core Functionality

- **Pokémon Listing**: Grid view of Pokémon with infinite scroll
- **Search & Filter**: Real-time search by name or ID with API fallback
- **Detailed Views**: Modal sheets with Pokémon details (stats, abilities, types)
- **Pull-to-Refresh**: Refresh data with native gesture
- **Responsive Design**: Adaptive layout for different screen sizes

### Technical Features Demonstrated

- **Expo Router**: File-based navigation with modal presentations
- **NativeWind (Tailwind CSS)**: Utility-first styling for React Native
- **Advanced Animations**: Smooth transitions and interactive elements
- **Sheet Presentations**: Configurable modal sheets with detents
- **API Integration**: Efficient data fetching with error handling
- **TypeScript**: Full type safety throughout the application

## 🛠️ Tech Stack

- **Framework**: Expo + React Native
- **Navigation**: Expo Router (file-based)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Icons**: Expo Vector Icons
- **Images**: Expo Image for optimized image handling
- **State Management**: React Hooks (useState, useEffect)
- **HTTP Client**: Native Fetch API with AbortController
- **Type Safety**: TypeScript

## 📁 Project Structure

```text
pokedex/
├── app/
│   ├── index.tsx              # Main home screen with Pokémon grid
│   ├── details.tsx            # Pokémon detail view with tabs
│   ├── _layout.tsx            # Root navigation layout
│   └── global.css             # NativeWind CSS imports
├── types/
│   └── pokemon.ts             # TypeScript type definitions
├── constants/
│   └── pokemonType.ts         # Pokémon type colors and constants
├── metro.config.js            # Metro bundler configuration
├── babel.config.js            # Babel configuration
├── tailwind.config.js         # Tailwind CSS configuration
└── global.css                 # Root CSS file
```

## ⚙️ Setup & Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator or Android Emulator (or physical device)

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd pokedex
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npx expo start
   ```

4. **Run on your preferred platform**

   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app for physical device

## 🔧 Configuration Highlights

### NativeWind Setup Challenges & Solutions

Setting up NativeWind with Expo requires specific configuration. Here are the key learnings:

#### Critical Dependencies

```bash
# Essential packages (some might be missing in fresh Expo projects)
npm install expo nativewind tailwindcss
npm install @expo/metro-config  # Often required but not auto-installed
```

#### Configuration Files

**1. `metro.config.js`** – The most common source of issues:

```js
const { getDefaultConfig } = require("@expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, {
  input: "./global.css",
});
```

**⚠️ Common Error**: `Cannot find module 'expo/metro-config'`

- **Solution**: Use `@expo/metro-config` instead of `expo/metro-config`
- **Why**: The export path changed in newer Expo versions

**2. `babel.config.js`** – Must include NativeWind preset:

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
```

**3. `tailwind.config.js`** – Configure for NativeWind:

```js
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Pokémon type colors
        "type-normal": "#A8A878",
        "type-fire": "#F08030",
        // ... other type colors
      },
    },
  },
  plugins: [],
};
```

**4. `global.css`** – Must be in project root (not `app/` directory):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**5. Import in `app/_layout.tsx`**:

```ts
import "../global.css"; // Relative import from root
```

### Known Issues & Workarounds

#### 1. Expo Image + NativeWind Compatibility Issue

**Problem**: `expo-image` doesn't render when using `className` prop with NativeWind v4.

**Symptoms**:

- Images fail to render with `className="w-28 h-28"`
- Images work with inline `style={{ width: 112, height: 112 }}`
- No error messages, just blank image placeholders

**Solution**: Use `cssInterop` to wrap the Expo Image component:

```ts
import { cssInterop } from "nativewind";
import { Image as ExpoImage } from "expo-image";

cssInterop(ExpoImage, { className: "style" });

<ExpoImage
  source={{ uri: item.image }}
  className="w-28 h-28 mb-3"
  transition={200}
  contentFit="contain"
/>;
```

**Why this works**: NativeWind doesn't automatically convert `className` to `style` for third-party components like `expo-image`. `cssInterop` explicitly enables this transformation.

#### 2. Expo Router Caching Issues

**Problem**: File-based routing changes not reflecting immediately.

**Solutions**:

```bash
rm -rf .expo
rm -rf node_modules/.cache
npx expo start --clear

# Full reset
rm -rf node_modules
npm install
npx expo start --clear
```

#### 3. Missing Expo Package Error

**Problem**: `Cannot find module 'expo/metro-config'`

**Solution**:

```bash
npm install @expo/metro-config
```

## 📱 Key Components & Patterns

### Pokémon Grid with Infinite Scroll

- `FlatList` with `onEndReached` for pagination
- Debounced search for API optimization
- Type-based color theming

### Modal Sheet Details

- Expo Router `presentation: "formSheet"`
- Configurable detents (`[0.4, 0.6, 0.9]`)
- Tab navigation inside modals

### Efficient Data Fetching

- AbortController for request cancellation
- Local caching with API fallback
- Loading and error states

## 🎨 Design System

### Pokémon Type Colors

Defined in `constants/pokemonType.ts`:

```ts
export const typeColors: Record<string, string> = {
  normal: "#A8A878",
  fire: "#F08030",
  water: "#6890F0",
};
```

### Responsive Grid

- 2-column mobile layout
- Dynamic card sizing
- Consistent spacing via Tailwind utilities

## 🔄 Development Workflow Tips

### Hot Reload Issues

1. Verify `jsxImportSource: "nativewind"` in Babel config
2. Ensure `global.css` is imported in `_layout.tsx`
3. Run `npx expo start --clear`

### Testing NativeWind

```tsx
<View className="flex-1 items-center justify-center bg-red-100">
  <Text className="text-blue-500 text-2xl font-bold">
    If this is blue and bold, NativeWind works!
  </Text>
</View>
```

## 📈 Performance Optimizations

1. Image caching with `expo-image`
2. FlatList virtualization tuning
3. 300ms debounced search
4. Request cancellation via AbortController

## 🚀 Future Enhancements

- [ ] Favorites with AsyncStorage
- [ ] Evolution chain visualization
- [ ] Advanced filtering
- [ ] Offline support
- [ ] Haptic feedback
- [ ] Shake-to-refresh

## 📚 Learning Outcomes

- Expo + TypeScript setup
- API integration & error handling
- File-based navigation patterns
- Native module debugging
- Responsive mobile UI design

## 🤝 Contributing

Fork and experiment with new features, styling approaches, or tooling.

## 📄 License

MIT — use freely for learning or as a starter project.

---

_Built with ❤️ as a learning exercise. Thanks to PokéAPI for the data._
