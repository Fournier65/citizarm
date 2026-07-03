import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Load font faces (only the weights actually used) in a separate,
// non-render-blocking chunk. `font-display: swap` in these stylesheets
// means text renders immediately with a fallback font and swaps in the
// webfont once it arrives, so this doesn't block first paint.
void Promise.all([
  import("@fontsource/outfit/latin-600.css"),
  import("@fontsource/outfit/latin-700.css"),
  import("@fontsource/outfit/latin-800.css"),
  import("@fontsource/plus-jakarta-sans/latin-400.css"),
  import("@fontsource/plus-jakarta-sans/latin-500.css"),
  import("@fontsource/plus-jakarta-sans/latin-600.css"),
  import("@fontsource/plus-jakarta-sans/latin-700.css"),
]);
