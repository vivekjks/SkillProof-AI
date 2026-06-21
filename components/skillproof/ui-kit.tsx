"use client"

import type { ComponentType, ReactNode } from "react"
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Highlight({
  children,
  color = "bg-[#15B8A6]",
  text = "text-white",
}: {
  children: ReactNode
  color?: string
  text?: string
}) {
  return <span className={cn(color, text, "inline-block px-3 py-1")}>{children}</span>
}

export function NeoPanel({
  children,
  className,
  shadow = true,
}: {
  children: ReactNode
  className?: string
  shadow?: boolean
}) {
  return (
    <div
      className={cn(
        "rounded-[28px] border-[3px] border-black bg-white",
        shadow && "shadow-[7px_7px_0px_0px_rgba(0,0,0,1)]",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function SectionTitle({
  title,
  highlight,
  description,
  align = "left",
}: {
  title: string
  highlight?: string
  description?: string
  align?: "left" | "center"
}) {
  return (
    <div className={cn("space-y-4", align === "center" && "mx-auto max-w-3xl text-center")}>
      <h1 className="text-[36px] leading-[44px] font-bold md:text-[60px] md:leading-[70px]">
        {title} {highlight ? <Highlight color="bg-[#FFC224]" text="text-black">{highlight}</Highlight> : null}
      </h1>
      {description ? (
        <p className="max-w-3xl text-[17px] font-medium leading-[29px] text-[#393939] md:text-[19px]">
          {description}
        </p>
      ) : null}
    </div>
  )
}

export function ActionButton({
  children,
  onClick,
  loading,
  variant = "dark",
  href,
}: {
  children: ReactNode
  onClick?: () => void | Promise<void> | Promise<unknown>
  loading?: boolean
  variant?: "dark" | "light" | "accent"
  href?: string
}) {
  const className = cn(
    "h-auto rounded-xl border-[3px] border-black px-6 py-4 text-base font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
    variant === "dark" && "bg-black text-white hover:bg-black/90",
    variant === "light" && "bg-white text-black hover:bg-[#F6F6F6]",
    variant === "accent" && "bg-[#FFC224] text-black hover:bg-[#FFD45A]",
  )

  const content = (
    <>
      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
      {children}
      {!loading ? <ArrowRight className="h-5 w-5" /> : null}
    </>
  )

  if (href) {
    return (
      <Button asChild className={className}>
        <a href={href}>{content}</a>
      </Button>
    )
  }

  return (
    <Button className={className} onClick={onClick} disabled={loading}>
      {content}
    </Button>
  )
}

export function MetricTile({
  icon: Icon,
  label,
  value,
  detail,
  accent = "bg-[#15B8A6]",
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
  detail: string
  accent?: string
}) {
  return (
    <NeoPanel className="min-h-[188px] p-6 transition-transform duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#5B5B5B]">{label}</p>
          <p className="mt-3 text-[42px] font-bold leading-none text-black">{value}</p>
        </div>
        <div className={cn("flex h-[52px] w-[52px] items-center justify-center rounded-2xl border-[3px] border-black", accent)}>
          <Icon className="h-6 w-6 text-black" />
        </div>
      </div>
      <p className="mt-5 text-[15px] font-medium leading-6 text-[#393939]">{detail}</p>
    </NeoPanel>
  )
}

export function StatusPill({
  children,
  tone = "green",
}: {
  children: ReactNode
  tone?: "green" | "blue" | "yellow" | "pink" | "black"
}) {
  const tones = {
    green: "bg-[#DFFAF4]",
    blue: "bg-[#E5F0FF]",
    yellow: "bg-[#FFF1BE]",
    pink: "bg-[#FFE4EA]",
    black: "bg-black text-white",
  }

  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full border-2 border-black px-3 py-1 text-sm font-bold", tones[tone])}>
      <CheckCircle2 className="h-4 w-4" />
      {children}
    </span>
  )
}

export function MonoLine({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <code className={cn("inline-block max-w-full break-all rounded-lg bg-black px-3 py-2 font-mono text-xs font-semibold leading-5 text-[#BFFFEF]", className)}>
      {children}
    </code>
  )
}
