import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, Upload, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface Props {
  jobId: string;
  jobTitle: string;
}

const experienceOptions = [
  { value: '0-1', en: '0–1 years', ar: '0–1 سنة' },
  { value: '1-3', en: '1–3 years', ar: '1–3 سنوات' },
  { value: '3-5', en: '3–5 years', ar: '3–5 سنوات' },
  { value: '5-10', en: '5–10 years', ar: '5–10 سنوات' },
  { value: '10+', en: '10+ years', ar: '10+ سنوات' },
];

export default function JobApplicationForm({ jobId, jobTitle }: Props) {
  const { language, dir } = useLanguage();
  const isAr = language === 'ar';

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    linkedin_url: '',
    portfolio_url: '',
    years_of_experience: '0-1',
    cover_letter: '',
  });

  const update = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast.error(isAr ? 'يرجى رفع ملف PDF أو DOC فقط' : 'Please upload a PDF or DOC file only');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error(isAr ? 'حجم الملف يجب أن يكون أقل من 10 ميجابايت' : 'File size must be less than 10MB');
      return;
    }
    setCvFile(file);
    if (errors.cv) setErrors(prev => ({ ...prev, cv: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.full_name.trim()) newErrors.full_name = isAr ? 'الاسم مطلوب' : 'Full name is required';
    if (!form.email.trim()) newErrors.email = isAr ? 'البريد الإلكتروني مطلوب' : 'Email is required';
    if (!form.phone.trim()) newErrors.phone = isAr ? 'رقم الهاتف مطلوب' : 'Phone number is required';
    if (!cvFile) newErrors.cv = isAr ? 'السيرة الذاتية مطلوبة' : 'CV / Resume is required';
    if (!form.cover_letter.trim()) newErrors.cover_letter = isAr ? 'الرسالة التعريفية مطلوبة' : 'Cover letter is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error(isAr ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      let cvUrl = '';

      if (cvFile) {
        const ext = cvFile.name.split('.').pop();
        const filePath = `${jobId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('cv-uploads')
          .upload(filePath, cvFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('cv-uploads')
          .getPublicUrl(filePath);
        cvUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from('job_applications').insert({
        job_id: jobId,
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        linkedin_url: form.linkedin_url.trim(),
        portfolio_url: form.portfolio_url.trim(),
        years_of_experience: form.years_of_experience,
        cover_letter: form.cover_letter.trim(),
        cv_url: cvUrl,
      });

      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      console.error('Application submission error:', err);
      toast.error(isAr ? 'حدث خطأ أثناء الإرسال. حاول مرة أخرى.' : 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-xl p-8 text-center"
      >
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className={`text-2xl font-bold mb-2 ${dir === 'rtl' ? 'font-arabic-heading' : ''}`}>
          {isAr ? 'تم استلام طلبك!' : 'Application Received!'}
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          {isAr
            ? 'تم استلام طلبك بنجاح. سيقوم فريقنا بمراجعته والتواصل معك في حال تم ترشيحك.'
            : 'Your application has been received. Our team will review it and contact you if you are shortlisted.'}
        </p>
      </motion.div>
    );
  }

  const FieldError = ({ field }: { field: string }) => {
    if (!errors[field]) return null;
    return (
      <p className="text-destructive text-xs mt-1 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" /> {errors[field]}
      </p>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-6 md:p-8"
    >
      <h3 className={`text-2xl font-bold mb-1 ${dir === 'rtl' ? 'font-arabic-heading' : ''}`}>
        {isAr ? 'تقديم طلب' : 'Apply for this Position'}
      </h3>
      <p className="text-muted-foreground mb-6">{jobTitle}</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label>{isAr ? 'الاسم الكامل' : 'Full Name'} *</Label>
            <Input
              value={form.full_name}
              onChange={e => update('full_name', e.target.value)}
              placeholder={isAr ? 'أدخل اسمك الكامل' : 'Enter your full name'}
              className={errors.full_name ? 'border-destructive' : ''}
            />
            <FieldError field="full_name" />
          </div>

          <div className="space-y-2">
            <Label>{isAr ? 'البريد الإلكتروني' : 'Email Address'} *</Label>
            <Input
              type="email"
              value={form.email}
              onChange={e => update('email', e.target.value)}
              placeholder={isAr ? 'بريدك الإلكتروني' : 'your@email.com'}
              className={errors.email ? 'border-destructive' : ''}
            />
            <FieldError field="email" />
          </div>

          <div className="space-y-2">
            <Label>{isAr ? 'رقم الهاتف' : 'Phone Number'} *</Label>
            <Input
              type="tel"
              dir="ltr"
              value={form.phone}
              onChange={e => update('phone', e.target.value)}
              placeholder="+20 1234567890"
              className={errors.phone ? 'border-destructive' : ''}
            />
            <FieldError field="phone" />
          </div>

          <div className="space-y-2">
            <Label>{isAr ? 'سنوات الخبرة' : 'Years of Experience'}</Label>
            <Select value={form.years_of_experience} onValueChange={v => update('years_of_experience', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {experienceOptions.map(o => (
                  <SelectItem key={o.value} value={o.value}>
                    {isAr ? o.ar : o.en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>LinkedIn ({isAr ? 'اختياري' : 'optional'})</Label>
            <Input
              dir="ltr"
              value={form.linkedin_url}
              onChange={e => update('linkedin_url', e.target.value)}
              placeholder="https://linkedin.com/in/..."
            />
          </div>

          <div className="space-y-2">
            <Label>{isAr ? 'الموقع / البورتفوليو' : 'Portfolio / Website'} ({isAr ? 'اختياري' : 'optional'})</Label>
            <Input
              dir="ltr"
              value={form.portfolio_url}
              onChange={e => update('portfolio_url', e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>

        {/* CV Upload - Required */}
        <div className="space-y-2">
          <Label>{isAr ? 'السيرة الذاتية (PDF أو DOC)' : 'Resume / CV (PDF or DOC)'} *</Label>
          <div className={`border-2 border-dashed rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer relative ${errors.cv ? 'border-destructive' : 'border-border'}`}>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {cvFile ? cvFile.name : (isAr ? 'اضغط لرفع ملف أو اسحبه هنا' : 'Click to upload or drag and drop')}
            </p>
          </div>
          <FieldError field="cv" />
        </div>

        {/* Cover Letter - Required */}
        <div className="space-y-2">
          <Label>{isAr ? 'رسالة تعريفية' : 'Cover Letter / Message'} *</Label>
          <Textarea
            value={form.cover_letter}
            onChange={e => update('cover_letter', e.target.value)}
            placeholder={isAr ? 'أخبرنا لماذا أنت مناسب لهذا الدور...' : 'Tell us why you are a great fit for this role...'}
            rows={5}
            className={errors.cover_letter ? 'border-destructive' : ''}
          />
          <FieldError field="cover_letter" />
        </div>

        <Button
          type="submit"
          disabled={submitting}
          size="lg"
          className="w-full bg-gradient-brand text-white"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              {isAr ? 'جاري الإرسال...' : 'Submitting...'}
            </>
          ) : (
            isAr ? 'إرسال الطلب' : 'Submit Application'
          )}
        </Button>
      </form>
    </motion.div>
  );
}
