import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Calendar, Clock, Mail, Phone, User, MessageSquare, CheckCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const services = [
  { value: 'uiux', labelEn: 'UI/UX Design', labelAr: 'تصميم واجهات المستخدم' },
  { value: 'web', labelEn: 'Web Development', labelAr: 'تطوير المواقع' },
  { value: 'mobile', labelEn: 'Mobile Development', labelAr: 'تطوير التطبيقات' },
  { value: 'seo', labelEn: 'SEO Optimization', labelAr: 'تحسين محركات البحث' },
];

const timeSlots = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
];

export default function BookingSection() {
  const { t, language, dir } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    serviceType: '',
    preferredDate: '',
    preferredTime: '',
    message: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('bookings').insert({
        full_name: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        service_type: formData.serviceType,
        preferred_date: formData.preferredDate,
        preferred_time: formData.preferredTime,
        message: formData.message.trim() || null,
      });

      if (error) throw error;

      setIsSuccess(true);
      toast.success(t('booking.form.success'));
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        serviceType: '',
        preferredDate: '',
        preferredTime: '',
        message: '',
      });
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(language === 'ar' ? 'حدث خطأ. يرجى المحاولة مرة أخرى.' : 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="booking" className="py-20 md:py-32 bg-muted/30 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-primary/5 to-transparent -z-10" />
      
      <div className="container mx-auto px-4" ref={ref}>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Side - Info */}
          <motion.div
            initial={{ opacity: 0, x: dir === 'rtl' ? 50 : -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className={dir === 'rtl' ? 'lg:order-2' : ''}
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary mb-4">
              {t('booking.subtitle')}
            </span>
            <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-6 ${dir === 'rtl' ? 'font-arabic-heading' : ''}`}>
              {t('booking.title')}
            </h2>
            <p className={`text-lg text-muted-foreground leading-relaxed mb-8 ${dir === 'rtl' ? 'font-arabic' : ''}`}>
              {language === 'ar' 
                ? 'احجز استشارة مجانية مع فريقنا لمناقشة مشروعك والحصول على خطة عمل مخصصة.'
                : 'Book a free consultation with our team to discuss your project and get a customized action plan.'}
            </p>

            {/* Contact Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-brand flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</div>
                  <div className="font-medium">info@devstudio.com</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-brand flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{language === 'ar' ? 'الهاتف' : 'Phone'}</div>
                  <div className="font-medium" dir="ltr">+1 (555) 123-4567</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Form */}
          <motion.div
            initial={{ opacity: 0, x: dir === 'rtl' ? -50 : 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={dir === 'rtl' ? 'lg:order-1' : ''}
          >
            {isSuccess ? (
              <div className="bg-card border border-border rounded-2xl p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-secondary" />
                </div>
                <h3 className={`text-2xl font-bold mb-2 ${dir === 'rtl' ? 'font-arabic-heading' : ''}`}>
                  {language === 'ar' ? 'تم الإرسال بنجاح!' : 'Successfully Submitted!'}
                </h3>
                <p className={`text-muted-foreground ${dir === 'rtl' ? 'font-arabic' : ''}`}>
                  {t('booking.form.success')}
                </p>
                <Button
                  className="mt-6"
                  variant="outline"
                  onClick={() => setIsSuccess(false)}
                >
                  {language === 'ar' ? 'حجز جديد' : 'Book Another'}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className={`text-sm font-medium ${dir === 'rtl' ? 'font-arabic' : ''}`}>
                      {t('booking.form.name')}
                    </label>
                    <div className="relative">
                      <User className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground ${dir === 'rtl' ? 'right-3' : 'left-3'}`} />
                      <Input
                        required
                        value={formData.fullName}
                        onChange={(e) => handleChange('fullName', e.target.value)}
                        className={`${dir === 'rtl' ? 'pr-10' : 'pl-10'}`}
                        maxLength={100}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className={`text-sm font-medium ${dir === 'rtl' ? 'font-arabic' : ''}`}>
                      {t('booking.form.email')}
                    </label>
                    <div className="relative">
                      <Mail className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground ${dir === 'rtl' ? 'right-3' : 'left-3'}`} />
                      <Input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className={`${dir === 'rtl' ? 'pr-10' : 'pl-10'}`}
                        maxLength={255}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className={`text-sm font-medium ${dir === 'rtl' ? 'font-arabic' : ''}`}>
                      {t('booking.form.phone')}
                    </label>
                    <div className="relative">
                      <Phone className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground ${dir === 'rtl' ? 'right-3' : 'left-3'}`} />
                      <Input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className={`${dir === 'rtl' ? 'pr-10' : 'pl-10'}`}
                        dir="ltr"
                        maxLength={20}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className={`text-sm font-medium ${dir === 'rtl' ? 'font-arabic' : ''}`}>
                      {t('booking.form.service')}
                    </label>
                    <Select value={formData.serviceType} onValueChange={(v) => handleChange('serviceType', v)} required>
                      <SelectTrigger>
                        <SelectValue placeholder={t('booking.form.selectService')} />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.value} value={service.value}>
                            {language === 'ar' ? service.labelAr : service.labelEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className={`text-sm font-medium ${dir === 'rtl' ? 'font-arabic' : ''}`}>
                      {t('booking.form.date')}
                    </label>
                    <div className="relative">
                      <Calendar className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground ${dir === 'rtl' ? 'right-3' : 'left-3'}`} />
                      <Input
                        type="date"
                        required
                        value={formData.preferredDate}
                        onChange={(e) => handleChange('preferredDate', e.target.value)}
                        className={`${dir === 'rtl' ? 'pr-10' : 'pl-10'}`}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className={`text-sm font-medium ${dir === 'rtl' ? 'font-arabic' : ''}`}>
                      {t('booking.form.time')}
                    </label>
                    <Select value={formData.preferredTime} onValueChange={(v) => handleChange('preferredTime', v)} required>
                      <SelectTrigger>
                        <Clock className={`w-5 h-5 text-muted-foreground ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                        <SelectValue placeholder={t('booking.form.selectTime')} />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`text-sm font-medium ${dir === 'rtl' ? 'font-arabic' : ''}`}>
                    {t('booking.form.message')}
                  </label>
                  <div className="relative">
                    <MessageSquare className={`absolute top-3 w-5 h-5 text-muted-foreground ${dir === 'rtl' ? 'right-3' : 'left-3'}`} />
                    <Textarea
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      className={`min-h-[100px] ${dir === 'rtl' ? 'pr-10' : 'pl-10'}`}
                      maxLength={1000}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-brand hover:opacity-90 text-primary-foreground font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      {language === 'ar' ? 'جاري الإرسال...' : 'Submitting...'}
                    </>
                  ) : (
                    t('booking.form.submit')
                  )}
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
