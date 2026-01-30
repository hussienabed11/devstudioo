import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, Sparkles, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface Package {
  id: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  features_en: string[];
  features_ar: string[];
  marketing_text_en: string | null;
  marketing_text_ar: string | null;
  starting_price: string;
  cta_text_en: string | null;
  cta_text_ar: string | null;
  cta_link: string | null;
  is_featured: boolean;
  display_order: number;
}

export default function PackagesSection() {
  const { language, dir, t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const { data, error } = await supabase
          .from('packages')
          .select('*')
          .eq('status', 'active')
          .order('display_order', { ascending: true });

        if (error) throw error;
        setPackages(data || []);
      } catch (error) {
        console.error('Error fetching packages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const handleCTAClick = (pkg: Package) => {
    if (pkg.cta_link) {
      window.open(pkg.cta_link, '_blank');
    } else {
      const bookingSection = document.getElementById('booking');
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  if (loading) {
    return (
      <section className="py-20 md:py-32 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </section>
    );
  }

  return (
    <section id="packages" className="py-20 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4" ref={ref}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary mb-4">
            {t('packages.badge')}
          </span>
          <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 ${dir === 'rtl' ? 'font-arabic-heading' : ''}`}>
            {t('packages.title')}
          </h2>
          <p className={`text-lg text-muted-foreground ${dir === 'rtl' ? 'font-arabic' : ''}`}>
            {t('packages.subtitle')}
          </p>
        </motion.div>

        {/* Packages Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative group bg-card border rounded-2xl p-6 md:p-8 hover:shadow-xl transition-all duration-300 ${
                pkg.is_featured 
                  ? 'border-primary/50 shadow-lg shadow-primary/10' 
                  : 'border-border hover:border-primary/30'
              }`}
            >
              {/* Featured Badge */}
              {pkg.is_featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1 px-3 py-1 bg-gradient-brand rounded-full text-xs font-medium text-primary-foreground">
                    <Sparkles className="w-3 h-3" />
                    {language === 'ar' ? 'الأكثر شعبية' : 'Most Popular'}
                  </div>
                </div>
              )}

              {/* Package Name */}
              <h3 className={`text-xl md:text-2xl font-bold mb-3 ${dir === 'rtl' ? 'font-arabic-heading' : ''}`}>
                {language === 'ar' ? pkg.name_ar : pkg.name_en}
              </h3>

              {/* Description */}
              <p className={`text-muted-foreground mb-4 ${dir === 'rtl' ? 'font-arabic' : ''}`}>
                {language === 'ar' ? pkg.description_ar : pkg.description_en}
              </p>

              {/* Price */}
              <div className="mb-6">
                <span className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'يبدأ من' : 'Starting From'}
                </span>
                <div className="text-2xl md:text-3xl font-bold text-gradient">
                  {pkg.starting_price}
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {(language === 'ar' ? pkg.features_ar : pkg.features_en).map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-secondary" />
                    </div>
                    <span className={`text-sm text-muted-foreground ${dir === 'rtl' ? 'font-arabic' : ''}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Marketing Text */}
              {(language === 'ar' ? pkg.marketing_text_ar : pkg.marketing_text_en) && (
                <p className={`text-sm italic text-muted-foreground border-t border-border pt-4 mb-6 ${dir === 'rtl' ? 'font-arabic' : ''}`}>
                  "{language === 'ar' ? pkg.marketing_text_ar : pkg.marketing_text_en}"
                </p>
              )}

              {/* CTA Button */}
              <Button
                onClick={() => handleCTAClick(pkg)}
                className={`w-full ${pkg.is_featured ? 'bg-gradient-brand hover:opacity-90' : ''}`}
                variant={pkg.is_featured ? 'default' : 'outline'}
              >
                {language === 'ar' ? pkg.cta_text_ar : pkg.cta_text_en}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Note */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className={`text-center text-sm text-muted-foreground mt-8 ${dir === 'rtl' ? 'font-arabic' : ''}`}
        >
          {t('packages.note')}
        </motion.p>
      </div>
    </section>
  );
}
