import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Award, Users, Shield, Target, Check, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Award,
    titleEn: '3+ Years of Experience',
    titleAr: '+3 سنوات من الخبرة',
    descriptionEn: 'Battle-tested solutions from years of solving complex problems across various industries.',
    descriptionAr: 'حلول مجربة من سنوات حل المشكلات المعقدة عبر مختلف الصناعات.',
  },
  {
    icon: Users,
    titleEn: 'Professional Team',
    titleAr: 'فريق محترف',
    descriptionEn: 'Skilled developers, designers, and project managers dedicated to your success.',
    descriptionAr: 'مطورون ومصممون ومديرو مشاريع ماهرون ملتزمون بنجاحك.',
  },
  {
    icon: Shield,
    titleEn: 'High-Quality Delivery',
    titleAr: 'تسليم عالي الجودة',
    descriptionEn: 'We never compromise on quality. Every project meets the highest standards.',
    descriptionAr: 'لا نساوم أبدًا على الجودة. كل مشروع يلبي أعلى المعايير.',
  },
  {
    icon: Target,
    titleEn: 'Client-Focused Approach',
    titleAr: 'نهج يركز على العميل',
    descriptionEn: 'Your goals are our priority. We work closely with you at every step.',
    descriptionAr: 'أهدافك هي أولويتنا. نعمل معك عن كثب في كل خطوة.',
  },
];

const benefits = [
  { en: 'Agile development methodology', ar: 'منهجية التطوير الرشيقة' },
  { en: 'Regular progress updates', ar: 'تحديثات منتظمة للتقدم' },
  { en: 'Transparent communication', ar: 'تواصل شفاف' },
  { en: 'Post-launch support', ar: 'دعم ما بعد الإطلاق' },
  { en: 'Scalable solutions', ar: 'حلول قابلة للتوسع' },
  { en: 'Security best practices', ar: 'أفضل ممارسات الأمان' },
];

export default function RightChoiceSection() {
  const { language, dir } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const scrollToBooking = () => {
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-20 md:py-32 relative overflow-hidden bg-muted/30">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 -left-32 w-96 h-96 rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10" ref={ref}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary mb-4">
            {language === 'ar' ? 'لماذا نحن' : 'Why Choose Us'}
          </span>
          <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 ${dir === 'rtl' ? 'font-arabic-heading' : ''}`}>
            {language === 'ar' ? 'الخيار الصحيح' : 'The Right Choice'}
          </h2>
          <p className="text-lg text-muted-foreground">
            {language === 'ar' 
              ? 'شارك فريقًا ملتزمًا بنجاحك. إليك ما يميزنا.'
              : "Partner with a team that's committed to your success. Here's what sets us apart."}
          </p>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Side - Feature Cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
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
                    {language === 'ar' ? feature.titleAr : feature.titleEn}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? feature.descriptionAr : feature.descriptionEn}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Right Side - What You Get Card */}
          <motion.div
            initial={{ opacity: 0, x: dir === 'rtl' ? -30 : 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-card border border-border rounded-2xl p-8 lg:p-10 flex flex-col justify-between"
          >
            <div>
              <div className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-secondary/20 text-secondary mb-4">
                {language === 'ar' ? 'ما تحصل عليه' : 'What You Get'}
              </div>
              <h3 className={`text-2xl md:text-3xl font-bold mb-6 ${dir === 'rtl' ? 'font-arabic-heading' : ''}`}>
                {language === 'ar' ? 'كل ما تحتاجه للنجاح' : 'Everything You Need to Succeed'}
              </h3>
              
              <ul className="space-y-4 mb-8">
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-secondary" />
                    </div>
                    <span className="text-foreground">
                      {language === 'ar' ? benefit.ar : benefit.en}
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
              {language === 'ar' ? 'ابدأ مشروعك' : 'Start Your Project'}
              <ArrowRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${dir === 'rtl' ? 'mr-2 rotate-180 group-hover:-translate-x-1' : 'ml-2'}`} />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
