import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2, Star, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Package {
  id: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  features_en: string[];
  features_ar: string[];
  marketing_text_en: string | null;
  marketing_text_ar: string | null;
  starting_price: string;
  cta_text_en: string | null;
  cta_text_ar: string | null;
  cta_link: string | null;
  is_featured: boolean;
  status: string;
  display_order: number;
  created_at: string;
}

interface PackageFormData {
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  features_en: string[];
  features_ar: string[];
  marketing_text_en: string;
  marketing_text_ar: string;
  starting_price: string;
  cta_text_en: string;
  cta_text_ar: string;
  cta_link: string;
  is_featured: boolean;
  status: string;
}

const initialFormData: PackageFormData = {
  name_en: '',
  name_ar: '',
  description_en: '',
  description_ar: '',
  features_en: [''],
  features_ar: [''],
  marketing_text_en: '',
  marketing_text_ar: '',
  starting_price: '',
  cta_text_en: 'Get Started',
  cta_text_ar: 'ابدأ الآن',
  cta_link: '',
  is_featured: false,
  status: 'active',
};

export default function PackagesManagement() {
  const { language, dir } = useLanguage();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [formData, setFormData] = useState<PackageFormData>(initialFormData);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast.error(language === 'ar' ? 'حدث خطأ في تحميل الباقات' : 'Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const openAddDialog = () => {
    setSelectedPackage(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  const openEditDialog = (pkg: Package) => {
    setSelectedPackage(pkg);
    setFormData({
      name_en: pkg.name_en,
      name_ar: pkg.name_ar,
      description_en: pkg.description_en,
      description_ar: pkg.description_ar,
      features_en: pkg.features_en.length > 0 ? pkg.features_en : [''],
      features_ar: pkg.features_ar.length > 0 ? pkg.features_ar : [''],
      marketing_text_en: pkg.marketing_text_en || '',
      marketing_text_ar: pkg.marketing_text_ar || '',
      starting_price: pkg.starting_price,
      cta_text_en: pkg.cta_text_en || 'Get Started',
      cta_text_ar: pkg.cta_text_ar || 'ابدأ الآن',
      cta_link: pkg.cta_link || '',
      is_featured: pkg.is_featured,
      status: pkg.status,
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (pkg: Package) => {
    setSelectedPackage(pkg);
    setDeleteDialogOpen(true);
  };

  const addFeature = (lang: 'en' | 'ar') => {
    const key = lang === 'en' ? 'features_en' : 'features_ar';
    setFormData({ ...formData, [key]: [...formData[key], ''] });
  };

  const removeFeature = (lang: 'en' | 'ar', index: number) => {
    const key = lang === 'en' ? 'features_en' : 'features_ar';
    const features = [...formData[key]];
    features.splice(index, 1);
    setFormData({ ...formData, [key]: features.length > 0 ? features : [''] });
  };

  const updateFeature = (lang: 'en' | 'ar', index: number, value: string) => {
    const key = lang === 'en' ? 'features_en' : 'features_ar';
    const features = [...formData[key]];
    features[index] = value;
    setFormData({ ...formData, [key]: features });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const cleanedData = {
      ...formData,
      features_en: formData.features_en.filter(f => f.trim() !== ''),
      features_ar: formData.features_ar.filter(f => f.trim() !== ''),
      marketing_text_en: formData.marketing_text_en.trim() || null,
      marketing_text_ar: formData.marketing_text_ar.trim() || null,
      cta_link: formData.cta_link.trim() || null,
    };

    try {
      if (selectedPackage) {
        const { error } = await supabase
          .from('packages')
          .update({
            ...cleanedData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedPackage.id);

        if (error) throw error;
        toast.success(language === 'ar' ? 'تم تحديث الباقة' : 'Package updated');
      } else {
        const maxOrder = Math.max(...packages.map(p => p.display_order), 0);
        const { error } = await supabase
          .from('packages')
          .insert({
            ...cleanedData,
            display_order: maxOrder + 1,
          });

        if (error) throw error;
        toast.success(language === 'ar' ? 'تم إضافة الباقة' : 'Package added');
      }

      setIsDialogOpen(false);
      fetchPackages();
    } catch (error) {
      console.error('Error saving package:', error);
      toast.error(language === 'ar' ? 'حدث خطأ في الحفظ' : 'Failed to save package');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPackage) return;

    try {
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', selectedPackage.id);

      if (error) throw error;
      
      toast.success(language === 'ar' ? 'تم حذف الباقة' : 'Package deleted');
      setDeleteDialogOpen(false);
      fetchPackages();
    } catch (error) {
      console.error('Error deleting package:', error);
      toast.error(language === 'ar' ? 'حدث خطأ في الحذف' : 'Failed to delete package');
    }
  };

  const toggleStatus = async (pkg: Package) => {
    const newStatus = pkg.status === 'active' ? 'hidden' : 'active';
    
    try {
      const { error } = await supabase
        .from('packages')
        .update({ status: newStatus })
        .eq('id', pkg.id);

      if (error) throw error;
      
      setPackages(prev => 
        prev.map(p => p.id === pkg.id ? { ...p, status: newStatus } : p)
      );
      toast.success(
        language === 'ar' 
          ? (newStatus === 'active' ? 'الباقة مرئية الآن' : 'الباقة مخفية الآن')
          : (newStatus === 'active' ? 'Package is now visible' : 'Package is now hidden')
      );
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error(language === 'ar' ? 'حدث خطأ' : 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${dir === 'rtl' ? 'font-arabic-heading' : ''}`}>
            {language === 'ar' ? 'إدارة الباقات' : 'Packages Management'}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {language === 'ar' ? 'إضافة وتعديل وحذف باقات المواقع' : 'Add, edit, and manage website packages'}
          </p>
        </div>
        <Button onClick={openAddDialog} className="gap-2 bg-gradient-brand">
          <Plus className="w-4 h-4" />
          {language === 'ar' ? 'إضافة باقة' : 'Add Package'}
        </Button>
      </div>

      {/* Packages Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packages.map((pkg, index) => (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`bg-card border rounded-xl p-4 ${
              pkg.status === 'hidden' ? 'opacity-60' : ''
            } ${pkg.is_featured ? 'border-primary/50' : 'border-border'}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {pkg.is_featured && <Star className="w-4 h-4 text-primary fill-primary" />}
                <h3 className={`font-bold ${dir === 'rtl' ? 'font-arabic-heading' : ''}`}>
                  {language === 'ar' ? pkg.name_ar : pkg.name_en}
                </h3>
              </div>
              <Badge
                variant="secondary"
                className={`shrink-0 ${
                  pkg.status === 'active' 
                    ? 'bg-green-500/20 text-green-600' 
                    : 'bg-yellow-500/20 text-yellow-600'
                }`}
              >
                {pkg.status === 'active' 
                  ? (language === 'ar' ? 'مرئي' : 'Active')
                  : (language === 'ar' ? 'مخفي' : 'Hidden')
                }
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {language === 'ar' ? pkg.description_ar : pkg.description_en}
            </p>

            <div className="text-lg font-bold text-primary mb-4">
              {pkg.starting_price}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEditDialog(pkg)}
                className="flex-1"
              >
                <Edit2 className="w-4 h-4 mr-1" />
                {language === 'ar' ? 'تعديل' : 'Edit'}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => toggleStatus(pkg)}
              >
                {pkg.status === 'active' ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => openDeleteDialog(pkg)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {packages.length === 0 && (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <h3 className="text-lg font-semibold mb-2">
            {language === 'ar' ? 'لا توجد باقات' : 'No packages yet'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {language === 'ar' ? 'ابدأ بإضافة أول باقة' : 'Start by adding your first package'}
          </p>
          <Button onClick={openAddDialog} className="gap-2">
            <Plus className="w-4 h-4" />
            {language === 'ar' ? 'إضافة باقة' : 'Add Package'}
          </Button>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className={dir === 'rtl' ? 'font-arabic-heading' : ''}>
              {selectedPackage 
                ? (language === 'ar' ? 'تعديل الباقة' : 'Edit Package')
                : (language === 'ar' ? 'إضافة باقة جديدة' : 'Add New Package')
              }
            </DialogTitle>
            <DialogDescription>
              {language === 'ar' 
                ? 'أدخل تفاصيل الباقة بالعربية والإنجليزية'
                : 'Enter package details in both Arabic and English'
              }
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'اسم الباقة (إنجليزي)' : 'Package Name (English)'}</Label>
                <Input
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  placeholder="Starter Package"
                  required
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'اسم الباقة (عربي)' : 'Package Name (Arabic)'}</Label>
                <Input
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  placeholder="الباقة الأساسية"
                  required
                  dir="rtl"
                />
              </div>
            </div>

            {/* Description */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}</Label>
                <Textarea
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  placeholder="Package description"
                  required
                  rows={2}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}</Label>
                <Textarea
                  value={formData.description_ar}
                  onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                  placeholder="وصف الباقة"
                  required
                  rows={2}
                  dir="rtl"
                />
              </div>
            </div>

            {/* Features English */}
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'المميزات (إنجليزي)' : 'Features (English)'}</Label>
              {formData.features_en.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => updateFeature('en', index, e.target.value)}
                    placeholder={`Feature ${index + 1}`}
                    dir="ltr"
                  />
                  {formData.features_en.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeFeature('en', index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => addFeature('en')}>
                <Plus className="w-4 h-4 mr-1" />
                {language === 'ar' ? 'إضافة ميزة' : 'Add Feature'}
              </Button>
            </div>

            {/* Features Arabic */}
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'المميزات (عربي)' : 'Features (Arabic)'}</Label>
              {formData.features_ar.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => updateFeature('ar', index, e.target.value)}
                    placeholder={`الميزة ${index + 1}`}
                    dir="rtl"
                  />
                  {formData.features_ar.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeFeature('ar', index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => addFeature('ar')}>
                <Plus className="w-4 h-4 mr-1" />
                {language === 'ar' ? 'إضافة ميزة' : 'Add Feature'}
              </Button>
            </div>

            {/* Marketing Text */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'النص التسويقي (إنجليزي)' : 'Marketing Text (English)'}</Label>
                <Textarea
                  value={formData.marketing_text_en}
                  onChange={(e) => setFormData({ ...formData, marketing_text_en: e.target.value })}
                  placeholder="Optional marketing message"
                  rows={2}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'النص التسويقي (عربي)' : 'Marketing Text (Arabic)'}</Label>
                <Textarea
                  value={formData.marketing_text_ar}
                  onChange={(e) => setFormData({ ...formData, marketing_text_ar: e.target.value })}
                  placeholder="الرسالة التسويقية (اختياري)"
                  rows={2}
                  dir="rtl"
                />
              </div>
            </div>

            {/* Price & CTA */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'السعر يبدأ من' : 'Starting Price'}</Label>
                <Input
                  value={formData.starting_price}
                  onChange={(e) => setFormData({ ...formData, starting_price: e.target.value })}
                  placeholder="9,000 EGP"
                  required
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'نص الزر (إنجليزي)' : 'CTA Text (English)'}</Label>
                <Input
                  value={formData.cta_text_en}
                  onChange={(e) => setFormData({ ...formData, cta_text_en: e.target.value })}
                  placeholder="Get Started"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'نص الزر (عربي)' : 'CTA Text (Arabic)'}</Label>
                <Input
                  value={formData.cta_text_ar}
                  onChange={(e) => setFormData({ ...formData, cta_text_ar: e.target.value })}
                  placeholder="ابدأ الآن"
                  dir="rtl"
                />
              </div>
            </div>

            {/* CTA Link */}
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'رابط الزر (اختياري)' : 'CTA Link (Optional)'}</Label>
              <Input
                value={formData.cta_link}
                onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                placeholder="https://..."
                dir="ltr"
              />
            </div>

            {/* Featured */}
            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
              />
              <Label htmlFor="featured">
                {language === 'ar' ? 'باقة مميزة (الأكثر شعبية)' : 'Featured Package (Most Popular)'}
              </Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={saving}
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button type="submit" disabled={saving} className="bg-gradient-brand">
                {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {selectedPackage 
                  ? (language === 'ar' ? 'حفظ التغييرات' : 'Save Changes')
                  : (language === 'ar' ? 'إضافة الباقة' : 'Add Package')
                }
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'ar' 
                ? 'سيتم حذف هذه الباقة نهائياً ولا يمكن استعادتها.'
                : 'This action cannot be undone. This will permanently delete the package.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              {language === 'ar' ? 'حذف' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
