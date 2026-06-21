"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bot, Menu, ShieldCheck } from "lucide-react"
import { productNavItems } from "@/components/skillproof/data"
import { cn } from "@/lib/utils"

export function ProductNavigation() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-30 border-b-[3px] border-black bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex min-w-fit items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-black bg-[#15B8A6] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <ShieldCheck className="h-6 w-6 text-black" aria-hidden="true" />
          </span>
          <span className="hidden text-xl font-bold leading-none sm:block">SkillProof AI</span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {productNavItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition-all",
                  active ? "bg-black text-white" : "text-black hover:bg-[#F2F2F2]",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/login"
            className="hidden items-center gap-2 rounded-xl border-[3px] border-black bg-[#FFC224] px-4 py-2 text-sm font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5 md:inline-flex"
          >
            <Bot className="h-4 w-4" aria-hidden="true" />
            Agent Auth
          </Link>
          <details className="relative lg:hidden">
            <summary
              aria-label="Open navigation menu"
              className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-xl border-[3px] border-black bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </summary>
            <div className="absolute right-0 mt-3 w-[260px] rounded-2xl border-[3px] border-black bg-white p-2 shadow-[7px_7px_0px_0px_rgba(0,0,0,1)]">
              {productNavItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold hover:bg-[#F2F2F2]"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </details>
        </div>
      </div>
    </header>
  )
}
