import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2, Mail, Phone, MapPin, Globe, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useContactInfo } from '@/hooks/useContactInfo';

interface ContactFormData {
  email: string;
  phone: string;
  whatsapp: string;
  address_en: string;
  address_ar: string;
  website_url: string;
}

export default function ContactInfoManagement() {
  const { language, dir } = useLanguage();
  const { contactInfo, refetch } = useContactInfo();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    email: '',
    phone: '',
    whatsapp: '',
    address_en: '',
    address_ar: '',
    website_url: '',
  });

  useEffect(() => {
    if (contactInfo) {
      setFormData({
        email: contactInfo.email || '',
        phone: contactInfo.phone || '',
        whatsapp: contactInfo.whatsapp || '',
        address_en: contactInfo.address_en || '',
        address_ar: contactInfo.address_ar || '',
        website_url: contactInfo.website_url || '',
      });
    }
  }, [contactInfo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (contactInfo?.id) {
        const { error } = await supabase
          .from('contact_info')
          .update({
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            whatsapp: formData.whatsapp.trim() || null,
            address_en: formData.address_en.trim() || null,
            address_ar: formData.address_ar.trim() || null,
            website_url: formData.website_url.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', contactInfo.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('contact_info')
          .insert({
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            whatsapp: formData.whatsapp.trim() || null,
            address_en: formData.address_en.trim() || null,
            address_ar: formData.address_ar.trim() || null,
            website_url: formData.website_url.trim() || null,
          });

        if (error) throw error;
      }

      await refetch();
      toast.success(language === 'ar' ? 'تم حفظ معلومات التواصل' : 'Contact information saved');
    } catch (error) {
      console.error('Error saving contact info:', error);
      toast.error(language === 'ar' ? 'حدث خطأ في الحفظ' : 'Failed to save contact info');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className={`text-2xl font-bold ${dir === 'rtl' ? 'font-arabic-heading' : ''}`}>
          {language === 'ar' ? 'معلومات التواصل' : 'Contact Information'}
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          {language === 'ar' 
            ? 'تحديث معلومات التواصل التي تظهر في جميع أنحاء الموقع'
            : 'Update contact details that appear across the entire website'
          }
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-6">
        {/* Email */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
          </Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="info@company.com"
            required
            dir="ltr"
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-primary" />
            {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
          </Label>
          <Input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1 (555) 123-4567"
            required
            dir="ltr"
          />
        </div>

        {/* WhatsApp */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-primary" />
            {language === 'ar' ? 'رقم الواتساب (اختياري)' : 'WhatsApp Number (Optional)'}
          </Label>
          <Input
            type="tel"
            value={formData.whatsapp}
            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
            placeholder="+1 (555) 123-4567"
            dir="ltr"
          />
        </div>

        {/* Address English */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            {language === 'ar' ? 'العنوان (إنجليزي)' : 'Address (English)'}
          </Label>
          <Input
            value={formData.address_en}
            onChange={(e) => setFormData({ ...formData, address_en: e.target.value })}
            placeholder="Dubai, United Arab Emirates"
            dir="ltr"
          />
        </div>

        {/* Address Arabic */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            {language === 'ar' ? 'العنوان (عربي)' : 'Address (Arabic)'}
          </Label>
          <Input
            value={formData.address_ar}
            onChange={(e) => setFormData({ ...formData, address_ar: e.target.value })}
            placeholder="دبي، الإمارات العربية المتحدة"
            dir="rtl"
          />
        </div>

        {/* Website URL */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            {language === 'ar' ? 'رابط الموقع (اختياري)' : 'Website URL (Optional)'}
          </Label>
          <Input
            type="url"
            value={formData.website_url}
            onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
            placeholder="https://www.yourcompany.com"
            dir="ltr"
          />
        </div>

        {/* Submit Button */}
        <Button type="submit" disabled={saving} className="w-full bg-gradient-brand">
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
        </Button>
      </form>

      {/* Info Note */}
      <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
        <p className={dir === 'rtl' ? 'font-arabic' : ''}>
          {language === 'ar' 
            ? '💡 سيتم تحديث معلومات التواصل تلقائياً في جميع أقسام الموقع بما في ذلك الفوتر وقسم الحجز.'
            : '💡 Contact information will automatically update across all website sections including the footer and booking section.'
          }
        </p>
      </div>
    </motion.div>
  );
}
