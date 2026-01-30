import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2, GripVertical } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Service {
  id: string;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  icon_name: string;
  display_order: number;
  status: string;
  created_at: string;
}

interface ServiceFormData {
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  icon_name: string;
  status: string;
}

const iconOptions = [
  { value: 'Palette', label: 'Design' },
  { value: 'Code2', label: 'Code' },
  { value: 'Smartphone', label: 'Mobile' },
  { value: 'Search', label: 'SEO' },
  { value: 'Globe', label: 'Web' },
  { value: 'Zap', label: 'Performance' },
  { value: 'Shield', label: 'Security' },
  { value: 'Database', label: 'Database' },
  { value: 'Cloud', label: 'Cloud' },
  { value: 'Headphones', label: 'Support' },
];

const initialFormData: ServiceFormData = {
  title_en: '',
  title_ar: '',
  description_en: '',
  description_ar: '',
  icon_name: 'Palette',
  status: 'active',
};

export default function ServicesManagement() {
  const { language, dir } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>(initialFormData);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error(language === 'ar' ? 'حدث خطأ في تحميل الخدمات' : 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openAddDialog = () => {
    setSelectedService(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  const openEditDialog = (service: Service) => {
    setSelectedService(service);
    setFormData({
      title_en: service.title_en,
      title_ar: service.title_ar,
      description_en: service.description_en,
      description_ar: service.description_ar,
      icon_name: service.icon_name,
      status: service.status,
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (service: Service) => {
    setSelectedService(service);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (selectedService) {
        const { error } = await supabase
          .from('services')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedService.id);

        if (error) throw error;
        toast.success(language === 'ar' ? 'تم تحديث الخدمة' : 'Service updated');
      } else {
        const maxOrder = Math.max(...services.map(s => s.display_order), 0);
        const { error } = await supabase
          .from('services')
          .insert({
            ...formData,
            display_order: maxOrder + 1,
          });

        if (error) throw error;
        toast.success(language === 'ar' ? 'تم إضافة الخدمة' : 'Service added');
      }

      setIsDialogOpen(false);
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error(language === 'ar' ? 'حدث خطأ في الحفظ' : 'Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedService) return;

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', selectedService.id);

      if (error) throw error;
      
      toast.success(language === 'ar' ? 'تم حذف الخدمة' : 'Service deleted');
      setDeleteDialogOpen(false);
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error(language === 'ar' ? 'حدث خطأ في الحذف' : 'Failed to delete service');
    }
  };

  const toggleStatus = async (service: Service) => {
    const newStatus = service.status === 'active' ? 'hidden' : 'active';
    
    try {
      const { error } = await supabase
        .from('services')
        .update({ status: newStatus })
        .eq('id', service.id);

      if (error) throw error;
      
      setServices(prev => 
        prev.map(s => s.id === service.id ? { ...s, status: newStatus } : s)
      );
      toast.success(
        language === 'ar' 
          ? (newStatus === 'active' ? 'الخدمة مرئية الآن' : 'الخدمة مخفية الآن')
          : (newStatus === 'active' ? 'Service is now visible' : 'Service is now hidden')
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
            {language === 'ar' ? 'إدارة الخدمات' : 'Services Management'}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {language === 'ar' ? 'إضافة وتعديل وحذف الخدمات' : 'Add, edit, and manage services'}
          </p>
        </div>
        <Button onClick={openAddDialog} className="gap-2 bg-gradient-brand">
          <Plus className="w-4 h-4" />
          {language === 'ar' ? 'إضافة خدمة' : 'Add Service'}
        </Button>
      </div>

      {/* Services List */}
      <div className="space-y-3">
        {services.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className={`bg-card border border-border rounded-xl p-4 flex items-center gap-4 ${
              service.status === 'hidden' ? 'opacity-60' : ''
            }`}
          >
            <div className="text-muted-foreground cursor-move">
              <GripVertical className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-semibold truncate ${dir === 'rtl' ? 'font-arabic-heading' : ''}`}>
                  {language === 'ar' ? service.title_ar : service.title_en}
                </h3>
                <Badge
                  variant="secondary"
                  className={`shrink-0 ${
                    service.status === 'active' 
                      ? 'bg-green-500/20 text-green-600' 
                      : 'bg-yellow-500/20 text-yellow-600'
                  }`}
                >
                  {service.status === 'active' 
                    ? (language === 'ar' ? 'مرئي' : 'Active')
                    : (language === 'ar' ? 'مخفي' : 'Hidden')
                  }
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {language === 'ar' ? service.description_ar : service.description_en}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="icon"
                onClick={() => openEditDialog(service)}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => toggleStatus(service)}
              >
                {service.status === 'active' ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => openDeleteDialog(service)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {services.length === 0 && (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <h3 className="text-lg font-semibold mb-2">
            {language === 'ar' ? 'لا توجد خدمات' : 'No services yet'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {language === 'ar' ? 'ابدأ بإضافة أول خدمة' : 'Start by adding your first service'}
          </p>
          <Button onClick={openAddDialog} className="gap-2">
            <Plus className="w-4 h-4" />
            {language === 'ar' ? 'إضافة خدمة' : 'Add Service'}
          </Button>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className={dir === 'rtl' ? 'font-arabic-heading' : ''}>
              {selectedService 
                ? (language === 'ar' ? 'تعديل الخدمة' : 'Edit Service')
                : (language === 'ar' ? 'إضافة خدمة جديدة' : 'Add New Service')
              }
            </DialogTitle>
            <DialogDescription>
              {language === 'ar' 
                ? 'أدخل تفاصيل الخدمة بالعربية والإنجليزية'
                : 'Enter service details in both Arabic and English'
              }
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}</Label>
                <Input
                  value={formData.title_en}
                  onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                  placeholder="Service title in English"
                  required
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}</Label>
                <Input
                  value={formData.title_ar}
                  onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                  placeholder="عنوان الخدمة بالعربية"
                  required
                  dir="rtl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}</Label>
              <Textarea
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                placeholder="Service description in English"
                required
                rows={3}
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}</Label>
              <Textarea
                value={formData.description_ar}
                onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                placeholder="وصف الخدمة بالعربية"
                required
                rows={3}
                dir="rtl"
              />
            </div>

            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الأيقونة' : 'Icon'}</Label>
              <Select 
                value={formData.icon_name} 
                onValueChange={(v) => setFormData({ ...formData, icon_name: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((icon) => (
                    <SelectItem key={icon.value} value={icon.value}>
                      {icon.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                {selectedService 
                  ? (language === 'ar' ? 'حفظ التغييرات' : 'Save Changes')
                  : (language === 'ar' ? 'إضافة الخدمة' : 'Add Service')
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
                ? 'سيتم حذف هذه الخدمة نهائياً ولا يمكن استعادتها.'
                : 'This action cannot be undone. This will permanently delete the service.'}
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
