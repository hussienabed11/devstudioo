import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

interface Job {
  id: string;
  title_en: string;
  title_ar: string;
  slug: string;
  short_description_en: string;
  short_description_ar: string;
  full_description_en: string;
  full_description_ar: string;
  responsibilities_en: string;
  responsibilities_ar: string;
  requirements_en: string;
  requirements_ar: string;
  nice_to_have_en: string | null;
  nice_to_have_ar: string | null;
  benefits_en: string | null;
  benefits_ar: string | null;
  job_type: string;
  department_en: string | null;
  department_ar: string | null;
  location_en: string;
  location_ar: string;
  status: string;
  application_deadline: string | null;
  display_order: number;
  created_at: string;
}

type FormData = Omit<Job, 'id' | 'created_at'>;

const emptyForm: FormData = {
  title_en: '', title_ar: '', slug: '',
  short_description_en: '', short_description_ar: '',
  full_description_en: '', full_description_ar: '',
  responsibilities_en: '', responsibilities_ar: '',
  requirements_en: '', requirements_ar: '',
  nice_to_have_en: '', nice_to_have_ar: '',
  benefits_en: '', benefits_ar: '',
  job_type: 'full-time',
  department_en: '', department_ar: '',
  location_en: 'Remote', location_ar: 'عن بعد',
  status: 'open', application_deadline: null, display_order: 0,
};

