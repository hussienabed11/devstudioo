import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const projects = [
  {
    title: 'E-Commerce Platform',
    titleAr: 'منصة تجارة إلكترونية',
    category: 'Web Development',
    categoryAr: 'تطوير الويب',
    image: 'https://images.unsplash.com/photo-1661956602116-aa6865609028?w=800&q=80',
  },
  {
    title: 'Banking Mobile App',
    titleAr: 'تطبيق بنكي',
    category: 'Mobile Development',
    categoryAr: 'تطوير التطبيقات',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80',
  },
  {
    title: 'Healthcare Dashboard',
    titleAr: 'لوحة تحكم صحية',
    category: 'UI/UX Design',
    categoryAr: 'تصميم واجهات',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
  },
  {
    title: 'Real Estate Platform',
    titleAr: 'منصة عقارية',
    category: 'Web Development',
    categoryAr: 'تطوير الويب',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
  },
  {
    title: 'Fitness Tracking App',
    titleAr: 'تطبيق لياقة بدنية',
    category: 'Mobile Development',
    categoryAr: 'تطوير التطبيقات',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
  },
  {
    title: 'Restaurant Booking System',
    titleAr: 'نظام حجز مطاعم',
    category: 'Full Stack',
    categoryAr: 'تطوير متكامل',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
  },
];

export default function PortfolioSection() {
  const { t, language, dir } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="portfolio" className="py-20 md:py-32 relative overflow-hidden">
      <div className="container mx-auto px-4" ref={ref}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary mb-4">
            {t('portfolio.subtitle')}
          </span>
          <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold ${dir === 'rtl' ? 'font-arabic-heading' : ''}`}>
            {t('portfolio.title')}
          </h2>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/30 transition-all duration-300"
            >
              {/* Image */}
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={project.image}
                  alt={language === 'ar' ? project.titleAr : project.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary backdrop-blur-sm mb-2">
                  {language === 'ar' ? project.categoryAr : project.category}
                </span>
                <h3 className={`text-xl font-bold text-foreground mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${dir === 'rtl' ? 'font-arabic-heading' : ''}`}>
                  {language === 'ar' ? project.titleAr : project.title}
                </h3>
                <button className="inline-flex items-center gap-2 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:underline">
                  {t('portfolio.viewProject')}
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>

              {/* Corner Badge */}
              <div className={`absolute top-4 ${dir === 'rtl' ? 'left-4' : 'right-4'} w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                <ExternalLink className="w-5 h-5 text-primary" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
