import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Briefcase, MapPin, Building2, Clock, Calendar, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import JobApplicationForm from '@/components/careers/JobApplicationForm';

interface Job {
  id: string;
  title_en: string;
  title_ar: string;
  slug: string;
  short_description_en: string;
  short_description_ar: string;
  full_description_en: string;
  full_description_ar: string;
  responsibilities_en: string;
  responsibilities_ar: string;
  requirements_en: string;
  requirements_ar: string;
  nice_to_have_en: string | null;
  nice_to_have_ar: string | null;
  benefits_en: string | null;
  benefits_ar: string | null;
  job_type: string;
  department_en: string | null;
  department_ar: string | null;
  location_en: string;
  location_ar: string;
  application_deadline: string | null;
  created_at: string;
}

const jobTypeLabels: Record<string, { en: string; ar: string }> = {
  'full-time': { en: 'Full-time', ar: 'دوام كامل' },
  'part-time': { en: 'Part-time', ar: 'دوام جزئي' },
  'internship': { en: 'Internship', ar: 'تدريب' },
  'contract': { en: 'Contract', ar: 'عقد' },
};

export default function JobDetails() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const { language, dir } = useLanguage();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(searchParams.get('apply') === 'true');
  const formRef = useRef<HTMLDivElement>(null);
  const isAr = language === 'ar';

  useEffect(() => {
    const fetchJob = async () => {
      if (!slug) return;
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'open')
          .maybeSingle();

        if (error) throw error;
        setJob(data);
      } catch (err) {
        console.error('Error fetching job:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [slug]);

  useEffect(() => {
    if (showForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showForm]);

  const renderSection = (title: string, content: string | null) => {
    if (!content || content.trim() === '') return null;
    const lines = content.split('\n').filter(l => l.trim());
    return (
      <div className="mb-8">
        <h3 className={`text-xl font-bold mb-3 ${dir === 'rtl' ? 'font-arabic-heading' : ''}`}>{title}</h3>
        <ul className="space-y-2">
          {lines.map((line, i) => (
            <li key={i} className="flex items-start gap-2 text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span>{line.replace(/^[-•*]\s*/, '')}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center pt-32 pb-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex flex-col items-center justify-center pt-32 pb-20 text-center">
          <Briefcase className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-2xl font-bold mb-2">{isAr ? 'الوظيفة غير موجودة' : 'Job Not Found'}</h2>
          <p className="text-muted-foreground mb-6">
            {isAr ? 'هذه الوظيفة قد تكون أغلقت أو تم حذفها.' : 'This position may have been closed or removed.'}
          </p>
          <Link to="/careers">
            <Button>{isAr ? 'تصفح الوظائف' : 'Browse Jobs'}</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const title = isAr ? job.title_ar : job.title_en;
  const typeLabel = jobTypeLabels[job.job_type]?.[language] || job.job_type;
  const location = isAr ? job.location_ar : job.location_en;
  const department = isAr ? job.department_ar : job.department_en;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back */}
          <Link to="/careers" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
            {isAr ? 'جميع الوظائف' : 'All Jobs'}
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Header */}
            <div className="bg-card border border-border rounded-xl p-6 md:p-8 mb-8">
              <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${dir === 'rtl' ? 'font-arabic-heading' : ''}`}>
                {title}
              </h1>
              <div className="flex flex-wrap gap-3 mb-4">
                <Badge variant="secondary">
                  <Briefcase className="w-3.5 h-3.5 mr-1" /> {typeLabel}
                </Badge>
                <Badge variant="outline">
                  <MapPin className="w-3.5 h-3.5 mr-1" /> {location}
                </Badge>
                {department && department.trim() && (
                  <Badge variant="outline">
                    <Building2 className="w-3.5 h-3.5 mr-1" /> {department}
                  </Badge>
                )}
                {job.application_deadline && (
                  <Badge variant="outline">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    {isAr ? 'آخر موعد: ' : 'Deadline: '}
                    {new Date(job.application_deadline).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {isAr ? job.short_description_ar : job.short_description_en}
              </p>
            </div>

            {/* Body */}
            <div className="bg-card border border-border rounded-xl p-6 md:p-8 mb-8">
              {renderSection(isAr ? 'الوصف الوظيفي' : 'Job Description', isAr ? job.full_description_ar : job.full_description_en)}
              {renderSection(isAr ? 'المسؤوليات' : 'Responsibilities', isAr ? job.responsibilities_ar : job.responsibilities_en)}
              {renderSection(isAr ? 'المتطلبات' : 'Requirements', isAr ? job.requirements_ar : job.requirements_en)}
              {renderSection(isAr ? 'مهارات إضافية' : 'Nice to Have', isAr ? job.nice_to_have_ar : job.nice_to_have_en)}
              {renderSection(isAr ? 'المزايا' : 'Benefits', isAr ? job.benefits_ar : job.benefits_en)}
            </div>

            {/* Apply CTA */}
            {!showForm && (
              <div className="text-center">
                <Button
                  size="lg"
                  className="bg-gradient-brand text-white px-10"
                  onClick={() => setShowForm(true)}
                >
                  {isAr ? 'قدّم الآن' : 'Apply Now'}
                </Button>
              </div>
            )}

            {/* Application Form */}
            {showForm && (
              <div ref={formRef}>
                <JobApplicationForm jobId={job.id} jobTitle={title} />
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
