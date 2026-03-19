import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Award, Users, Shield, Target, Check, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { useGroupedContent } from '@/hooks/useSectionContent';
import * as LucideIcons from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Award, Users, Shield, Target, Check,
};

function getIcon(name: string) {
  return ICON_MAP[name] || (LucideIcons as any)[name] || Award;
}

export default function RightChoiceSection() {
  const { language, dir } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { list: features, get, items } = useGroupedContent('why_choose_us', 'feature');

  // Get benefits
  const benefitItems = items
    .filter(i => i.content_key.match(/^benefit_\d+$/) && !i.content_key.includes('_title'))
    .sort((a, b) => a.display_order - b.display_order);

  const scrollToBooking = () => {
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-20 md:py-32 relative overflow-hidden bg-muted/30">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 -left-32 w-96 h-96 rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary mb-4">
            {get('badge')}
          </span>
          <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 ${dir === 'rtl' ? 'font-arabic-heading' : ''}`}>
            {get('title')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {get('subtitle')}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((feature, index) => {
              const Icon = getIcon(feature.icon || 'Award');
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className={`text-lg font-bold mb-2 ${dir === 'rtl' ? 'font-arabic-heading' : ''}`}>
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, x: dir === 'rtl' ? -30 : 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-card border border-border rounded-2xl p-8 lg:p-10 flex flex-col justify-between"
          >
            <div>
              <div className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-secondary/20 text-secondary mb-4">
                {get('what_you_get_label')}
              </div>
              <h3 className={`text-2xl md:text-3xl font-bold mb-6 ${dir === 'rtl' ? 'font-arabic-heading' : ''}`}>
                {get('what_you_get_title')}
              </h3>
              
              <ul className="space-y-4 mb-8">
                {benefitItems.map((benefit, index) => (
                  <motion.li
                    key={benefit.id}
                    initial={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-secondary" />
                    </div>
                    <span className="text-foreground">
                      {language === 'ar' ? benefit.content_ar : benefit.content_en}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <Button
              onClick={scrollToBooking}
              size="lg"
              className="w-full bg-gradient-brand hover:opacity-90 text-white group"
            >
              {get('cta_text')}
              <ArrowRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${dir === 'rtl' ? 'mr-2 rotate-180 group-hover:-translate-x-1' : 'ml-2'}`} />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
