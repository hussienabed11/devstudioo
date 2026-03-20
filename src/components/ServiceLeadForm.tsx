import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.full_name.trim()) newErrors.full_name = language === 'ar' ? 'الاسم مطلوب' : 'Name is required';
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = language === 'ar' ? 'بريد إلكتروني صالح مطلوب' : 'Valid email is required';
    if (!formData.phone.trim()) newErrors.phone = language === 'ar' ? 'رقم الهاتف مطلوب' : 'Phone is required';
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
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        message: formData.message.trim() || null,
        preferred_contact_time: formData.preferred_contact_time || null,
        selected_service: serviceName,
      });
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
    setFormData({ full_name: '', email: '', phone: '', message: '', preferred_contact_time: '' });
    setErrors({});
    setIsSuccess(false);
    onClose();
  };

  const FieldError = ({ field }: { field: string }) =>
    errors[field] ? <p className="text-sm text-destructive mt-1">{errors[field]}</p> : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            dir={dir}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h3 className={`text-xl font-bold ${dir === 'rtl' ? 'font-arabic-heading' : ''}`}>
                  {language === 'ar' ? 'طلب خدمة' : 'Request Service'}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">{serviceName}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6">
              {isSuccess ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8">
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
                </motion.div>
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

                  {/* Email */}
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'} *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => { setFormData(p => ({ ...p, email: e.target.value })); setErrors(p => ({ ...p, email: '' })); }}
                      placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                    />
                    <FieldError field="email" />
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
                      placeholder="+971 50 000 0000"
                    />
                    <FieldError field="phone" />
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
                      {language === 'ar' ? 'رسالة' : 'Message'}
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
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
