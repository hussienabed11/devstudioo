import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2, Mail, Phone, MapPin, Globe, MessageCircle, Facebook, Linkedin } from 'lucide-react';
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
  facebook_url: string;
  linkedin_url: string;
  tiktok_url: string;
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
    facebook_url: '',
    linkedin_url: '',
    tiktok_url: '',
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
        facebook_url: (contactInfo as any).facebook_url || '',
        linkedin_url: (contactInfo as any).linkedin_url || '',
        tiktok_url: (contactInfo as any).tiktok_url || '',
      });
    }
  }, [contactInfo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        whatsapp: formData.whatsapp.trim() || null,
        address_en: formData.address_en.trim() || null,
        address_ar: formData.address_ar.trim() || null,
        website_url: formData.website_url.trim() || null,
        facebook_url: formData.facebook_url.trim() || null,
        linkedin_url: formData.linkedin_url.trim() || null,
        tiktok_url: formData.tiktok_url.trim() || null,
        updated_at: new Date().toISOString(),
      };

      if (contactInfo?.id) {
        const { error } = await supabase
          .from('contact_info')
          .update(payload)
          .eq('id', contactInfo.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('contact_info')
          .insert(payload);
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

  const isAr = language === 'ar';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className={`text-2xl font-bold ${dir === 'rtl' ? 'font-arabic-heading' : ''}`}>
          {isAr ? 'معلومات التواصل' : 'Contact Information'}
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          {isAr
            ? 'تحديث معلومات التواصل التي تظهر في جميع أنحاء الموقع'
            : 'Update contact details that appear across the entire website'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-6">
        {/* Email */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            {isAr ? 'البريد الإلكتروني' : 'Email Address'}
          </Label>
          <Input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="info@company.com" required dir="ltr" />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-primary" />
            {isAr ? 'رقم الهاتف' : 'Phone Number'}
          </Label>
          <Input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+1 (555) 123-4567" required dir="ltr" />
        </div>

        {/* WhatsApp */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-primary" />
            {isAr ? 'رقم الواتساب (اختياري)' : 'WhatsApp Number (Optional)'}
          </Label>
          <Input type="tel" value={formData.whatsapp} onChange={e => setFormData({ ...formData, whatsapp: e.target.value })} placeholder="+1 (555) 123-4567" dir="ltr" />
        </div>

        {/* Address English */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            {isAr ? 'العنوان (إنجليزي)' : 'Address (English)'}
          </Label>
          <Input value={formData.address_en} onChange={e => setFormData({ ...formData, address_en: e.target.value })} placeholder="Dubai, United Arab Emirates" dir="ltr" />
        </div>

        {/* Address Arabic */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            {isAr ? 'العنوان (عربي)' : 'Address (Arabic)'}
          </Label>
          <Input value={formData.address_ar} onChange={e => setFormData({ ...formData, address_ar: e.target.value })} placeholder="دبي، الإمارات العربية المتحدة" dir="rtl" />
        </div>

        {/* Website URL */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            {isAr ? 'رابط الموقع (اختياري)' : 'Website URL (Optional)'}
          </Label>
          <Input type="url" value={formData.website_url} onChange={e => setFormData({ ...formData, website_url: e.target.value })} placeholder="https://www.yourcompany.com" dir="ltr" />
        </div>

        {/* Social Media Section */}
        <div className="border-t border-border pt-6">
          <h3 className={`text-lg font-semibold mb-4 ${dir === 'rtl' ? 'font-arabic-heading' : ''}`}>
            {isAr ? 'وسائل التواصل الاجتماعي' : 'Social Media'}
          </h3>

          <div className="space-y-4">
            {/* Facebook */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Facebook className="w-4 h-4 text-primary" />
                Facebook ({isAr ? 'اختياري' : 'Optional'})
              </Label>
              <Input type="url" value={formData.facebook_url} onChange={e => setFormData({ ...formData, facebook_url: e.target.value })} placeholder="https://facebook.com/yourpage" dir="ltr" />
            </div>

            {/* LinkedIn */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Linkedin className="w-4 h-4 text-primary" />
                LinkedIn ({isAr ? 'اختياري' : 'Optional'})
              </Label>
              <Input type="url" value={formData.linkedin_url} onChange={e => setFormData({ ...formData, linkedin_url: e.target.value })} placeholder="https://linkedin.com/company/yourcompany" dir="ltr" />
            </div>

            {/* TikTok */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78 2.92 2.92 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.57 6.33 6.33 0 0 0 9.37 22a6.33 6.33 0 0 0 6.37-6.23V9.4a8.16 8.16 0 0 0 3.85.96V7.04a4.85 4.85 0 0 1-3.85-.35z"/></svg>
                TikTok ({isAr ? 'اختياري' : 'Optional'})
              </Label>
              <Input type="url" value={formData.tiktok_url} onChange={e => setFormData({ ...formData, tiktok_url: e.target.value })} placeholder="https://tiktok.com/@yourhandle" dir="ltr" />
            </div>
          </div>
        </div>

        <Button type="submit" disabled={saving} className="w-full bg-gradient-brand">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          {isAr ? 'حفظ التغييرات' : 'Save Changes'}
        </Button>
      </form>

      <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
        <p className={dir === 'rtl' ? 'font-arabic' : ''}>
          {isAr
            ? '💡 سيتم تحديث معلومات التواصل تلقائياً في جميع أقسام الموقع بما في ذلك الفوتر وقسم الحجز.'
            : '💡 Contact information will automatically update across all website sections including the footer and booking section.'}
        </p>
      </div>
    </motion.div>
  );
}
