import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <span className="text-sm font-semibold">Cayo Perico Calculator</span>
        <ThemeToggle />
      </div>
    </header>
  )
}
