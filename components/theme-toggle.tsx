"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Sun01Icon, Moon02Icon } from "@hugeicons/core-free-icons";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Button variant="ghost" size="icon" disabled aria-label="Toggle theme" />;
  }

  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} aria-label="Toggle theme">
      {resolvedTheme === "dark" ? <HugeiconsIcon icon={Sun01Icon} strokeWidth={2} /> : <HugeiconsIcon icon={Moon02Icon} strokeWidth={2} />}
    </Button>
  );
}
