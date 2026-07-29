import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/lib/components/ui/button';

export const metadata = {
  title: 'CEO – EVA Real Estate',
  description: 'Meet Elvira Sharshenalieva, Founder of EVA Real Estate LLC – 10+ years of luxury real estate expertise in Dubai.',
};

export default function CeoPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            {/* Image & Name */}
            <div className="lg:col-span-2 space-y-6">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/elvira-11.png"
                  alt="Elvira Sharshenalieva"
                  width={600}
                  height={750}
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>
              <div className="text-center lg:text-left">
                <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-2">
                  Elvira Sharshenalieva
                </h1>
                <p className="text-lg font-medium" style={{ color: '#E5CA9B' }}>
                  Founder Eva Real Estate
                </p>
              </div>
            </div>

            {/* Info Panel */}
            <div className="lg:col-span-3 space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6 lg:p-8">
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-4">
                  Company founder
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  The professionalism to accommodate your property aspirations!
                </p>

                {/* Career Timeline */}
                <div className="mb-8">
                  <p className="text-muted-foreground mb-6">
                    Elvira Sharshenalieva's remarkable journey through the world of real estate began with stints at some of Dubai's major property development companies:
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-xl border border-border bg-background p-4 text-center">
                      <div className="w-full h-20 bg-muted rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                        <Image
                          src="/company-img1.jpg"
                          alt="5 years"
                          width={120}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-2xl font-heading font-bold" style={{ color: '#1B4644' }}>5</span>
                      <p className="text-xs text-muted-foreground mt-1">years</p>
                    </div>
                    <div className="rounded-xl border border-border bg-background p-4 text-center">
                      <div className="w-full h-20 bg-muted rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                        <Image
                          src="/emaar-768x376-1-e1723111061768.jpg"
                          alt="2 years"
                          width={120}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-2xl font-heading font-bold" style={{ color: '#1B4644' }}>2</span>
                      <p className="text-xs text-muted-foreground mt-1">years</p>
                    </div>
                    <div className="rounded-xl border border-border bg-background p-4 text-center">
                      <div className="w-full h-20 bg-muted rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                        <Image
                          src="/company-img3.jpg"
                          alt="2 years"
                          width={120}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-2xl font-heading font-bold" style={{ color: '#1B4644' }}>2</span>
                      <p className="text-xs text-muted-foreground mt-1">years</p>
                    </div>
                  </div>
                </div>

                <p className="text-muted-foreground mb-6">
                  She fast-tracked up the corporate ladder while gaining valuable experience and market knowledge to achieve prominent executive positions.
                </p>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div className="rounded-xl border border-border bg-background p-5 text-center">
                    <div className="text-3xl font-heading font-bold mb-1" style={{ color: '#1B4644' }}>10+</div>
                    <p className="text-sm text-muted-foreground">years real estate experience</p>
                  </div>
                  <div className="rounded-xl border border-border bg-background p-5 text-center">
                    <div className="text-3xl font-heading font-bold mb-1" style={{ color: '#1B4644' }}>AED 5 billion+</div>
                    <p className="text-sm text-muted-foreground">personal sales volume</p>
                  </div>
                  <div className="rounded-xl border border-border bg-background p-5 text-center">
                    <div className="text-3xl font-heading font-bold mb-1" style={{ color: '#1B4644' }}>2021</div>
                    <p className="text-sm text-muted-foreground">established EVA Real Estate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Biography Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-6 text-muted-foreground text-lg leading-relaxed">
            <p>
              Elvira was instrumental in the establishment of high-profile projects such as Madinat Jumeirah Living by Dubai Holding, Beachfront by EMAAR, Bluewaters by Dubai Holding and Dubai Creek Harbour by EMAAR to name but a few.
            </p>
            <p>
              On a professional level, Elvira is synonymous with trust and transparency. Her decade in the business, overseeing developments worldwide, bears testimony to her unique brand of expertise.
            </p>
            <p>
              It was only a matter of time therefore, before Elvira's entrepreneurial spirit led her to branch out and establish her very own firm, Eva Real Estate LLC.
            </p>
          </div>

          <div className="mt-10 text-center">
            <Link href="/about-us">
              <Button variant="outline" size="lg" className="rounded-full px-8">
                About company
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Awards Section */}
      <section className="py-16 bg-card/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Already a major player, with Elvira at the helm it's little wonder the company continually picks up industry accolades:
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div className="space-y-3">
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'Quarterly EMAAR Sales Awards',
                  'DAMAC Broker Award',
                  'Sobha Stars 2022',
                  'Regalia Performance',
                  'Dubai Holding Agents',
                  'MAG Top Broker of the Month 2022',
                ].map((award) => (
                  <li key={award} className="flex items-center gap-3 rounded-xl border border-border bg-background px-5 py-3">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#E5CA9B' }} />
                    <span className="text-sm font-medium text-foreground">{award}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl overflow-hidden shadow-xl aspect-[3/2] bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-sm">Awards Image</span>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-2xl mx-auto">
          <p className="text-lg text-muted-foreground mb-8">
            Elvira is personally responsible for sales exceeding AED 5 billion. Her team has the business acumen and market know-how to help you achieve your dream property investment.
          </p>
          <Link href="/team">
            <Button size="lg" className="rounded-full px-8" style={{ backgroundColor: '#1B4644', color: '#F8F6F0' }}>
              EVA Real Estate LLC Team
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}