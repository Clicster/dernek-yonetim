"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Ay, AYLAR } from "./types";

interface AyContextValue {
  ay: Ay;
  setAy: (ay: Ay) => void;
  ayIndex: number; // 0-11
  yil: number;
}

const AyContext = createContext<AyContextValue>({
  ay: AYLAR[new Date().getMonth()],
  setAy: () => {},
  ayIndex: new Date().getMonth(),
  yil: new Date().getFullYear(),
});

export function AyProvider({ children }: { children: React.ReactNode }) {
  const now = new Date();
  const [ay, setAyState] = useState<Ay>(AYLAR[now.getMonth()]);
  const [yil] = useState(now.getFullYear());

  useEffect(() => {
    const saved = localStorage.getItem("secilen_ay");
    if (saved && AYLAR.includes(saved as Ay)) setAyState(saved as Ay);
  }, []);

  const setAy = (a: Ay) => {
    setAyState(a);
    localStorage.setItem("secilen_ay", a);
  };

  return (
    <AyContext.Provider value={{ ay, setAy, ayIndex: AYLAR.indexOf(ay), yil }}>
      {children}
    </AyContext.Provider>
  );
}

export function useAy() {
  return useContext(AyContext);
}
