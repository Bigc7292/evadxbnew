import { HeroSection } from '@/lib/components/HeroSection';
import { ListingsGrid } from '@/lib/components/ListingsGrid';
import { CustomCursor } from '@/lib/components/CustomCursor';
import { getProperties, getAgents } from '@/lib/supabase/queries';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Award, Star, Phone, Mail } from 'lucide-react';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'EVA Real Estate Dubai - Luxury Properties for Sale & Rent',
    description: 'Discover luxury properties in Dubai with EVA Real Estate. Off-plan projects, ready homes, and investment opportunities from top developers like Emaar, DAMAC, Meraas, and Nakheel.',
  };
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  let propertiesResult: Awaited<ReturnType<typeof getProperties>> = { properties: [], totalCount: 0 };
  let agents: Awaited<ReturnType<typeof getAgents>> = [];
  try {
    propertiesResult = await getProperties({ limit: 12, featured_only: true });
  } catch (error) {
    console.error('Failed to load featured properties:', error);
  }
  try {
    agents = await getAgents({ limit: 3 });
  } catch (error) {
    console.error('Failed to load featured agents:', error);
  }

  return (
    <>
      <CustomCursor />
      <HeroSection />
      <section className="px-4 sm:px-6 lg:px-8 py-16" id="properties">
        <div className="max-w-7xl mx-auto">
          <ListingsGrid
            properties={propertiesResult.properties}
            locale={locale}
            totalCount={propertiesResult.totalCount}
            hasMore={false}
          />
        </div>
      </section>

      {agents.length > 0 && (
        <section className="py-20 bg-card/30 border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-3">
                  Meet Our Top Agents
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl">
                  Certified professionals ready to help you find your perfect property in Dubai.
                </p>
              </div>
              <Link
                href={`/${locale}/team`}
                className="hidden sm:inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-border hover:border-accent/50 hover:bg-accent/5 transition-all duration-300"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="group rounded-3xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden hover:border-accent/40 hover:shadow-2xl hover:shadow-accent/10 transition-all duration-500"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-b from-muted to-card">
                    {agent.profile_image_url ? (
                      <Image
                        src={agent.profile_image_url}
                        alt={agent.profile_image_alt || `${agent.first_name} ${agent.last_name}`}
                        fill
                        className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-6xl font-bold text-muted-foreground/30">
                        {agent.first_name?.[0]}
                        {agent.last_name?.[0]}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <div className="p-6 relative">
                    {agent.is_leader && (
                      <div className="absolute -top-3 left-6 flex items-center gap-1 px-3 py-1 rounded-full bg-accent/90 text-xs font-semibold text-background">
                        <Award className="w-3 h-3" />
                        Team Leader
                      </div>
                    )}
                    <h3 className="font-heading text-xl font-bold text-foreground mb-1">
                      {agent.first_name} {agent.last_name}
                    </h3>
                    <p className="text-accent text-sm font-medium mb-3">{agent.position}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-4">
                      {agent.years_experience != null && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-accent" />
                          {agent.years_experience} years exp.
                        </span>
                      )}
                      {agent.properties_sold != null && (
                        <span className="flex items-center gap-1">
                          <Award className="w-3 h-3 text-accent" />
                          {agent.properties_sold} sold
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {agent.phone && (
                        <a
                          href={`tel:${agent.phone}`}
                          className="flex items-center justify-center w-9 h-9 rounded-xl bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                          aria-label={`Call ${agent.first_name}`}
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      )}
                      {agent.email && (
                        <a
                          href={`mailto:${agent.email}`}
                          className="flex items-center justify-center w-9 h-9 rounded-xl bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                          aria-label={`Email ${agent.first_name}`}
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center sm:hidden">
              <Link
                href={`/${locale}/team`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-border hover:border-accent/50 hover:bg-accent/5 transition-all duration-300"
              >
                View All Agents
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
