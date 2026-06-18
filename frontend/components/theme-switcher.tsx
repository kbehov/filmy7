"use client"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useCallback, useSyncExternalStore } from "react"
import { Button } from "./ui/button"

const subscribe = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme()
  const isClient = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  )
  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark")
  }, [theme, setTheme])
  if (!isClient) {
    return null
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="cursor-pointer"
      onClick={toggleTheme}
    >
      {theme === "dark" ? <Sun /> : <Moon />}
    </Button>
  )
}
export default ThemeSwitcher
