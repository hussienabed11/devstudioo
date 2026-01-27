import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Palette, Code2, Smartphone, Search, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ServicesSection() {
  const { t, dir } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const services = [
    {
      icon: Palette,
      title: t('services.uiux.title'),
      description: t('services.uiux.description'),
      color: 'from-primary to-primary/60',
    },
    {
      icon: Code2,
      title: t('services.web.title'),
      description: t('services.web.description'),
      color: 'from-secondary to-secondary/60',
    },
    {
      icon: Smartphone,
      title: t('services.mobile.title'),
      description: t('services.mobile.description'),
      color: 'from-primary to-secondary',
    },
    {
      icon: Search,
      title: t('services.seo.title'),
      description: t('services.seo.description'),
      color: 'from-secondary to-primary',
    },
  ];

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
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-card border border-border rounded-2xl p-6 md:p-8 hover:border-primary/30 transition-all duration-300 hover:shadow-xl overflow-hidden"
            >
              {/* Gradient Overlay on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              {/* Icon */}
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <service.icon className="w-7 h-7 text-primary-foreground" />
              </div>

              {/* Content */}
              <h3 className={`text-xl md:text-2xl font-bold mb-3 group-hover:text-gradient transition-colors ${dir === 'rtl' ? 'font-arabic-heading' : ''}`}>
                {service.title}
              </h3>
              <p className={`text-muted-foreground leading-relaxed ${dir === 'rtl' ? 'font-arabic' : ''}`}>
                {service.description}
              </p>

              {/* Arrow */}
              <div className={`absolute top-6 ${dir === 'rtl' ? 'left-6' : 'right-6'} w-10 h-10 rounded-full border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:bg-gradient-brand group-hover:border-transparent`}>
                <ArrowUpRight className={`w-5 h-5 text-muted-foreground group-hover:text-primary-foreground ${dir === 'rtl' ? 'rotate-180' : ''}`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
