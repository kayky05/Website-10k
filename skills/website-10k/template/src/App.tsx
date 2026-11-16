import { useEffect } from "react";
import "lenis/dist/lenis.css";
import { iniciarRolagemSuave } from "@/lib/rolagemSuave";
import Topo from "@/sections/Topo";

/* Cada seção da LP é um componente em src/sections/. Componentes copiados do 21st.dev,
   React Bits e shadcn ficam em src/components/ui/ com o código original. */
export default function App() {
  // rolagem com inércia, como no Mac (Lenis): padrão em toda LP
  useEffect(() => iniciarRolagemSuave(), []);

  return (
    <main>
      <Topo />
    </main>
  );
}
