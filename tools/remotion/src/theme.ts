import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Patrimonio Protegido site tokens (index.html :root)
export const C = {
  verdeOscuro: "#0D241C",
  verde: "#14352A",
  verdeSuave: "#1E4A3A",
  oro: "#C29B40",
  oroClaro: "#D9BC72",
  oroPalido: "#EBD9A8",
  arena: "#F5EFE3",
  blanco: "#FDFBF6",
  agua: "#5E9C9A",
};

export const DISPLAY = "Marcellus";
export const BODY = "Figtree";

export const fontsReady = Promise.all([
  loadFont({ family: DISPLAY, url: staticFile("marcellus-400.woff2"), weight: "400" }),
  loadFont({ family: BODY, url: staticFile("figtree-var.woff2"), weight: "100 900" }),
]);

export const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
