import React, { forwardRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Linkedin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useContactInfo } from '@/hooks/useContactInfo';

const TikTokIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78 2.92 2.92 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.57 6.33 6.33 0 0 0 9.37 22a6.33 6.33 0 0 0 6.37-6.23V9.4a8.16 8.16 0 0 0 3.85.96V7.04a4.85 4.85 0 0 1-3.85-.35z"/>
  </svg>
);

const Footer = forwardRef<HTMLElement>((_, ref) => {
  const { t, language, dir } = useLanguage();
  const { contactInfo } = useContactInfo();
  const location = useLocation();
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  const quickLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/#about', label: t('nav.about') },
    { href: '/#services', label: t('nav.services') },
    { href: '/#portfolio', label: t('nav.portfolio') },
    { href: '/#packages', label: t('packages') },
    { href: '/careers', label: language === 'ar' ? 'الوظائف' : 'Careers' },
    { href: '/#booking', label: t('nav.booking') },
  ];

  const handleNavClick = (href: string) => {
    if (href === '/') {
      if (location.pathname === '/') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        navigate('/');
      }
      return;
    }
    if (href.startsWith('/#')) {
      const elementId = href.replace('/#', '');
      if (location.pathname === '/') {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        navigate('/', { state: { scrollTo: elementId } });
      }
    }
  };

  const socialLinks = [
    { url: (contactInfo as any)?.facebook_url, icon: <Facebook className="w-5 h-5" />, label: 'Facebook' },
    { url: (contactInfo as any)?.linkedin_url, icon: <Linkedin className="w-5 h-5" />, label: 'LinkedIn' },
    { url: (contactInfo as any)?.tiktok_url, icon: <TikTokIcon />, label: 'TikTok' },
  ].filter(s => s.url && s.url.trim());

  return (
    <footer ref={ref} className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden flex items-center justify-center">
                <img src="/Vetrex.png" alt="Vertex Solutions Logo" className="w-full h-full object-contain" />
              </div>
            </Link>
            <p className={`text-muted-foreground leading-relaxed ${dir === 'rtl' ? 'font-arabic' : ''}`}>
              {t('footer.description')}
            </p>

            {/* Social Media Icons */}
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-3 mt-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary flex items-center justify-center text-muted-foreground transition-colors"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={`font-bold text-lg mb-4 ${dir === 'rtl' ? 'font-arabic-heading' : ''}`}>
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  {link.href.startsWith('/#') || link.href === '/' ? (
                    <a
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick(link.href);
                      }}
                      className={`text-muted-foreground hover:text-primary transition-colors ${dir === 'rtl' ? 'font-arabic' : ''}`}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      className={`text-muted-foreground hover:text-primary transition-colors ${dir === 'rtl' ? 'font-arabic' : ''}`}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className={`font-bold text-lg mb-4 ${dir === 'rtl' ? 'font-arabic-heading' : ''}`}>
              {t('services.title')}
            </h4>
            <ul className="space-y-3">
              {[
                'services.uiux.title',
                'services.web.title',
                'services.mobile.title',
                'services.seo.title',
                'services.hosting.title',
                'services.customization.title',
              ].map((key) => (
                <li key={key}>
                  <span className={`text-muted-foreground ${dir === 'rtl' ? 'font-arabic' : ''}`}>
                    {t(key)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className={`font-bold text-lg mb-4 ${dir === 'rtl' ? 'font-arabic-heading' : ''}`}>
              {t('footer.contact')}
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{contactInfo?.email || ''}</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground" dir="ltr">
                  {contactInfo?.phone || ''}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span className={`text-muted-foreground ${dir === 'rtl' ? 'font-arabic' : ''}`}>
                  {language === 'ar'
                    ? contactInfo?.address_ar || ''
                    : contactInfo?.address_en || ''}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className={`text-sm text-muted-foreground ${dir === 'rtl' ? 'font-arabic' : ''}`}>
            © {year} Vertex Solutions. {t('footer.rights')}
          </p>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">
              {language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              {language === 'ar' ? 'الشروط والأحكام' : 'Terms of Service'}
            </a>
          </div>

          <p className="mt-4 text-xs text-muted-foreground italic w-full text-center">
            {language === 'ar'
              ? <>تم الإنشاء بواسطة <span className="text-primary">حسين عابد</span></>
              : <>Created by <span className="text-primary">Hussien Abed</span></>}
          </p>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;
