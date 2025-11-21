import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import {
  CheckCircle2,
  FileText,
  BarChart3,
  AlertTriangle,
  ArrowRight,
  Shield,
  Zap,
  Building2,
  TrendingDown,
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="container relative z-10">
            <div className="mx-auto max-w-3xl text-center space-y-8">
              <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-semibold text-primary bg-card shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                New: AI Contract Intelligence 2.0
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-balance">
                Stop Overpaying on{" "}
                <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  Service Contracts
                </span>
              </h1>
              <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl text-balance leading-relaxed">
                AI-powered invoice validation for any organization with complex service contracts. Prevent overpayments
                before they happen and recover millions in annual spend.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/dashboard">
                  <Button size="lg" className="h-12 px-8 text-base shadow-lg">
                    Start Saving Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="h-12 px-8 text-base bg-transparent">
                  View Interactive Demo
                </Button>
              </div>

              <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>SOC2 Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Enterprise Ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Seamless Integration</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-12 border-y bg-muted/30">
          <div className="container">
            <p className="text-center text-sm font-medium text-muted-foreground mb-8">
              TRUSTED BY LEADING ORGANIZATIONS
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 items-center justify-items-center opacity-60">
              {["Enterprise Co", "Global Systems", "TechFirst", "Unity Group", "CoreBusiness"].map((name) => (
                <div key={name} className="flex items-center gap-2 font-bold text-xl">
                  <Building2 className="h-6 w-6" />
                  {name}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-card">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="space-y-2">
                <div className="text-4xl font-bold text-primary">$4.2M+</div>
                <p className="text-muted-foreground">Saved for customers</p>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-primary">95%</div>
                <p className="text-muted-foreground">Validation accuracy</p>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-primary">30 sec</div>
                <p className="text-muted-foreground">Average validation time</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-20 md:py-32">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Complete Financial Control</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our platform handles the entire lifecycle of contract compliance, from digitization to dispute
                resolution.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                    <FileText className="h-6 w-6" />
                  </div>
                  <CardTitle>Contract Intelligence</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground leading-relaxed">
                  Upload PDF contracts and let our AI extract key terms, rate tables, and service level agreements
                  automatically.
                </CardContent>
              </Card>

              <Card className="border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                    <Shield className="h-6 w-6" />
                  </div>
                  <CardTitle>Automated Validation</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground leading-relaxed">
                  Every line item on every invoice is checked against your contract terms. We catch price variances
                  instantly.
                </CardContent>
              </Card>

              <Card className="border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <CardTitle>Exception Management</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground leading-relaxed">
                  Streamlined workflows for handling discrepancies. Approve, reject, or dispute charges with one click.
                </CardContent>
              </Card>

              <Card className="border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <CardTitle>Spend Analytics</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground leading-relaxed">
                  Visualize your spending patterns, track savings over time, and identify vendor performance issues.
                </CardContent>
              </Card>

              <Card className="border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                    <Zap className="h-6 w-6" />
                  </div>
                  <CardTitle>Real-time Alerts</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground leading-relaxed">
                  Get notified immediately when an invoice exceeds a threshold or a contract is about to expire.
                </CardContent>
              </Card>

              <Card className="border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                    <TrendingDown className="h-6 w-6" />
                  </div>
                  <CardTitle>Cost Recovery</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground leading-relaxed">
                  Full audit trail and documentation to support vendor disputes and reclaim overpayments.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-primary to-blue-600 text-white">
          <div className="container text-center max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-balance">
              Ready to stop revenue leakage?
            </h2>
            <p className="text-lg text-white/90 leading-relaxed">
              Join hundreds of organizations who are saving millions annually with SpendRule.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" variant="secondary" className="h-12 px-8 text-primary font-semibold shadow-lg">
                Get Started for Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 bg-transparent border-white text-white hover:bg-white hover:text-primary"
              >
                Schedule a Demo
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
