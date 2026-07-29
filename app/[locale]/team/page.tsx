import { Metadata } from 'next';
import Image from 'next/image';
import { getAgents } from '@/lib/supabase/queries';
import { Phone, Mail, Award, Star, ExternalLink } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Our Team | EVA Real Estate Dubai',
    description: 'Meet the expert real estate agents at EVA Real Estate. Our team of certified professionals is here to help you find your perfect property in Dubai.',
  };
}

export default async function TeamPage() {
  let agents: Awaited<ReturnType<typeof getAgents>> = [];
  try {
    agents = await getAgents();
  } catch (error) {
    console.error('Failed to load agents:', error);
  }

  const leaders = agents.filter((agent) => agent.is_leader);
  const regularAgents = agents.filter((agent) => !agent.is_leader);

  const AgentCard = ({ agent }: { agent: any }) => (
    <div className="group relative rounded-3xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden hover:border-accent/40 hover:shadow-2xl hover:shadow-accent/10 transition-all duration-500">
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
        <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3">
          {agent.short_bio || agent.bio}
        </p>

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
                {agent.social_links?.linkedin && (
                  <a
                    href={agent.social_links.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-9 h-9 rounded-xl bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                    aria-label={`${agent.first_name} LinkedIn`}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {agent.social_links?.instagram && (
                  <a
                    href={agent.social_links.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-9 h-9 rounded-xl bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                    aria-label={`${agent.first_name} Instagram`}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {agent.social_links?.facebook && (
                  <a
                    href={agent.social_links.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-9 h-9 rounded-xl bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                    aria-label={`${agent.first_name} Facebook`}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading text-5xl sm:text-6xl font-bold gradient-gold mb-6">
            Meet Our Team
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Dedicated real estate professionals committed to delivering exceptional service and finding your perfect property in Dubai.
          </p>
        </div>
      </section>

      {/* Team Stats */}
      <section className="py-16 bg-card/50 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '150+', label: 'Expert Agents' },
              { value: '30+', label: 'Languages Spoken' },
              { value: '8500+', label: 'Properties Sold' },
              { value: '15+', label: 'Years Experience' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-heading text-4xl sm:text-5xl font-bold gradient-gold mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      {leaders.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-10">
              <Award className="w-8 h-8 text-accent" />
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
                Leadership
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {leaders.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Agents */}
      {regularAgents.length > 0 && (
        <section className="py-20 bg-card/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-10">
              Our Agents
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {regularAgents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          </div>
        </section>
      )}

      {agents.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-muted-foreground text-lg">No agents available at the moment.</p>
        </div>
      )}

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Ready to Find Your Dream Home?
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Get in touch with one of our expert agents today and let us help you discover the perfect property in Dubai.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="tel:+971500000000"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-accent text-background font-semibold hover:shadow-lg hover:shadow-accent/30 transition-all duration-300"
            >
              <Phone className="w-5 h-5" />
              Call Us Now
            </a>
            <a
              href="/contacts"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border border-border hover:border-accent/50 hover:bg-accent/5 transition-all duration-300"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
