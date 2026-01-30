import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Search, PenTool, Code2, Rocket } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function HowWeWorkSection() {
  const { t, dir } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const steps = [
    {
      icon: Search,
      titleKey: 'howWeWork.step1.title',
      descKey: 'howWeWork.step1.desc',
      color: 'from-primary to-primary/60',
    },
    {
      icon: PenTool,
      titleKey: 'howWeWork.step2.title',
      descKey: 'howWeWork.step2.desc',
      color: 'from-secondary to-secondary/60',
    },
    {
      icon: Code2,
      titleKey: 'howWeWork.step3.title',
      descKey: 'howWeWork.step3.desc',
      color: 'from-primary to-secondary',
    },
    {
      icon: Rocket,
      titleKey: 'howWeWork.step4.title',
      descKey: 'howWeWork.step4.desc',
      color: 'from-secondary to-primary',
    },
  ];

  return (
    <section id="how-we-work" className="py-20 md:py-32 bg-muted/30 relative overflow-hidden">
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
            {t('howWeWork.badge')}
          </span>
          <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 ${dir === 'rtl' ? 'font-arabic-heading' : ''}`}>
            {t('howWeWork.title')}
          </h2>
          <p className={`text-lg text-muted-foreground ${dir === 'rtl' ? 'font-arabic' : ''}`}>
            {t('howWeWork.subtitle')}
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={`hidden lg:block absolute top-12 ${dir === 'rtl' ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} w-full h-0.5 bg-gradient-to-r from-border to-border/50 z-0`} />
              )}

              <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-xl relative z-10">
                {/* Step Number */}
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon className="w-7 h-7 text-primary-foreground" />
                </div>

                {/* Content */}
                <h3 className={`text-lg font-bold mb-2 ${dir === 'rtl' ? 'font-arabic-heading' : ''}`}>
                  {t(step.titleKey)}
                </h3>
                <p className={`text-sm text-muted-foreground ${dir === 'rtl' ? 'font-arabic' : ''}`}>
                  {t(step.descKey)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Support Emphasis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-secondary/10 rounded-full border border-secondary/20">
            <Rocket className="w-5 h-5 text-secondary" />
            <span className={`text-sm font-medium ${dir === 'rtl' ? 'font-arabic' : ''}`}>
              {t('howWeWork.support')}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
