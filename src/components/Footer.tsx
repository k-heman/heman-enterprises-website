import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

function Footer() {
  return (
    <footer className="glass-dark" style={{ background: 'var(--color-bg-dark)', color: 'var(--text-light)', padding: '4rem 0 2rem 0' }}>
      <div className="container grid grid-cols-1 md:grid-cols-3" style={{ gap: '3rem' }}>

        {/* About */}
        <div>
          <h3 className="heading-sm mb-4" style={{ marginBottom: '1rem', color: 'white' }}>Heman Enterprises</h3>
          <p className="text-muted" style={{ lineHeight: '1.8' }}>
            20+ Years of Trusted Quality & Service. We provide branded and durable home products with reliable after-sales service.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="heading-sm mb-4" style={{ marginBottom: '1rem', color: 'white' }}>Quick Links</h3>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <li><Link to="/products" className="text-muted hover:text-primary transition" style={{ transition: 'color 0.3s' }}>All Products</Link></li>
            <li><Link to="/contact" className="text-muted hover:text-primary transition">Contact Us</Link></li>
            <li><Link to="/login" className="text-muted hover:text-primary transition">Login / Signup</Link></li>
          </ul>
        </div>

        {/* Contact info */}
        <div>
          <h3 className="heading-sm mb-4" style={{ marginBottom: '1rem', color: 'white' }}>Store Location</h3>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-muted)' }}>
            <li className="flex" style={{ gap: '1rem', alignItems: 'flex-start' }}>
              <MapPin size={20} className="text-accent" />
              <span>Gundaram, Kamanpur X-Road<br />Peddapalli, Telangana 505188</span>
            </li>
            {/* <li className="flex" style={{ gap: '1rem', alignItems: 'center' }}>
              <Phone size={20} className="text-accent" />
              <span>+91 9014627762 <br />+91 99599 16507</span>
            </li>
            <li className="flex" style={{ gap: '1rem', alignItems: 'center' }}>
              <Mail size={20} className="text-accent" />
              <span>k.heman0123@gmail.com</span>
            </li> */}
          </ul>
        </div>
      </div>

      <div className="container" style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>Developed by <a href="https://www.linkedin.com/in/heman-k/" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-primary transition">K. Heman</a><br /> <br /> &copy; {new Date().getFullYear()} Heman Enterprises. All Rights Reserved. <br /><br /></p>
      </div>
    </footer>
  );
}

export default Footer;
