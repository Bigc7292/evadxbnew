import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found | EVA Real Estate Dubai',
  description: 'The page you are looking for does not exist.',
};

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <h1 className="font-heading text-6xl font-bold gradient-gold">404</h1>
        <h2 className="font-heading text-2xl font-semibold">Page Not Found</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <a
          href="/en"
          className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
}
