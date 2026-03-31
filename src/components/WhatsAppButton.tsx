import { MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function WhatsAppButton() {
  const { user } = useAuth();
  // const phoneNumber = '+919959916507';
  const whatsappNumber = '919014627762';
  const message = user
    ? `Hello, I am ${user.username}, I want to know more about your products and services.`
    : "Hello, I want to know more about your products and services.";

  const handleWhatsAppClick = () => {
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // const handlePhoneClick = () => {
  //   window.location.href = `tel:${phoneNumber}`;
  // };

  return (
    <div className="floating-contact-container">
      {/* <button
        onClick={handlePhoneClick}
        className="phone-float flex-center"
        aria-label="Call Us"
      >
        <Phone size={24} />
      </button> */}
      <button
        onClick={handleWhatsAppClick}
        className="whatsapp-float flex-center"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle size={32} />
      </button>
    </div>
  );
}

export default WhatsAppButton;
