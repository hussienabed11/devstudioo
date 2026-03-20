import React, { useState, useEffect } from 'react';
import { Loader2, Trash2, Star, StarOff, Eye, X, RefreshCw, Search } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type LeadStatus = 'new' | 'contacted' | 'closed';

interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  message: string | null;
  preferred_contact_time: string | null;
  selected_service: string;
  status: LeadStatus;
  is_important: boolean;
  created_at: string;
}

const statusColors: Record<LeadStatus, string> = {
  new: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  contacted: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  closed: 'bg-green-500/10 text-green-600 border-green-500/20',
};

export default function LeadsManagement() {
  const { language, dir } = useLanguage();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('service_leads')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setLeads((data as Lead[]) || []);
    } catch (error) {
      console.error(error);
      toast.error(language === 'ar' ? 'خطأ في تحميل البيانات' : 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, []);

  const updateStatus = async (id: string, status: LeadStatus) => {
    try {
      const { error } = await supabase.from('service_leads').update({ status }).eq('id', id);
      if (error) throw error;
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
      toast.success(language === 'ar' ? 'تم التحديث' : 'Status updated');
    } catch { toast.error(language === 'ar' ? 'خطأ' : 'Error'); }
  };

  const toggleImportant = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase.from('service_leads').update({ is_important: !current }).eq('id', id);
      if (error) throw error;
      setLeads(prev => prev.map(l => l.id === id ? { ...l, is_important: !current } : l));
    } catch { toast.error(language === 'ar' ? 'خطأ' : 'Error'); }
  };

  const deleteLead = async (id: string) => {
    try {
      const { error } = await supabase.from('service_leads').delete().eq('id', id);
      if (error) throw error;
      setLeads(prev => prev.filter(l => l.id !== id));
      toast.success(language === 'ar' ? 'تم الحذف' : 'Lead deleted');
    } catch { toast.error(language === 'ar' ? 'خطأ' : 'Error'); }
  };

  const uniqueServices = [...new Set(leads.map(l => l.selected_service))];

  const filtered = leads.filter(l => {
    const matchSearch = !search || l.full_name.toLowerCase().includes(search.toLowerCase()) || l.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    const matchService = serviceFilter === 'all' || l.selected_service === serviceFilter;
    return matchSearch && matchStatus && matchService;
  });

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    closed: leads.filter(l => l.status === 'closed').length,
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-primary/10 text-primary rounded-xl p-4 border border-primary/20">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm opacity-80">{language === 'ar' ? 'الكل' : 'Total'}</div>
        </div>
        <div className="bg-blue-500/10 text-blue-600 rounded-xl p-4 border border-blue-500/20">
          <div className="text-2xl font-bold">{stats.new}</div>
          <div className="text-sm opacity-80">{language === 'ar' ? 'جديد' : 'New'}</div>
        </div>
        <div className="bg-yellow-500/10 text-yellow-600 rounded-xl p-4 border border-yellow-500/20">
          <div className="text-2xl font-bold">{stats.contacted}</div>
          <div className="text-sm opacity-80">{language === 'ar' ? 'تم التواصل' : 'Contacted'}</div>
        </div>
        <div className="bg-green-500/10 text-green-600 rounded-xl p-4 border border-green-500/20">
          <div className="text-2xl font-bold">{stats.closed}</div>
          <div className="text-sm opacity-80">{language === 'ar' ? 'مغلق' : 'Closed'}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${dir === 'rtl' ? 'right-3' : 'left-3'}`} />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={language === 'ar' ? 'بحث بالاسم أو البريد...' : 'Search by name or email...'}
            className={dir === 'rtl' ? 'pr-10' : 'pl-10'}
          />
        </div>
        <Select value={serviceFilter} onValueChange={setServiceFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={language === 'ar' ? 'الخدمة' : 'Service'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{language === 'ar' ? 'جميع الخدمات' : 'All Services'}</SelectItem>
            {uniqueServices.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={language === 'ar' ? 'الحالة' : 'Status'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{language === 'ar' ? 'الكل' : 'All'}</SelectItem>
            <SelectItem value="new">{language === 'ar' ? 'جديد' : 'New'}</SelectItem>
            <SelectItem value="contacted">{language === 'ar' ? 'تم التواصل' : 'Contacted'}</SelectItem>
            <SelectItem value="closed">{language === 'ar' ? 'مغلق' : 'Closed'}</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={fetchLeads} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          {language === 'ar' ? 'تحديث' : 'Refresh'}
        </Button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            {language === 'ar' ? 'لا توجد طلبات' : 'No leads found'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead>{language === 'ar' ? 'الاسم' : 'Name'}</TableHead>
                  <TableHead>{language === 'ar' ? 'الخدمة' : 'Service'}</TableHead>
                  <TableHead>{language === 'ar' ? 'الهاتف' : 'Phone'}</TableHead>
                  <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead>{language === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
                  <TableHead>{language === 'ar' ? 'إجراءات' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(lead => (
                  <TableRow key={lead.id} className={lead.is_important ? 'bg-yellow-500/5' : ''}>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => toggleImportant(lead.id, lead.is_important)}>
                        {lead.is_important ? <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> : <StarOff className="w-4 h-4 text-muted-foreground" />}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">{lead.full_name}</TableCell>
                    <TableCell><Badge variant="outline">{lead.selected_service}</Badge></TableCell>
                    <TableCell dir="ltr">{lead.phone}</TableCell>
                    <TableCell>
                      <Select value={lead.status} onValueChange={(v: string) => updateStatus(lead.id, v as LeadStatus)}>
                        <SelectTrigger className="w-[130px]">
                          <Badge variant="outline" className={statusColors[lead.status]}>
                            {language === 'ar'
                              ? { new: 'جديد', contacted: 'تم التواصل', closed: 'مغلق' }[lead.status]
                              : lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">{language === 'ar' ? 'جديد' : 'New'}</SelectItem>
                          <SelectItem value="contacted">{language === 'ar' ? 'تم التواصل' : 'Contacted'}</SelectItem>
                          <SelectItem value="closed">{language === 'ar' ? 'مغلق' : 'Closed'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{new Date(lead.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedLead(lead)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{language === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?'}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {language === 'ar' ? 'سيتم حذف هذا الطلب نهائياً.' : 'This will permanently delete the lead.'}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{language === 'ar' ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteLead(lead.id)} className="bg-destructive hover:bg-destructive/90">
                                {language === 'ar' ? 'حذف' : 'Delete'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{language === 'ar' ? 'تفاصيل الطلب' : 'Lead Details'}</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <DetailRow label={language === 'ar' ? 'الاسم' : 'Name'} value={selectedLead.full_name} />
              <DetailRow label={language === 'ar' ? 'البريد' : 'Email'} value={selectedLead.email} />
              <DetailRow label={language === 'ar' ? 'الهاتف' : 'Phone'} value={selectedLead.phone} dir="ltr" />
              <DetailRow label={language === 'ar' ? 'الخدمة' : 'Service'} value={selectedLead.selected_service} />
              <DetailRow
                label={language === 'ar' ? 'وقت التواصل' : 'Contact Time'}
                value={selectedLead.preferred_contact_time || (language === 'ar' ? 'غير محدد' : 'Not specified')}
              />
              <DetailRow
                label={language === 'ar' ? 'الرسالة' : 'Message'}
                value={selectedLead.message || (language === 'ar' ? 'لا توجد رسالة' : 'No message')}
              />
              <DetailRow label={language === 'ar' ? 'التاريخ' : 'Date'} value={new Date(selectedLead.created_at).toLocaleString()} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailRow({ label, value, dir }: { label: string; value: string; dir?: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium" dir={dir}>{value}</p>
    </div>
  );
}
