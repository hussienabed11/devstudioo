import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Clock, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Job {
  id: string;
  title_en: string;
  title_ar: string;
  slug: string;
  short_description_en: string;
  short_description_ar: string;
  job_type: string;
  location_en: string;
  location_ar: string;
  department_en: string | null;
  department_ar: string | null;
  application_deadline: string | null;
  created_at: string;
}

const jobTypeLabels: Record<string, { en: string; ar: string }> = {
  'full-time': { en: 'Full-time', ar: 'دوام كامل' },
  'part-time': { en: 'Part-time', ar: 'دوام جزئي' },
  'internship': { en: 'Internship', ar: 'تدريب' },
  'contract': { en: 'Contract', ar: 'عقد' },
};

export default function Careers() {
  const { language, dir } = useLanguage();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('id, title_en, title_ar, slug, short_description_en, short_description_ar, job_type, location_en, location_ar, department_en, department_ar, application_deadline, created_at')
          .eq('status', 'open')
          .order('display_order', { ascending: true });

        if (error) throw error;
        setJobs(data || []);
      } catch (err) {
        console.error('Error fetching jobs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const isAr = language === 'ar';

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-1">
              {isAr ? 'الوظائف' : 'Careers'}
            </Badge>
            <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${dir === 'rtl' ? 'font-arabic-heading' : ''}`}>
              {isAr ? 'انضم إلى فريقنا' : 'Join Our Team'}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {isAr
                ? 'اكتشف الفرص المتاحة وكن جزءاً من فريق يبني المستقبل الرقمي.'
                : 'Discover open opportunities and become part of a team building the digital future.'}
            </p>
          </motion.div>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : jobs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 text-muted-foreground"
            >
              <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-xl">
                {isAr ? 'لا توجد وظائف متاحة حالياً. تابعنا للتحديثات!' : 'No open positions right now. Check back soon!'}
              </p>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job, index) => {
                const title = isAr ? job.title_ar : job.title_en;
                const description = isAr ? job.short_description_ar : job.short_description_en;
                const location = isAr ? job.location_ar : job.location_en;
                const typeLabel = jobTypeLabels[job.job_type]?.[language] || job.job_type;

                return (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300 flex flex-col"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className={`text-xl font-bold ${dir === 'rtl' ? 'font-arabic-heading' : ''}`}>
                        {title}
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary" className="text-xs">
                        <Briefcase className="w-3 h-3 mr-1" />
                        {typeLabel}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <MapPin className="w-3 h-3 mr-1" />
                        {location}
                      </Badge>
                    </div>

                    <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
                      {description}
                    </p>

                    {job.application_deadline && (
                      <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {isAr ? 'آخر موعد: ' : 'Deadline: '}
                        {new Date(job.application_deadline).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                      </p>
                    )}

                    <div className="flex gap-3 mt-auto">
                      <Link to={`/careers/${job.slug}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          {isAr ? 'التفاصيل' : 'Read More'}
                        </Button>
                      </Link>
                      <Link to={`/careers/${job.slug}?apply=true`} className="flex-1">
                        <Button className="w-full bg-gradient-brand text-white">
                          {isAr ? 'قدّم الآن' : 'Apply Now'}
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
