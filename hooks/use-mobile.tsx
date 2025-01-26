// use-mobile.tsx
import * as React from "react";

const MOBILE_MAX_WIDTH = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = `(max-width: ${MOBILE_MAX_WIDTH - 1}px)`;
    const mql = window.matchMedia(mediaQuery);

    const handleMediaChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(event.matches);
    };

    // Инициализация при монтировании
    handleMediaChange(mql);

    // Добавление слушателя для современных браузеров
    mql.addEventListener("change", handleMediaChange);

    return () => {
      mql.removeEventListener("change", handleMediaChange);
    };
  }, []);

  return isMobile;
}
