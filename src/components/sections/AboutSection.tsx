import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Clock, Briefcase, Users, HeadphonesIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AboutSection() {
  const { t, dir } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const stats = [
    { icon: Clock, value: '3+', label: t('about.experience') },
    { icon: Briefcase, value: '50+', label: t('about.projects') },
    { icon: Users, value: '30+', label: t('about.clients') },
    { icon: HeadphonesIcon, value: '24/7', label: t('about.support') },
  ];

  return (
    <section id="about" className="py-20 md:py-32 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent -z-10" />
      
      <div className="container mx-auto px-4" ref={ref}>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: dir === 'rtl' ? 50 : -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className={dir === 'rtl' ? 'lg:order-2' : ''}
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary mb-4">
              {t('about.subtitle')}
            </span>
            <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-6 ${dir === 'rtl' ? 'font-arabic-heading' : ''}`}>
              {t('about.title')}
            </h2>
            <p className={`text-lg text-muted-foreground leading-relaxed mb-8 ${dir === 'rtl' ? 'font-arabic' : ''}`}>
              {t('about.description')}
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-brand flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <stat.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gradient">{stat.value}</div>
                    <div className={`text-sm text-muted-foreground ${dir === 'rtl' ? 'font-arabic' : ''}`}>
                      {stat.label}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Image/Visual */}
          <motion.div
            initial={{ opacity: 0, x: dir === 'rtl' ? -50 : 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`relative ${dir === 'rtl' ? 'lg:order-1' : ''}`}
          >
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Main Circle */}
              <div className="absolute inset-0 rounded-full bg-gradient-brand opacity-10" />
              
              {/* Animated Rings */}
              <div className="absolute inset-8 rounded-full border-2 border-primary/20 animate-pulse" />
              <div className="absolute inset-16 rounded-full border-2 border-secondary/20 animate-pulse" style={{ animationDelay: '0.5s' }} />
              <div className="absolute inset-24 rounded-full border-2 border-primary/20 animate-pulse" style={{ animationDelay: '1s' }} />
              
              {/* Center Content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-gradient-brand flex items-center justify-center shadow-brand">
                  <span className="text-5xl font-bold text-primary-foreground">3+</span>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute top-10 right-10 w-16 h-16 rounded-xl bg-card border border-border shadow-lg flex items-center justify-center"
              >
                <Briefcase className="w-8 h-8 text-primary" />
              </motion.div>
              
              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute bottom-10 left-10 w-16 h-16 rounded-xl bg-card border border-border shadow-lg flex items-center justify-center"
              >
                <Users className="w-8 h-8 text-secondary" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
