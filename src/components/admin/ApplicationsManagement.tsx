import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Download, ExternalLink, Search, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

interface Application {
  id: string;
  job_id: string;
  full_name: string;
  email: string;
  phone: string;
  linkedin_url: string | null;
  portfolio_url: string | null;
  years_of_experience: string;
  cover_letter: string | null;
  cv_url: string | null;
  status: string;
  created_at: string;
  jobs?: { title_en: string; title_ar: string; job_type: string } | null;
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  reviewing: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  shortlisted: 'bg-green-500/10 text-green-600 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-600 border-red-500/20',
  hired: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
};

const statusLabels: Record<string, { en: string; ar: string }> = {
  new: { en: 'New', ar: 'جديد' },
  reviewing: { en: 'Reviewing', ar: 'قيد المراجعة' },
  shortlisted: { en: 'Shortlisted', ar: 'مرشح' },
  rejected: { en: 'Rejected', ar: 'مرفوض' },
  hired: { en: 'Hired', ar: 'تم التوظيف' },
};

export default function ApplicationsManagement() {
  const { language, dir } = useLanguage();
  const isAr = language === 'ar';
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Application | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterJobType, setFilterJobType] = useState('all');

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from('job_applications')
      .select('*, jobs(title_en, title_ar, job_type)')
      .order('created_at', { ascending: false });
    if (error) { console.error(error); toast.error('Failed to load applications'); }
    else setApplications(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchApplications(); }, []);

  const updateStatus = async (id: string, status: "new" | "reviewing" | "shortlisted" | "rejected" | "hired") => {
    const { error } = await supabase.from('job_applications').update({ status }).eq('id', id);
    if (error) toast.error('Update failed');
    else {
      toast.success(isAr ? 'تم التحديث' : 'Status updated');
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
    }
  };

  const filtered = applications.filter(a => {
    const matchSearch = !search ||
      a.full_name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    const matchType = filterJobType === 'all' || a.jobs?.job_type === filterJobType;
    return matchSearch && matchStatus && matchType;
  });

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold ${dir === 'rtl' ? 'font-arabic-heading' : ''}`}>
        {isAr ? 'طلبات التوظيف' : 'Job Applications'}
      </h2>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.entries(statusLabels).map(([key, label]) => {
          const count = applications.filter(a => a.status === key).length;
          return (
            <div key={key} className={`rounded-xl p-3 border ${statusColors[key]}`}>
              <div className="text-xl font-bold">{count}</div>
              <div className="text-xs opacity-80">{isAr ? label.ar : label.en}</div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={isAr ? 'بحث بالاسم أو البريد...' : 'Search by name or email...'}
            className="pl-10"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isAr ? 'الكل' : 'All Status'}</SelectItem>
            {Object.entries(statusLabels).map(([k, v]) => (
              <SelectItem key={k} value={k}>{isAr ? v.ar : v.en}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterJobType} onValueChange={setFilterJobType}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isAr ? 'الكل' : 'All Types'}</SelectItem>
            <SelectItem value="full-time">Full-time</SelectItem>
            <SelectItem value="part-time">Part-time</SelectItem>
            <SelectItem value="internship">Internship</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            {isAr ? 'لا توجد طلبات' : 'No applications found'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isAr ? 'الاسم' : 'Name'}</TableHead>
                  <TableHead>{isAr ? 'البريد' : 'Email'}</TableHead>
                  <TableHead>{isAr ? 'الهاتف' : 'Phone'}</TableHead>
                  <TableHead>{isAr ? 'الوظيفة' : 'Job'}</TableHead>
                  <TableHead>{isAr ? 'التاريخ' : 'Date'}</TableHead>
                  <TableHead>{isAr ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead>{isAr ? 'الإجراءات' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((app) => (
                  <TableRow key={app.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelected(app)}>
                    <TableCell className="font-medium">{app.full_name}</TableCell>
                    <TableCell>{app.email}</TableCell>
                    <TableCell dir="ltr">{app.phone}</TableCell>
                    <TableCell>{isAr ? app.jobs?.title_ar : app.jobs?.title_en}</TableCell>
                    <TableCell>{new Date(app.created_at).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}</TableCell>
                    <TableCell>
                      <Select value={app.status} onValueChange={(v: "new" | "reviewing" | "shortlisted" | "rejected" | "hired") => updateStatus(app.id, v)}>
                        <SelectTrigger className="w-[130px]" onClick={e => e.stopPropagation()}>
                          <Badge variant="outline" className={statusColors[app.status]}>
                            {isAr ? statusLabels[app.status]?.ar : statusLabels[app.status]?.en}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusLabels).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{isAr ? v.ar : v.en}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {app.cv_url && (
                        <Button variant="outline" size="sm" className="gap-1" onClick={e => { e.stopPropagation(); window.open(app.cv_url!, '_blank'); }}>
                          <Download className="w-3 h-3" /> CV
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isAr ? 'تفاصيل الطلب' : 'Application Details'}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-1">{isAr ? 'الاسم' : 'Name'}</p>
                  <p className="font-medium">{selected.full_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">{isAr ? 'البريد' : 'Email'}</p>
                  <p className="font-medium">{selected.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">{isAr ? 'الهاتف' : 'Phone'}</p>
                  <p className="font-medium" dir="ltr">{selected.phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">{isAr ? 'الخبرة' : 'Experience'}</p>
                  <p className="font-medium">{selected.years_of_experience} {isAr ? 'سنوات' : 'years'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">{isAr ? 'الوظيفة' : 'Applied For'}</p>
                  <p className="font-medium">{isAr ? selected.jobs?.title_ar : selected.jobs?.title_en}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">{isAr ? 'التاريخ' : 'Date'}</p>
                  <p className="font-medium">{new Date(selected.created_at).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}</p>
                </div>
              </div>

              {/* Links */}
              <div className="flex flex-wrap gap-2">
                {selected.linkedin_url && selected.linkedin_url.trim() && (
                  <Button variant="outline" size="sm" onClick={() => window.open(selected.linkedin_url!, '_blank')} className="gap-1">
                    <ExternalLink className="w-3 h-3" /> LinkedIn
                  </Button>
                )}
                {selected.portfolio_url && selected.portfolio_url.trim() && (
                  <Button variant="outline" size="sm" onClick={() => window.open(selected.portfolio_url!, '_blank')} className="gap-1">
                    <ExternalLink className="w-3 h-3" /> Portfolio
                  </Button>
                )}
                {selected.cv_url && (
                  <Button variant="outline" size="sm" onClick={() => window.open(selected.cv_url!, '_blank')} className="gap-1">
                    <Download className="w-3 h-3" /> {isAr ? 'تحميل السيرة الذاتية' : 'Download CV'}
                  </Button>
                )}
              </div>

              {/* Cover Letter */}
              {selected.cover_letter && selected.cover_letter.trim() && (
                <div>
                  <p className="text-muted-foreground text-xs mb-2">{isAr ? 'رسالة التقديم' : 'Cover Letter'}</p>
                  <div className="bg-muted/50 rounded-lg p-4 text-sm whitespace-pre-wrap">
                    {selected.cover_letter}
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs">{isAr ? 'تحديث الحالة' : 'Update Status'}</p>
                <Select value={selected.status} onValueChange={v => updateStatus(selected.id, v)}>
                  <SelectTrigger>
                    <Badge variant="outline" className={statusColors[selected.status]}>
                      {isAr ? statusLabels[selected.status]?.ar : statusLabels[selected.status]?.en}
                    </Badge>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{isAr ? v.ar : v.en}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
