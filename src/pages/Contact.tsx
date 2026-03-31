import { MapPin, Clock, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Contact() {
  const { user } = useAuth();
  const userName = user?.username || 'Guest';
  const whatsappMessage = `Hello, I am ${userName}, I have a query about your products and services.`;
  const whatsappUrl = `https://wa.me/919014627762?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="section container animate-fade-in" style={{ padding: '3rem 1.5rem', minHeight: '80vh' }}>
      <div className="text-center mb-10" style={{ marginBottom: '4rem' }}>
        <h1 className="heading-lg" style={{ marginBottom: '1rem' }}>Get in Touch</h1>
        <p className="text-muted" style={{ maxWidth: '600px', margin: '0 auto' }}>
          Have questions about our products or need assistance? We're here to help you make the best choice for your home.
        </p>
      </div>

      <div className="grid grid-cols-1 md-grid-cols-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', display: 'grid' }}>
        {/* Contact info card */}
        <div className="card glass flex-col" style={{ padding: '3rem 2rem', gap: '2rem', display: 'flex' }}>
          <h2 className="heading-md" style={{ marginBottom: '1rem' }}>Contact Information</h2>

          <div className="flex" style={{ gap: '1.5rem', alignItems: 'flex-start' }}>
            <div style={{ background: 'rgba(30, 58, 138, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--color-primary)' }}>
              <MapPin size={24} />
            </div>
            <div>
              <h3 className="heading-sm mb-2" style={{ marginBottom: '0.25rem' }}>Store Address</h3>
              <p className="text-muted">Gundaram, Kamanpur X-Road<br />Peddapalli, Telangana 505188</p>
            </div>
          </div>

          {/* <div className="flex" style={{ gap: '1.5rem', alignItems: 'flex-start' }}>
            <div style={{ background: 'rgba(30, 58, 138, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--color-primary)' }}>
              <Phone size={24} />
            </div>
            <div>
              <h3 className="heading-sm mb-2" style={{ marginBottom: '0.25rem' }}>Phone Number</h3>
              <p className="text-muted">+91 99599 16507</p>
            </div>
          </div>

          <div className="flex" style={{ gap: '1.5rem', alignItems: 'flex-start' }}>
            <div style={{ background: 'rgba(30, 58, 138, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--color-primary)' }}>
              <Mail size={24} />
            </div>
            <div>
              <h3 className="heading-sm mb-2" style={{ marginBottom: '0.25rem' }}>Email Address</h3>
              <p className="text-muted">k.heman0123@gmail.com</p>
            </div>
          </div> */}

          <div className="flex" style={{ gap: '1.5rem', alignItems: 'flex-start' }}>
            <div style={{ background: 'rgba(30, 58, 138, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--color-primary)' }}>
              <Clock size={24} />
            </div>
            <div>
              <h3 className="heading-sm mb-2" style={{ marginBottom: '0.25rem' }}>Business Hours</h3>
              <p className="text-muted">Sunday - Saturday: 9:00 AM - 8:30 PM<br /></p>
            </div>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid #e2e8f0' }}>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn btn-whatsapp w-full flex-center" style={{ width: '100%' }}>
              <MessageCircle size={24} style={{ marginRight: '0.5rem' }} /> Contact on WhatsApp
            </a>
          </div>
        </div>

        {/* Map */}
        <div className="card glass" style={{ overflow: 'hidden', minHeight: '400px', display: 'flex' }}>
          <iframe
            title="Heman Enterprises Location"
            src="https://www.google.com/maps/embed?pb=!1m10!1m8!1m3!1d254.73827111211992!2d79.49510256127091!3d18.643180380204743!3m2!1i1024!2i768!4f13.1!5e1!3m2!1sen!2sin!4v1774082746542!5m2!1sen!2sin"
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: '400px' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
}

export default Contact;
