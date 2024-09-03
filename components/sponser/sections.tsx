
type SponsorImage = {
    type: 'image';
    src: string;
    alt: string;
  };
  
  type SponsorComponent = {
    type: 'component';
    component: React.ReactNode;
  };
  
  type Sponsor = {
    id: number | string;
    name: string;
  } & (SponsorImage | SponsorComponent);
  

  interface SponsorSectionProps {
    sponsors: Sponsor[];
  }
  
export default function SponsorSection({ sponsors } : SponsorSectionProps) {

    return (
      <section className="py-8 sm:py-12 bg-gray-100">
        <div id="container" className="max-w-6xl mx-auto px-4">
          <div title="header" className="mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-center">Sponsors</h1>
          </div>
          <div title="content" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
          {sponsors.map((sponsor) => (
            <div key={sponsor.id} className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm">
              {sponsor.type === 'image' ? (
                <img 
                  src={sponsor.src} 
                  alt={sponsor.alt} 
                  className="max-w-full h-auto max-h-24 object-contain"
                  loading="lazy"
                />
              ) : (
                sponsor.component
              )}
            </div>
          ))}
        </div>
        </div>
      </section>
    );
  }