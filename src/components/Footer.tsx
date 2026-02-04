import React, { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useContactInfo } from '@/hooks/useContactInfo';

const Footer = forwardRef<HTMLElement>((_, ref) => {
  const { t, language, dir } = useLanguage();
  const { contactInfo } = useContactInfo();
  const year = new Date().getFullYear();

  const quickLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/#about', label: t('nav.about') },
    { href: '/#services', label: t('nav.services') },
    { href: '/#portfolio', label: t('nav.portfolio') },
    { href: '/#packages', label: t('packages') },
    { href: '/#booking', label: t('nav.booking') },
  ];

  const handleNavClick = (href: string) => {
    if (href.startsWith('/#')) {
      const elementId = href.replace('/#', '');
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer ref={ref} className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center">
                <img
                  src="/Vertex.png"
                  alt="Vertex Solutions Logo"
                  className="w-full h-full object-contain"
                />
              </div>

              <span
                className={`font-bold text-xl ${
                  dir === 'rtl' ? 'font-arabic-heading text-foreground/90' : ''
                }`}
              >
                Vertex Solutions
              </span>
            </Link>

            <p
              className={`text-muted-foreground leading-relaxed ${
                dir === 'rtl' ? 'font-arabic' : ''
              }`}
            >
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={`font-bold text-lg mb-4 ${dir === 'rtl' ? 'font-arabic-heading' : ''}`}>
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      if (link.href.startsWith('/#')) {
                        e.preventDefault();
                        handleNavClick(link.href);
                      }
                    }}
                    className={`text-muted-foreground hover:text-primary transition-colors ${
                      dir === 'rtl' ? 'font-arabic' : ''
                    }`}
                  >
                    {link.label}
                  </a>
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
                  {contactInfo?.phone || '01017080519'}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span className={`text-muted-foreground ${dir === 'rtl' ? 'font-arabic' : ''}`}>
                  {language === 'ar'
                    ? contactInfo?.address_ar || 'نعمل عن بعد'
                    : contactInfo?.address_en || 'Remote'}
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
