import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2, ExternalLink, Image as ImageIcon } from 'lucide-react';
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

interface PortfolioProject {
  id: string;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  image_url: string;
  project_link: string;
  status: string;
  display_order: number;
  created_at: string;
}

interface ProjectFormData {
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  image_url: string;
  project_link: string;
  status: string;
}

const initialFormData: ProjectFormData = {
  title_en: '',
  title_ar: '',
  description_en: '',
  description_ar: '',
  image_url: '',
  project_link: '',
  status: 'active',
};

export default function PortfolioManagement() {
  const { language, dir } = useLanguage();
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>(initialFormData);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error(language === 'ar' ? 'حدث خطأ في تحميل المشاريع' : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openAddDialog = () => {
    setSelectedProject(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  const openEditDialog = (project: PortfolioProject) => {
    setSelectedProject(project);
    setFormData({
      title_en: project.title_en,
      title_ar: project.title_ar,
      description_en: project.description_en,
      description_ar: project.description_ar,
      image_url: project.image_url,
      project_link: project.project_link,
      status: project.status,
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (project: PortfolioProject) => {
    setSelectedProject(project);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (selectedProject) {
        // Update existing project
        const { error } = await supabase
          .from('portfolio_projects')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedProject.id);

        if (error) throw error;
        toast.success(language === 'ar' ? 'تم تحديث المشروع' : 'Project updated');
      } else {
        // Create new project
        const maxOrder = Math.max(...projects.map(p => p.display_order), 0);
        const { error } = await supabase
          .from('portfolio_projects')
          .insert({
            ...formData,
            display_order: maxOrder + 1,
          });

        if (error) throw error;
        toast.success(language === 'ar' ? 'تم إضافة المشروع' : 'Project added');
      }

      setIsDialogOpen(false);
      fetchProjects();
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error(language === 'ar' ? 'حدث خطأ في الحفظ' : 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProject) return;

    try {
      const { error } = await supabase
        .from('portfolio_projects')
        .delete()
        .eq('id', selectedProject.id);

      if (error) throw error;
      
      toast.success(language === 'ar' ? 'تم حذف المشروع' : 'Project deleted');
      setDeleteDialogOpen(false);
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error(language === 'ar' ? 'حدث خطأ في الحذف' : 'Failed to delete project');
    }
  };

  const toggleStatus = async (project: PortfolioProject) => {
    const newStatus = project.status === 'active' ? 'hidden' : 'active';
    
    try {
      const { error } = await supabase
        .from('portfolio_projects')
        .update({ status: newStatus })
        .eq('id', project.id);

      if (error) throw error;
      
      setProjects(prev => 
        prev.map(p => p.id === project.id ? { ...p, status: newStatus } : p)
      );
      toast.success(
        language === 'ar' 
          ? (newStatus === 'active' ? 'المشروع مرئي الآن' : 'المشروع مخفي الآن')
          : (newStatus === 'active' ? 'Project is now visible' : 'Project is now hidden')
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
            {language === 'ar' ? 'إدارة المحفظة' : 'Portfolio Management'}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {language === 'ar' ? 'إضافة وتعديل وحذف مشاريع المحفظة' : 'Add, edit, and manage portfolio projects'}
          </p>
        </div>
        <Button onClick={openAddDialog} className="gap-2 bg-gradient-brand">
          <Plus className="w-4 h-4" />
          {language === 'ar' ? 'إضافة مشروع' : 'Add Project'}
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`bg-card border border-border rounded-xl overflow-hidden ${
              project.status === 'hidden' ? 'opacity-60' : ''
            }`}
          >
            {/* Image */}
            <div className="aspect-video relative overflow-hidden bg-muted">
              {project.image_url ? (
                <img
                  src={project.image_url}
                  alt={language === 'ar' ? project.title_ar : project.title_en}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
              {/* Status Badge */}
              <Badge
                variant="secondary"
                className={`absolute top-2 ${dir === 'rtl' ? 'left-2' : 'right-2'} ${
                  project.status === 'active' 
                    ? 'bg-green-500/20 text-green-600' 
                    : 'bg-yellow-500/20 text-yellow-600'
                }`}
              >
                {project.status === 'active' 
                  ? (language === 'ar' ? 'مرئي' : 'Active')
                  : (language === 'ar' ? 'مخفي' : 'Hidden')
                }
              </Badge>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className={`font-bold mb-1 line-clamp-1 ${dir === 'rtl' ? 'font-arabic-heading' : ''}`}>
                {language === 'ar' ? project.title_ar : project.title_en}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {language === 'ar' ? project.description_ar : project.description_en}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(project)}
                  className="flex-1"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className={`${dir === 'rtl' ? 'mr-1' : 'ml-1'}`}>
                    {language === 'ar' ? 'تعديل' : 'Edit'}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => toggleStatus(project)}
                  title={project.status === 'active' ? 'Hide' : 'Show'}
                >
                  {project.status === 'active' ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  asChild
                >
                  <a href={project.project_link} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => openDeleteDialog(project)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {projects.length === 0 && (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {language === 'ar' ? 'لا توجد مشاريع' : 'No projects yet'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {language === 'ar' ? 'ابدأ بإضافة أول مشروع لك' : 'Start by adding your first project'}
          </p>
          <Button onClick={openAddDialog} className="gap-2">
            <Plus className="w-4 h-4" />
            {language === 'ar' ? 'إضافة مشروع' : 'Add Project'}
          </Button>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className={dir === 'rtl' ? 'font-arabic-heading' : ''}>
              {selectedProject 
                ? (language === 'ar' ? 'تعديل المشروع' : 'Edit Project')
                : (language === 'ar' ? 'إضافة مشروع جديد' : 'Add New Project')
              }
            </DialogTitle>
            <DialogDescription>
              {language === 'ar' 
                ? 'أدخل تفاصيل المشروع بالعربية والإنجليزية'
                : 'Enter project details in both Arabic and English'
              }
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title English */}
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}</Label>
              <Input
                value={formData.title_en}
                onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                placeholder="Project title in English"
                required
                dir="ltr"
              />
            </div>

            {/* Title Arabic */}
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}</Label>
              <Input
                value={formData.title_ar}
                onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                placeholder="عنوان المشروع بالعربية"
                required
                dir="rtl"
              />
            </div>

            {/* Description English */}
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}</Label>
              <Textarea
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                placeholder="Project description in English"
                required
                rows={3}
                dir="ltr"
              />
            </div>

            {/* Description Arabic */}
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}</Label>
              <Textarea
                value={formData.description_ar}
                onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                placeholder="وصف المشروع بالعربية"
                required
                rows={3}
                dir="rtl"
              />
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'رابط الصورة' : 'Image URL'}</Label>
              <Input
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
                type="url"
                required
                dir="ltr"
              />
              {formData.image_url && (
                <div className="mt-2 aspect-video max-w-xs rounded-lg overflow-hidden bg-muted">
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Project Link */}
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'رابط المشروع' : 'Project Link'}</Label>
              <Input
                value={formData.project_link}
                onChange={(e) => setFormData({ ...formData, project_link: e.target.value })}
                placeholder="https://example.com"
                type="url"
                required
                dir="ltr"
              />
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
                {selectedProject 
                  ? (language === 'ar' ? 'حفظ التغييرات' : 'Save Changes')
                  : (language === 'ar' ? 'إضافة المشروع' : 'Add Project')
                }
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'ar' 
                ? 'سيتم حذف هذا المشروع نهائياً ولا يمكن استعادته.'
                : 'This action cannot be undone. This will permanently delete the project.'}
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
