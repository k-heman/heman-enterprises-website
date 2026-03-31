import { MessageCircle, CheckCircle, Clock, Shield } from 'lucide-react';

function About() {
  const whatsappMessage = "Hi, I am interested in learning more about your products.";
  const whatsappUrl = `https://wa.me/919014627762?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="section container animate-fade-in" style={{ padding: '3rem 1.5rem', minHeight: '80vh' }}>
      <div className="text-center mb-10" style={{ marginBottom: '4rem' }}>
        <h1 className="heading-lg" style={{ marginBottom: '1rem' }}>About Heman Enterprises</h1>
        <p className="text-muted" style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
          Discover our story and the values we bring to your home.
        </p>
      </div>

      <div className="grid grid-cols-1 md-grid-cols-2" style={{ gap: '4rem', alignItems: 'flex-start', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>

        {/* Main Content / Company Story */}
        <div className="card glass" style={{ padding: '3rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 className="heading-md">Our Story</h2>
          <p className="text-muted" style={{ lineHeight: '1.8', fontSize: '1.05rem' }}>
            For over 15 years, Heman Enterprises has been the go-to destination for quality home products in our community. What started as a small neighbourhood shop has grown into a trusted name for furniture, mattresses, gas stoves, and everyday home essentials.
          </p>
          <p className="text-muted" style={{ lineHeight: '1.8', fontSize: '1.05rem' }}>
            We believe every home deserves well-crafted products at honest prices. Our team personally selects each item to ensure durability, comfort, and value — so you can furnish your home with confidence. Whether you need a sturdy bureau for your bedroom, a comfortable mattress for restful nights, or a reliable gas stove for your kitchen — we've got you covered.
          </p>

          <div style={{ marginTop: '2rem' }}>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-whatsapp"
              style={{ padding: '1rem 2rem', fontSize: '1.1rem', display: 'inline-flex', alignItems: 'center', gap: '0.8rem' }}
            >
              <MessageCircle size={24} /> Reach out to us on WhatsApp
            </a>
          </div>
        </div>

        {/* Owner Profile Section */}
        <div className="card glass flex-col flex-center text-center" style={{ padding: '4rem 2rem', background: 'linear-gradient(to bottom right, #ffffff, #f1f5f9)' }}>
          <div
            style={{
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: '#e2e8f0',
              marginBottom: '2rem',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              border: '4px solid white'
            }}
          >
            {/* Owner Portrait Image */}
            <img
              src="/owner.jpg"
              alt="Ownerportrait"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/180?text=Owner'; }}
            />
          </div>
          <h3 className="heading-md" style={{ marginBottom: '0.5rem', color: 'var(--color-primary)' }}>K. John</h3>
          <p className="text-muted" style={{ fontSize: '1.2rem', fontWeight: '500', marginBottom: '1.5rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Shop Owner</p>

          <div className="flex-center" style={{ gap: '1.5rem', marginTop: '1rem' }}>
            <div className="flex-col flex-center" style={{ gap: '0.5rem' }}>
              <div style={{ padding: '0.8rem', background: 'rgba(30, 58, 138, 0.1)', borderRadius: '50%', color: 'var(--color-primary)' }}><Clock size={20} /></div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>20+ Years</span>
            </div>
            <div className="flex-col flex-center" style={{ gap: '0.5rem' }}>
              <div style={{ padding: '0.8rem', background: 'rgba(30, 58, 138, 0.1)', borderRadius: '50%', color: 'var(--color-primary)' }}><Shield size={20} /></div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Trusted</span>
            </div>
            <div className="flex-col flex-center" style={{ gap: '0.5rem' }}>
              <div style={{ padding: '0.8rem', background: 'rgba(30, 58, 138, 0.1)', borderRadius: '50%', color: 'var(--color-primary)' }}><CheckCircle size={20} /></div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Quality</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default About;
