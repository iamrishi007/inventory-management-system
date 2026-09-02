"use client"

import { createContext, useState } from "react"

interface ThemeContextType {
  dark: boolean
  setDark: (val: boolean) => void
}

export const ThemeContext = createContext<ThemeContextType>({
  dark: false,
  setDark: () => {},
})

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [dark, setDark] = useState(false)

  return (
    <ThemeContext.Provider value={{ dark, setDark }}>
      <div className={dark ? "dark" : ""}>{children}</div>
    </ThemeContext.Provider>
  )
}
