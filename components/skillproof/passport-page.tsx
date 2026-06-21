import { PageShell } from "@/components/skillproof/page-shell"
import { PassportCard } from "@/components/skillproof/passport-card"
import { SectionTitle } from "@/components/skillproof/ui-kit"
import { VerificationPanel } from "@/components/skillproof/verification-panel"

export function PassportPage() {
  return (
    <PageShell>
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto max-w-7xl space-y-8">
          <SectionTitle
            title="Verified Skill Passport"
            highlight="credential"
            description="The final recruiter-facing artifact: identity, skill graph, evidence confidence, Terminal3 DID, credential status, and signed audit trail."
          />
          <VerificationPanel />
          <PassportCard />
        </div>
      </section>
    </PageShell>
  )
}
