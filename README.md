# CMS App Studio

**Designed by Mohammad Babaei ([adschi.com](https://adschi.com))**

Visually build mobile app interfaces for your Content Management System (CMS). This application provides a drag-and-drop interface to design app layouts using pre-built widgets, configure their appearance and behavior, and preview the result in real-time.

![CMS App Studio Screenshot](https://picsum.photos/seed/readme_screenshot/800/400?blur=2) <!-- Placeholder Image - Replace with actual screenshot -->
*Data AI Hint: application builder screenshot*

## Overview

CMS App Studio simplifies the process of creating mobile app front-ends that can connect to various CMS platforms. Users can:

*   **Visually Design:** Drag widgets from a panel onto a phone preview.
*   **Configure Widgets:** Select widgets in the preview to adjust their settings (text, images, links, data sources, appearance, etc.).
*   **Real-time Preview:** See changes instantly reflected on the phone mockup.
*   **AI Assistance:** Leverage AI for content generation (text, alt text) and layout suggestions.
*   **Theming:** Apply different pre-defined themes (Default, Zinc, Rose, Green) or customize colors.
*   **Local Storage:** Your current layout is automatically saved in your browser's local storage.
*   **CMS Connection (Placeholder):** Includes a basic connector interface for platforms like Prestashop, WooCommerce, etc. (backend integration required).
*   **Mobile Features (Preview):** Widgets for Camera access and Push Notification setup are included for demonstrating potential mobile capabilities.

## Features

*   **Widget Panel:** Browse and select available widgets.
    *   Header, Banner, Carousel, Grid, List, Text, Button, Spacer, Divider, Form, Map, Video, Audio, Countdown, Social Feed, Camera, Push Notifications.
*   **Phone Preview:** Realistic phone mockup for layout design.
    *   Drag-and-drop interface for adding and reordering widgets.
    *   Widget selection for configuration.
    *   Widget deletion.
    *   Internal page navigation simulation (for links, header buttons).
*   **Configuration Panel:** Context-aware settings for the selected widget.
    *   Widget-specific settings (e.g., title, image URL, text content, button variant).
    *   Common settings (margins, animation, conditional display, custom CSS).
    *   AI Content Generation (for Text, Banner Alt Text).
    *   AI Layout Suggestions (based on app type).
    *   Image Upload (for Banner, Carousel items).
    *   Theme Selector.
    *   App Template Loader (Store, Blog, Blank).
*   **Authentication (Context):** Basic Firebase authentication context setup (UI placeholder in preview).
*   **AI Integration (Genkit):**
    *   `generate-content-flow`: Generates content for text/banner widgets.
    *   `suggest-layout-flow`: Suggests initial widget layouts based on app type.

## Tech Stack

*   **Framework:** Next.js (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **UI Components:** ShadCN UI
*   **State Management:** React Hooks (useState, useEffect, useContext), React Hook Form (for configuration panel)
*   **AI:** Google AI (via Genkit)
*   **Authentication & Database (Setup):** Firebase (Auth, Firestore - *requires configuration*)
*   **Drag & Drop:** Native HTML Drag and Drop API

## Project Structure

```
.
├── public/               # Static assets
├── src/
│   ├── ai/               # Genkit AI flows and configuration
│   │   ├── flows/        # AI flow implementations
│   │   ├── prompts/      # Handlebars prompt templates (if used separately)
│   │   ├── ai-instance.ts # Genkit initialization
│   │   └── dev.ts        # Genkit development server entrypoint
│   ├── app/              # Next.js App Router pages and layouts
│   │   ├── api/          # API routes (optional)
│   │   ├── globals.css   # Global styles and ShadCN theme variables
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Main application page
│   ├── components/       # Reusable React components
│   │   ├── ui/           # ShadCN UI components
│   │   ├── configuration-panel.tsx
│   │   ├── phone-preview.tsx
│   │   ├── platform-connector.tsx
│   │   ├── theme-provider.tsx
│   │   ├── theme-selector.tsx
│   │   └── widget-panel.tsx
│   ├── context/          # React context providers (e.g., AuthContext)
│   ├── hooks/            # Custom React hooks (e.g., useToast, useMobile)
│   ├── lib/              # Utility functions, Firebase config, constants
│   │   ├── firebase.ts   # Firebase initialization
│   │   ├── utils.ts      # General utility functions (e.g., cn)
│   │   └── widget-defaults.ts # Default configurations for widgets
│   ├── services/         # Business logic, external API interactions (e.g., cms.ts)
│   └── types/            # TypeScript type definitions (e.g., widget.ts)
├── .env                  # Environment variables (IMPORTANT: Needs configuration)
├── components.json       # ShadCN UI configuration
├── next.config.ts        # Next.js configuration
├── package.json          # Project dependencies and scripts
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## Getting Started

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm or yarn or pnpm

### Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Configure Environment Variables:**
    *   Create a `.env` file in the root of the project.
    *   **Firebase:** Add your Firebase project configuration keys. You can get these from your Firebase project settings ([Firebase Console](https://console.firebase.google.com/)).
        ```env
        NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
        NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
        NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
        # NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID # Optional
        ```
    *   **Google AI (Genkit):** Add your Google AI API key (e.g., from Google AI Studio).
        ```env
        GOOGLE_GENAI_API_KEY=YOUR_GOOGLE_AI_API_KEY
        ```
    *   **Important:** Ensure the variable names match exactly as shown (`NEXT_PUBLIC_` prefix is crucial for Firebase client-side access).

### Running the Development Server

1.  **Start the Genkit development flow server (for AI features):**
    Open a terminal and run:
    ```bash
    npm run genkit:dev
    # or keep it running and watch for changes:
    # npm run genkit:watch
    ```
    This server needs to be running for the AI features (content generation, layout suggestion) to work.

2.  **Start the Next.js development server:**
    Open **another** terminal and run:
    ```bash
    npm run dev
    ```

3.  Open [http://localhost:9002](http://localhost:9002) (or the specified port) in your browser to see the application.

## Usage

1.  **Select Widgets:** Drag widgets from the left panel onto the phone preview in the center.
2.  **Arrange Widgets:** Drag existing widgets (using the drag handle) within the phone preview to reorder them (Header is fixed).
3.  **Configure Widgets:** Click on a widget in the preview to select it. Its configuration options will appear in the right panel. Modify settings as needed. Changes should reflect in the preview instantly or upon losing focus (blur) from input fields.
4.  **Use AI:**
    *   For Text or Banner widgets, enter a prompt in the "AI Prompt" field in the configuration panel and click the wand icon to generate content.
    *   Click the "AI Layout..." button in the configuration panel to get layout suggestions based on app type (Store, Blog, etc.).
5.  **Change Theme:** Use the Theme Selector at the bottom of the configuration panel to switch between global themes.
6.  **Navigate (Preview):** Click on header buttons (Cart, Auth) or configured links within widgets (Buttons, Banners, List items) to simulate navigating to different app pages within the preview.
7.  **Mobile Features:** Add Camera or Push Notification widgets to see their placeholders and basic permission requests/setup fields.

## Contributing

Contributions are welcome! Please follow standard fork-and-pull-request workflows. Ensure code adheres to the project's linting and formatting standards.

## License

(Specify your license here, e.g., MIT License)

---

*This project was designed and developed by Mohammad Babaei ([adschi.com](https://adschi.com)).*
