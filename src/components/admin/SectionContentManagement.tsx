import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Save, Plus, Trash2, GripVertical, Globe } from 'lucide-react';
import type { SectionContentItem } from '@/hooks/useSectionContent';

const SECTION_CONFIGS = [
  {
    key: 'hero',
    labelEn: 'Hero Section',
    labelAr: 'القسم الرئيسي',
    groups: [
      { label: 'General', labelAr: 'عام', keys: ['badge', 'title', 'title_highlight', 'subtitle'] },
      { label: 'CTA Buttons', labelAr: 'أزرار الإجراء', keys: ['cta_button_1_text', 'cta_button_1_link', 'cta_button_2_text', 'cta_button_2_link'] },
      { label: 'Statistics', labelAr: 'الإحصائيات', prefix: 'stat', isDynamic: true, fields: ['value', 'label'] },
    ],
  },
  {
    key: 'about',
    labelEn: 'About Section',
    labelAr: 'قسم من نحن',
    groups: [
      { label: 'General', labelAr: 'عام', keys: ['badge', 'title', 'description', 'center_value'] },
      { label: 'Statistics', labelAr: 'الإحصائيات', prefix: 'stat', isDynamic: true, fields: ['value', 'label'] },
    ],
  },
  {
    key: 'why_choose_us',
    labelEn: 'Why Choose Us',
    labelAr: 'لماذا نحن',
    groups: [
      { label: 'General', labelAr: 'عام', keys: ['badge', 'title', 'subtitle', 'what_you_get_label', 'what_you_get_title', 'cta_text'] },
      { label: 'Features', labelAr: 'المميزات', prefix: 'feature', isDynamic: true, fields: ['title', 'description', 'icon'] },
      { label: 'Benefits', labelAr: 'الفوائد', prefix: 'benefit', isDynamic: true, fields: [] },
    ],
  },
  {
    key: 'how_we_work',
    labelEn: 'How We Work',
    labelAr: 'كيف نعمل',
    groups: [
      { label: 'General', labelAr: 'عام', keys: ['badge', 'title', 'subtitle', 'support_text'] },
      { label: 'Steps', labelAr: 'الخطوات', prefix: 'step', isDynamic: true, fields: ['title', 'description', 'icon'] },
    ],
  },
];

