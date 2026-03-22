import React, { useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface ServiceLeadFormProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName: string;
}

const contactTimeOptions = [
  { value: 'morning', en: 'Morning (9 AM - 12 PM)', ar: 'صباحاً (9 ص - 12 م)' },
  { value: 'afternoon', en: 'Afternoon (12 PM - 5 PM)', ar: 'بعد الظهر (12 م - 5 م)' },
  { value: 'evening', en: 'Evening (5 PM - 9 PM)', ar: 'مساءً (5 م - 9 م)' },
  { value: 'anytime', en: 'Anytime', ar: 'أي وقت' },
];

const projectTypeOptions = [
  { value: 'website', en: 'Website', ar: 'موقع إلكتروني' },
  { value: 'mobile_app', en: 'Mobile App', ar: 'تطبيق جوال' },
  { value: 'ui_ux', en: 'UI/UX Design', ar: 'تصميم واجهات' },
  { value: 'seo', en: 'SEO', ar: 'تحسين محركات البحث' },
  { value: 'other', en: 'Other', ar: 'أخرى' },
];

const mainGoalOptions = [
  { value: 'get_clients', en: 'Get more clients', ar: 'الحصول على عملاء أكثر' },
  { value: 'increase_sales', en: 'Increase sales', ar: 'زيادة المبيعات' },
  { value: 'booking_system', en: 'Booking system', ar: 'نظام حجوزات' },
  { value: 'improve_brand', en: 'Improve brand', ar: 'تحسين العلامة التجارية' },
];

export default function ServiceLeadForm({ isOpen, onClose, serviceName }: ServiceLeadFormProps) {
  const { language, dir } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    message: '',
    preferred_contact_time: '',
    project_type: '',
    main_goal: '',
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.full_name.trim()) newErrors.full_name = language === 'ar' ? 'الاسم مطلوب' : 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = language === 'ar' ? 'رقم الهاتف مطلوب' : 'Phone is required';
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = language === 'ar' ? 'بريد إلكتروني غير صالح' : 'Invalid email format';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('service_leads').insert({
        full_name: formData.full_name.trim(),
        email: formData.email.trim() || 'not-provided@placeholder.com',
        phone: formData.phone.trim(),
        message: formData.message.trim() || null,
        preferred_contact_time: formData.preferred_contact_time || null,
        selected_service: serviceName,
        project_type: formData.project_type || null,
        main_goal: formData.main_goal || null,
      } as any);
      if (error) throw error;
      setIsSuccess(true);
      toast.success(language === 'ar' ? 'تم إرسال طلبك بنجاح' : 'Your request has been submitted');
    } catch (error) {
      console.error('Error submitting lead:', error);
      toast.error(language === 'ar' ? 'حدث خطأ، حاول مرة أخرى' : 'Something went wrong, please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ full_name: '', email: '', phone: '', message: '', preferred_contact_time: '', project_type: '', main_goal: '' });
    setErrors({});
    setIsSuccess(false);
    onClose();
  };

  const FieldError = ({ field }: { field: string }) =>
    errors[field] ? <p className="text-sm text-destructive mt-1">{errors[field]}</p> : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" dir={dir}>
        <DialogHeader>
          <DialogTitle className={dir === 'rtl' ? 'font-arabic-heading' : ''}>
            {language === 'ar' ? 'طلب خدمة' : 'Request Service'}
          </DialogTitle>
          <DialogDescription>{serviceName}</DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h4 className={`text-lg font-bold mb-2 ${dir === 'rtl' ? 'font-arabic-heading' : ''}`}>
              {language === 'ar' ? 'تم الإرسال بنجاح!' : 'Request Submitted!'}
            </h4>
            <p className={`text-muted-foreground mb-6 ${dir === 'rtl' ? 'font-arabic' : ''}`}>
              {language === 'ar'
                ? 'تم استلام طلبك. سنتواصل معك قريباً.'
                : 'Your request has been received. We will contact you shortly.'}
            </p>
            <Button onClick={handleClose}>
              {language === 'ar' ? 'إغلاق' : 'Close'}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                {language === 'ar' ? 'الاسم الكامل' : 'Full Name'} *
              </label>
              <Input
                value={formData.full_name}
                onChange={(e) => { setFormData(p => ({ ...p, full_name: e.target.value })); setErrors(p => ({ ...p, full_name: '' })); }}
                placeholder={language === 'ar' ? 'أدخل اسمك' : 'Enter your name'}
              />
              <FieldError field="full_name" />
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'} *
              </label>
              <Input
                dir="ltr"
                value={formData.phone}
                onChange={(e) => { setFormData(p => ({ ...p, phone: e.target.value })); setErrors(p => ({ ...p, phone: '' })); }}
                placeholder="+20 10 0000 0000"
              />
              <FieldError field="phone" />
            </div>

            {/* Email (optional) */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'} <span className="text-muted-foreground text-xs">({language === 'ar' ? 'اختياري' : 'optional'})</span>
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => { setFormData(p => ({ ...p, email: e.target.value })); setErrors(p => ({ ...p, email: '' })); }}
                placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
              />
              <FieldError field="email" />
            </div>

            {/* Project Type */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                {language === 'ar' ? 'نوع المشروع' : 'Project Type'}
              </label>
              <Select
                value={formData.project_type}
                onValueChange={(v) => setFormData(p => ({ ...p, project_type: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={language === 'ar' ? 'اختر نوع المشروع' : 'Select project type'} />
                </SelectTrigger>
                <SelectContent>
                  {projectTypeOptions.map(o => (
                    <SelectItem key={o.value} value={o.value}>
                      {language === 'ar' ? o.ar : o.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Main Goal */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                {language === 'ar' ? 'الهدف الرئيسي' : 'Main Goal'}
              </label>
              <Select
                value={formData.main_goal}
                onValueChange={(v) => setFormData(p => ({ ...p, main_goal: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={language === 'ar' ? 'ما هدفك الرئيسي؟' : 'What is your main goal?'} />
                </SelectTrigger>
                <SelectContent>
                  {mainGoalOptions.map(o => (
                    <SelectItem key={o.value} value={o.value}>
                      {language === 'ar' ? o.ar : o.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preferred Contact Time */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                {language === 'ar' ? 'وقت التواصل المفضل' : 'Preferred Contact Time'}
              </label>
              <Select
                value={formData.preferred_contact_time}
                onValueChange={(v) => setFormData(p => ({ ...p, preferred_contact_time: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={language === 'ar' ? 'اختر وقتاً' : 'Select a time'} />
                </SelectTrigger>
                <SelectContent>
                  {contactTimeOptions.map(o => (
                    <SelectItem key={o.value} value={o.value}>
                      {language === 'ar' ? o.ar : o.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Message */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                {language === 'ar' ? 'رسالة' : 'Message'} <span className="text-muted-foreground text-xs">({language === 'ar' ? 'اختياري' : 'optional'})</span>
              </label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))}
                placeholder={language === 'ar' ? 'أخبرنا عن مشروعك...' : 'Tell us about your project...'}
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" />{language === 'ar' ? 'جاري الإرسال...' : 'Submitting...'}</>
              ) : (
                language === 'ar' ? 'إرسال الطلب' : 'Submit Request'
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
