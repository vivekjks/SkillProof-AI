import type React from "react"
import type { Metadata } from "next"

import "./globals.css"

import { Onest } from "next/font/google"
import { SkillProofProvider } from "@/components/skillproof/skillproof-state"

const onest = Onest({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-onest",
})

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://skillproof-verified.vercel.app"

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "SkillProof AI | Terminal3 Verified Skill Passport",
    template: "%s | SkillProof AI",
  },
  description:
    "Create a recruiter-ready skill passport with Terminal3 Agent Auth SDK identity, AI evidence analysis, signed credentials, verification links, and audit logs.",
  applicationName: "SkillProof AI",
  keywords: [
    "SkillProof AI",
    "Terminal3",
    "Agent Auth SDK",
    "verified skill passport",
    "AI recruiting",
    "developer credential",
  ],
  authors: [{ name: "SkillProof AI" }],
  creator: "SkillProof AI",
  publisher: "SkillProof AI",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    url: appUrl,
    title: "SkillProof AI | Terminal3 Verified Skill Passport",
    description:
      "Terminal3-backed AI agent workflow for evidence collection, scoring, credential issuance, recruiter sharing, and audit verification.",
    siteName: "SkillProof AI",
    images: [
      {
        url: "/icon.svg",
        width: 512,
        height: 512,
        alt: "SkillProof AI shield icon",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "SkillProof AI | Terminal3 Verified Skill Passport",
    description:
      "Terminal3-backed skill verification with AI agents, signed credentials, share links, and audit logs.",
    images: ["/icon.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${onest.variable} font-sans antialiased overflow-x-hidden`}>
        <SkillProofProvider>{children}</SkillProofProvider>
      </body>
    </html>
  )
}