export default function SectionContentManagement() {
  const { language, dir } = useLanguage();
  const [items, setItems] = useState<SectionContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editLang, setEditLang] = useState<'en' | 'ar'>('en');
  const [activeSection, setActiveSection] = useState('hero');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('section_content')
      .select('*')
      .order('display_order', { ascending: true });
    if (!error && data) setItems(data as SectionContentItem[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const sectionItems = items.filter(i => i.section_name === activeSection);

  const updateField = (id: string, field: 'content_en' | 'content_ar', value: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const saveAll = async () => {
    setSaving(true);
    const sectionData = items.filter(i => i.section_name === activeSection);
    
    for (const item of sectionData) {
      const { error } = await supabase
        .from('section_content')
        .update({ content_en: item.content_en, content_ar: item.content_ar, display_order: item.display_order })
        .eq('id', item.id);
      if (error) {
        toast.error(language === 'ar' ? 'حدث خطأ في الحفظ' : 'Error saving');
        setSaving(false);
        return;
      }
    }
    toast.success(language === 'ar' ? 'تم الحفظ بنجاح' : 'Saved successfully');
    setSaving(false);
  };

  const addDynamicItem = async (sectionKey: string, prefix: string, fields: string[]) => {
    // Find next number
    const existing = sectionItems.filter(i => i.content_key.startsWith(`${prefix}_`));
    const numbers = existing.map(i => {
      const match = i.content_key.match(new RegExp(`^${prefix}_(\\d+)`));
      return match ? parseInt(match[1]) : 0;
    });
    const nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    const maxOrder = existing.length > 0 ? Math.max(...existing.map(i => i.display_order)) : 9;

    if (fields.length === 0) {
      // Simple item like benefit
      const { error } = await supabase.from('section_content').insert({
        section_name: sectionKey,
        content_key: `${prefix}_${nextNum}`,
        content_en: '',
        content_ar: '',
        display_order: maxOrder + 1,
      });
      if (!error) fetchAll();
    } else {
      // Multi-field item
      const inserts = fields.map((field, idx) => ({
        section_name: sectionKey,
        content_key: `${prefix}_${nextNum}_${field}`,
        content_en: '',
        content_ar: '',
        display_order: maxOrder + 1 + idx,
      }));
      const { error } = await supabase.from('section_content').insert(inserts);
      if (!error) fetchAll();
    }
  };

  const deleteDynamicItem = async (sectionKey: string, prefix: string, num: string) => {
    const toDelete = sectionItems.filter(i => 
      i.content_key === `${prefix}_${num}` || i.content_key.startsWith(`${prefix}_${num}_`)
    );
    for (const item of toDelete) {
      await supabase.from('section_content').delete().eq('id', item.id);
    }
    fetchAll();
    toast.success(language === 'ar' ? 'تم الحذف' : 'Deleted');
  };

  const getItem = (key: string) => sectionItems.find(i => i.content_key === key);

  const renderField = (item: SectionContentItem | undefined, label: string) => {
    if (!item) return null;
    const field = editLang === 'en' ? 'content_en' : 'content_ar';
    const value = item[field];
    const isLong = value.length > 80 || label.toLowerCase().includes('description') || label.toLowerCase().includes('subtitle');
    
    return (
      <div key={item.id} className="space-y-1.5">
        <Label className="text-sm font-medium capitalize">{label}</Label>
        {isLong ? (
          <Textarea
            value={value}
            onChange={(e) => updateField(item.id, field, e.target.value)}
            className="min-h-[80px]"
            dir={editLang === 'ar' ? 'rtl' : 'ltr'}
          />
        ) : (
          <Input
            value={value}
            onChange={(e) => updateField(item.id, field, e.target.value)}
            dir={editLang === 'ar' ? 'rtl' : 'ltr'}
          />
        )}
      </div>
    );
  };

  const renderStaticGroup = (group: { label: string; labelAr: string; keys: string[] }) => (
    <Card key={group.label}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{language === 'ar' ? group.labelAr : group.label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {group.keys.map(key => renderField(getItem(key), key.replace(/_/g, ' ')))}
      </CardContent>
    </Card>
  );

  const renderDynamicGroup = (sectionKey: string, group: { label: string; labelAr: string; prefix: string; fields: string[] }) => {
    const prefix = group.prefix;
    const relatedItems = sectionItems.filter(i => i.content_key.startsWith(`${prefix}_`));
    
    // Group by number
    const grouped: Record<string, SectionContentItem[]> = {};
    relatedItems.forEach(item => {
      const match = item.content_key.match(new RegExp(`^${prefix}_(\\d+)`));
      if (match) {
        const num = match[1];
        if (!grouped[num]) grouped[num] = [];
        grouped[num].push(item);
      }
    });

    const sortedNums = Object.keys(grouped).sort((a, b) => Number(a) - Number(b));

    return (
      <Card key={group.label}>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">{language === 'ar' ? group.labelAr : group.label}</CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => addDynamicItem(sectionKey, prefix, group.fields)}
            className="gap-1"
          >
            <Plus className="w-4 h-4" />
            {language === 'ar' ? 'إضافة' : 'Add'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {sortedNums.map(num => (
            <div key={num} className="border border-border rounded-lg p-4 space-y-3 relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <Badge variant="outline">#{num}</Badge>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive hover:text-destructive h-8 w-8"
                  onClick={() => deleteDynamicItem(sectionKey, prefix, num)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              {group.fields.length === 0 ? (
                // Simple item (like benefit)
                grouped[num].map(item => renderField(item, `${prefix} ${num}`))
              ) : (
                group.fields.map(field => {
                  const item = grouped[num].find(i => i.content_key.endsWith(`_${field}`));
                  return item ? renderField(item, field) : null;
                })
              )}
            </div>
          ))}
          {sortedNums.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              {language === 'ar' ? 'لا توجد عناصر بعد' : 'No items yet'}
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeSectionConfig = SECTION_CONFIGS.find(s => s.key === activeSection);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className={`text-2xl font-bold ${dir === 'rtl' ? 'font-arabic-heading' : ''}`}>
          {language === 'ar' ? 'إدارة محتوى الصفحة' : 'Page Content Management'}
        </h2>
        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <Button
              size="sm"
              variant={editLang === 'en' ? 'default' : 'ghost'}
              onClick={() => setEditLang('en')}
              className="gap-1 h-8"
            >
              <Globe className="w-3.5 h-3.5" />
              EN
            </Button>
            <Button
              size="sm"
              variant={editLang === 'ar' ? 'default' : 'ghost'}
              onClick={() => setEditLang('ar')}
              className="gap-1 h-8"
            >
              <Globe className="w-3.5 h-3.5" />
              AR
            </Button>
          </div>
          <Button onClick={saveAll} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Section Tabs */}
      <Tabs value={activeSection} onValueChange={setActiveSection}>
        <TabsList className="grid w-full grid-cols-4">
          {SECTION_CONFIGS.map(s => (
            <TabsTrigger key={s.key} value={s.key} className="text-xs sm:text-sm">
              {language === 'ar' ? s.labelAr : s.labelEn}
            </TabsTrigger>
          ))}
        </TabsList>

        {SECTION_CONFIGS.map(section => (
          <TabsContent key={section.key} value={section.key} className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">
                {editLang === 'en' ? 'Editing: English' : 'التعديل: العربية'}
              </Badge>
            </div>
            {section.groups.map(group => {
              if ('isDynamic' in group && group.isDynamic) {
                return renderDynamicGroup(section.key, group as any);
              }
              return renderStaticGroup(group as any);
            })}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
