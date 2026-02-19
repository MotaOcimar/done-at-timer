# Tech Stack

## 1. Frontend
*   **Framework:** **React**
    *   *Reasoning:* Industry standard, massive ecosystem, excellent for learning component-based architecture.
*   **Language:** **TypeScript**
    *   *Reasoning:* Adds static typing to JavaScript, catching errors early and improving code maintainability.
*   **Build Tool:** **Vite**
    *   *Reasoning:* Extremely fast, modern build tool that replaces Create React App.
*   **Styling:** **Tailwind CSS**
    *   *Reasoning:* Utility-first CSS framework that allows for rapid UI development without leaving the HTML.
*   **State Management:** **Zustand** (or Context API for simple cases)
    *   *Reasoning:* Lightweight, simple, and effective state management for React apps.
*   **Icons:** **Lucide React** or **Heroicons**
    *   *Reasoning:* Clean, modern SVG icons that work perfectly with React and Tailwind.

## 2. Backend (Optional for MVP, likely Local Storage initially)
*   **Persistence:** **Local Storage** (Browser)
    *   *Reasoning:* For the initial version, storing data in the user's browser is sufficient and simplest.
*   **Future Considerations:** If a backend is needed later, a simple Node.js/Express API or Firebase would be suitable.

## 3. DevOps & Tooling
*   **Version Control:** **Git**
*   **Package Manager:** **npm**
*   **Linting/Formatting:** **ESLint** + **Prettier**
    *   *Reasoning:* Ensures code quality and consistent formatting automatically.
*   **Testing:** **Vitest** + **React Testing Library**
    *   *Reasoning:* Fast unit testing framework compatible with Vite.
