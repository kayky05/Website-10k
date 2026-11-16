import { renderToString } from "react-dom/server";
import App from "./App";

// usado só no build: gera o HTML da página pronto, para o Google e para a primeira tela aparecer na hora
export function render() {
  return renderToString(<App />);
}
