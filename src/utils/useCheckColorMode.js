"use client"
import { useEffect } from "react";

export function useCheckColorMode() {
    const checkColorMode = () => {
        if (typeof window !== "undefined") {
            const colorMode = localStorage.getItem("chakra-ui-color-mode");
            if (colorMode) {
              localStorage.setItem("chakra-ui-color-mode", "light");
            }
          }
    }

    return checkColorMode
 
}
