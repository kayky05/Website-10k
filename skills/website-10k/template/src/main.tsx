import { createRoot, hydrateRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

const root = document.getElementById("root")!;
// no site publicado o HTML já vem pronto (pré-renderizado no build): o React só assume a página
if (root.hasChildNodes()) hydrateRoot(root, <App />);
else createRoot(root).render(<App />);
