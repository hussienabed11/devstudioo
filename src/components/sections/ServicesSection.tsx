import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Palette, Code2, Smartphone, Search, ArrowUpRight, Globe, Zap, Shield, Database, Cloud, Headphones, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

const iconMap: Record<string, React.ElementType> = {
  Palette,
  Code2,
  Smartphone,
  Search,
  Globe,
  Zap,
  Shield,
  Database,
  Cloud,
  Headphones,
};

const colorMap: Record<string, string> = {
  Palette: 'from-primary to-primary/60',
  Code2: 'from-secondary to-secondary/60',
  Smartphone: 'from-primary to-secondary',
  Search: 'from-secondary to-primary',
  Globe: 'from-primary to-primary/60',
  Zap: 'from-secondary to-secondary/60',
  Shield: 'from-primary to-secondary',
  Database: 'from-secondary to-primary',
  Cloud: 'from-primary to-primary/60',
  Headphones: 'from-secondary to-secondary/60',
};

interface Service {
  id: string;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  icon_name: string;
  display_order: number;
}

export default function ServicesSection() {
  const { t, language, dir } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('status', 'active')
          .order('display_order', { ascending: true });

        if (error) throw error;
        setServices(data || []);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
      <section id="services" className="py-20 md:py-32 bg-muted/30 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </section>
    );
  }

  // Empty state - show message instead of nothing
  if (!services || services.length === 0) {
    return (
      <section id="services" className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary mb-4">
            {t('services.subtitle')}
          </span>
          <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-6 ${dir === 'rtl' ? 'font-arabic-heading' : ''}`}>
            {t('services.title')}
          </h2>
          <p className={`text-muted-foreground ${dir === 'rtl' ? 'font-arabic' : ''}`}>
            {language === 'ar' ? 'لا توجد خدمات متاحة حالياً' : 'No services available at the moment'}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="py-20 md:py-32 bg-muted/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }} />

      <div className="container mx-auto px-4" ref={ref}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary mb-4">
            {t('services.subtitle')}
          </span>
          <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold ${dir === 'rtl' ? 'font-arabic-heading' : ''}`}>
            {t('services.title')}
          </h2>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {services.map((service, index) => {
            const IconComponent = iconMap[service.icon_name] || Palette;
            const color = colorMap[service.icon_name] || 'from-primary to-primary/60';
            
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative bg-card border border-border rounded-2xl p-6 md:p-8 hover:border-primary/30 transition-all duration-300 hover:shadow-xl overflow-hidden"
              >
                {/* Gradient Overlay on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="w-7 h-7 text-primary-foreground" />
                </div>

                {/* Content */}
                <h3 className={`text-xl md:text-2xl font-bold mb-3 group-hover:text-gradient transition-colors ${dir === 'rtl' ? 'font-arabic-heading' : ''}`}>
                  {language === 'ar' ? service.title_ar : service.title_en}
                </h3>
                <p className={`text-muted-foreground leading-relaxed ${dir === 'rtl' ? 'font-arabic' : ''}`}>
                  {language === 'ar' ? service.description_ar : service.description_en}
                </p>

                {/* Arrow */}
                <div className={`absolute top-6 ${dir === 'rtl' ? 'left-6' : 'right-6'} w-10 h-10 rounded-full border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:bg-gradient-brand group-hover:border-transparent`}>
                  <ArrowUpRight className={`w-5 h-5 text-muted-foreground group-hover:text-primary-foreground ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
