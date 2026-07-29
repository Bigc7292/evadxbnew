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
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14 items-start">
            {/* Image & Name */}
            <div className="lg:col-span-2 space-y-8 animate-reveal-up">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl gold-glow">
                <Image
                  src="/elvira-11.png"
                  alt="Elvira Sharshenalieva"
                  width={600}
                  height={750}
                  className="w-full h-auto object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent pointer-events-none" />
              </div>
              <div className="text-center lg:text-left space-y-2">
                <h1 className="font-heading text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
                  Elvira Sharshenalieva
                </h1>
                <p className="text-xl font-medium tracking-wide" style={{ color: '#E5CA9B' }}>
                  Founder Eva Real Estate
                </p>
              </div>
            </div>

            {/* Info Panel */}
            <div className="lg:col-span-3 space-y-8 animate-reveal-up-delay-1">
              <div className="rounded-3xl border border-border bg-card/80 backdrop-blur-sm p-8 lg:p-10 shadow-lg">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1 h-10 rounded-full bg-gradient-to-b from-accent to-primary" />
                  <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
                    Company founder
                  </h2>
                </div>
                <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                  The professionalism to accommodate your property aspirations!
                </p>

                {/* Career Timeline */}
                <div className="mb-10">
                  <p className="text-muted-foreground mb-10 text-lg leading-relaxed">
                    Elvira Sharshenalieva&apos;s remarkable journey through the world of real estate began with stints at some of Dubai&apos;s major property development companies:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                      { src: '/company-img1.jpg', alt: '5 years', value: '5', label: 'years' },
                      { src: '/emaar-768x376-1-e1723111061768.jpg', alt: '2 years', value: '2', label: 'years' },
                      { src: '/company-img3.jpg', alt: '2 years', value: '2', label: 'years' },
                    ].map((item, i) => (
                      <div key={i} className="group rounded-2xl border border-border bg-background p-6 text-center hover:border-accent/40 hover:shadow-lg hover:shadow-accent/10 transition-all duration-500">
                        <div className="w-full h-24 bg-muted rounded-xl mb-4 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-500">
                          <Image
                            src={item.src}
                            alt={item.alt}
                            width={120}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-heading text-4xl font-bold block" style={{ color: '#1B4644' }}>
                          {item.value}
                        </span>
                        <p className="text-sm text-muted-foreground mt-2 uppercase tracking-wider">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-muted-foreground mb-10 text-lg leading-relaxed">
                  She fast-tracked up the corporate ladder while gaining valuable experience and market knowledge to achieve prominent executive positions.
                </p>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                  {[
                    { value: '10+', label: 'years real estate experience' },
                    { value: 'AED 5 billion+', label: 'personal sales volume' },
                    { value: '2021', label: 'established EVA Real Estate' },
                  ].map((stat, i) => (
                    <div key={i} className="rounded-2xl border border-border bg-gradient-to-b from-accent/5 to-transparent p-6 text-center gold-glow">
                      <div className="font-heading text-4xl sm:text-5xl font-bold mb-2" style={{ color: '#1B4644' }}>
                        {stat.value}
                      </div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Biography Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto space-y-8 text-muted-foreground text-lg leading-relaxed">
            <p className="animate-reveal-up">
              Elvira was instrumental in the establishment of high-profile projects such as Madinat Jumeirah Living by Dubai Holding, Beachfront by EMAAR, Bluewaters by Dubai Holding and Dubai Creek Harbour by EMAAR to name but a few.
            </p>
            <p className="animate-reveal-up-delay-1">
              On a professional level, Elvira is synonymous with trust and transparency. Her decade in the business, overseeing developments worldwide, bears testimony to her unique brand of expertise.
            </p>
            <p className="animate-reveal-up-delay-2">
              It was only a matter of time therefore, before Elvira&apos;s entrepreneurial spirit led her to branch out and establish her very own firm, Eva Real Estate LLC.
            </p>
          </div>

          <div className="mt-14 text-center animate-reveal-up-delay-3">
            <Link href="/about-us">
              <Button variant="outline" size="lg" className="rounded-full px-10 py-6 text-base">
                About company
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Awards Section */}
      <section className="py-24 bg-gradient-to-b from-card/50 via-card/30 to-card/50 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Already a major player, with Elvira at the helm it&apos;s little wonder the company continually picks up industry accolades:
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-4">
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  'Quarterly EMAAR Sales Awards',
                  'DAMAC Broker Award',
                  'Sobha Stars 2022',
                  'Regalia Performance',
                  'Dubai Holding Agents',
                  'MAG Top Broker of the Month 2022',
                ].map((award, i) => (
                  <li key={award} className="flex items-center gap-4 rounded-2xl border border-border bg-background/80 px-6 py-4 hover:border-accent/30 hover:bg-accent/5 transition-all duration-300 group">
                    <span className="w-3 h-3 rounded-full bg-accent flex-shrink-0 group-hover:scale-125 transition-transform duration-300" />
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-300">{award}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl overflow-hidden shadow-xl gold-glow aspect-[4/3] bg-muted flex items-center justify-center animate-reveal-up">
              <Image
                src="/awards-eva.jpg"
                alt="EVA Awards"
                width={600}
                height={450}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-gold opacity-5 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center max-w-2xl mx-auto">
          <div className="animate-reveal-up">
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
              Elvira is personally responsible for sales exceeding AED 5 billion. Her team has the business acumen and market know-how to help you achieve your dream property investment.
            </p>
          </div>
          <div className="animate-reveal-up-delay-1">
            <Link href="/team">
              <Button size="lg" className="rounded-full px-10 py-6 text-base" style={{ backgroundColor: '#1B4644', color: '#F8F6F0' }}>
                EVA Real Estate LLC Team
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}