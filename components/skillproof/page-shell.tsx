import type { ReactNode } from "react"
import { ProductNavigation } from "@/components/skillproof/product-navigation"
import { cn } from "@/lib/utils"

export function PageShell({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <main className={cn("min-h-screen bg-[#FCFCF8] text-black", className)}>
      <ProductNavigation />
      {children}
    </main>
  )
}
