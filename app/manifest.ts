import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SkillProof AI",
    short_name: "SkillProof",
    description: "Terminal3-backed AI skill passport with signed credential verification.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFF9E3",
    theme_color: "#15B8A6",
    icons: [
      {
        src: "/icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  }
}
