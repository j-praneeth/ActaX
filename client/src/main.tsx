import { createRoot } from "react-dom/client";
import { setupContainer } from "./core/container/setup";
import App from "./App";
import "./index.css";

// Setup dependency injection
setupContainer();

createRoot(document.getElementById("root")!).render(<App />);