export default function JobsManagement() {
  const { language, dir } = useLanguage();
  const isAr = language === 'ar';
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Job | null>(null);
  const [deleting, setDeleting] = useState<Job | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) { console.error(error); toast.error('Failed to load jobs'); }
    else setJobs(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchJobs(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (job: Job) => {
    setEditing(job);
    const { id, created_at, ...rest } = job;
    setForm(rest as FormData);
    setDialogOpen(true);
  };

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const update = (field: keyof FormData, value: string | number | null) =>
    setForm(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'title_en' && !editing ? { slug: generateSlug(value as string) } : {}),
    }));

  const handleSubmit = async () => {
    if (!form.title_en || !form.title_ar || !form.slug) {
      toast.error(isAr ? 'يرجى ملء الحقول المطلوبة' : 'Please fill required fields');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const { error } = await supabase.from('jobs').update(form).eq('id', editing.id);
        if (error) throw error;
        toast.success(isAr ? 'تم تحديث الوظيفة' : 'Job updated');
      } else {
        const { error } = await supabase.from('jobs').insert(form);
        if (error) throw error;
        toast.success(isAr ? 'تم إنشاء الوظيفة' : 'Job created');
      }
      setDialogOpen(false);
      fetchJobs();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    const { error } = await supabase.from('jobs').delete().eq('id', deleting.id);
    if (error) toast.error('Delete failed');
    else { toast.success(isAr ? 'تم الحذف' : 'Deleted'); fetchJobs(); }
    setDeleteOpen(false);
  };

  const toggleStatus = async (job: Job) => {
    const newStatus = job.status === 'open' ? 'closed' : 'open';
    const { error } = await supabase.from('jobs').update({ status: newStatus }).eq('id', job.id);
    if (error) toast.error('Failed');
    else { toast.success(isAr ? 'تم التحديث' : 'Updated'); fetchJobs(); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-bold ${dir === 'rtl' ? 'font-arabic-heading' : ''}`}>
          {isAr ? 'إدارة الوظائف' : 'Jobs Management'}
        </h2>
        <Button onClick={openAdd} className="gap-2 bg-gradient-brand text-white">
          <Plus className="w-4 h-4" /> {isAr ? 'إضافة وظيفة' : 'Add Job'}
        </Button>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {isAr ? 'لا توجد وظائف. أضف وظيفة جديدة.' : 'No jobs yet. Add your first job.'}
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card border border-border rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold truncate">{isAr ? job.title_ar : job.title_en}</h3>
                  <Badge variant={job.status === 'open' ? 'default' : 'secondary'} className="text-xs shrink-0">
                    {job.status === 'open' ? (isAr ? 'مفتوح' : 'Open') : (isAr ? 'مغلق' : 'Closed')}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {isAr ? job.short_description_ar : job.short_description_en}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="icon" onClick={() => openEdit(job)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => toggleStatus(job)}>
                  {job.status === 'open' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button variant="outline" size="icon" className="text-destructive" onClick={() => { setDeleting(job); setDeleteOpen(true); }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? (isAr ? 'تعديل وظيفة' : 'Edit Job') : (isAr ? 'إضافة وظيفة' : 'Add Job')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title (EN) *</Label>
                <Input value={form.title_en} onChange={e => update('title_en', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>العنوان (AR) *</Label>
                <Input dir="rtl" value={form.title_ar} onChange={e => update('title_ar', e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Slug *</Label>
              <Input dir="ltr" value={form.slug} onChange={e => update('slug', e.target.value)} placeholder="frontend-developer" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Short Description (EN)</Label>
                <Textarea value={form.short_description_en} onChange={e => update('short_description_en', e.target.value)} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>وصف مختصر (AR)</Label>
                <Textarea dir="rtl" value={form.short_description_ar} onChange={e => update('short_description_ar', e.target.value)} rows={2} />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Description (EN)</Label>
                <Textarea value={form.full_description_en} onChange={e => update('full_description_en', e.target.value)} rows={4} />
              </div>
              <div className="space-y-2">
                <Label>الوصف الكامل (AR)</Label>
                <Textarea dir="rtl" value={form.full_description_ar} onChange={e => update('full_description_ar', e.target.value)} rows={4} />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Responsibilities (EN)</Label>
                <Textarea value={form.responsibilities_en} onChange={e => update('responsibilities_en', e.target.value)} rows={3} placeholder="One per line" />
              </div>
              <div className="space-y-2">
                <Label>المسؤوليات (AR)</Label>
                <Textarea dir="rtl" value={form.responsibilities_ar} onChange={e => update('responsibilities_ar', e.target.value)} rows={3} />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Requirements (EN)</Label>
                <Textarea value={form.requirements_en} onChange={e => update('requirements_en', e.target.value)} rows={3} placeholder="One per line" />
              </div>
              <div className="space-y-2">
                <Label>المتطلبات (AR)</Label>
                <Textarea dir="rtl" value={form.requirements_ar} onChange={e => update('requirements_ar', e.target.value)} rows={3} />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nice to Have (EN)</Label>
                <Textarea value={form.nice_to_have_en || ''} onChange={e => update('nice_to_have_en', e.target.value)} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>مهارات إضافية (AR)</Label>
                <Textarea dir="rtl" value={form.nice_to_have_ar || ''} onChange={e => update('nice_to_have_ar', e.target.value)} rows={2} />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Benefits (EN)</Label>
                <Textarea value={form.benefits_en || ''} onChange={e => update('benefits_en', e.target.value)} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>المزايا (AR)</Label>
                <Textarea dir="rtl" value={form.benefits_ar || ''} onChange={e => update('benefits_ar', e.target.value)} rows={2} />
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{isAr ? 'نوع الوظيفة' : 'Job Type'}</Label>
                <Select value={form.job_type} onValueChange={v => update('job_type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location (EN)</Label>
                <Input value={form.location_en} onChange={e => update('location_en', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>الموقع (AR)</Label>
                <Input dir="rtl" value={form.location_ar} onChange={e => update('location_ar', e.target.value)} />
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Department (EN)</Label>
                <Input value={form.department_en || ''} onChange={e => update('department_en', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>القسم (AR)</Label>
                <Input dir="rtl" value={form.department_ar || ''} onChange={e => update('department_ar', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{isAr ? 'آخر موعد للتقديم' : 'Application Deadline'}</Label>
                <Input type="date" value={form.application_deadline || ''} onChange={e => update('application_deadline', e.target.value || null)} />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isAr ? 'الحالة' : 'Status'}</Label>
                <Select value={form.status} onValueChange={v => update('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">{isAr ? 'مفتوح' : 'Open'}</SelectItem>
                    <SelectItem value="closed">{isAr ? 'مغلق' : 'Closed'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{isAr ? 'ترتيب العرض' : 'Display Order'}</Label>
                <Input type="number" value={form.display_order} onChange={e => update('display_order', parseInt(e.target.value) || 0)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{isAr ? 'إلغاء' : 'Cancel'}</Button>
            <Button onClick={handleSubmit} disabled={saving} className="bg-gradient-brand text-white">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editing ? (isAr ? 'تحديث' : 'Update') : (isAr ? 'إنشاء' : 'Create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isAr ? 'هل أنت متأكد؟' : 'Are you sure?'}</AlertDialogTitle>
            <AlertDialogDescription>
              {isAr ? 'سيتم حذف هذه الوظيفة وجميع الطلبات المرتبطة بها نهائياً.' : 'This will permanently delete this job and all associated applications.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{isAr ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              {isAr ? 'حذف' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
