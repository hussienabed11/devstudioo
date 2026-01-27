import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Trash2, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type BookingStatus = 'pending' | 'approved' | 'rejected';

interface Booking {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  service_type: string;
  preferred_date: string;
  preferred_time: string;
  message: string | null;
  status: BookingStatus;
  created_at: string;
}

const statusConfig = {
  pending: { icon: Clock, color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
  approved: { icon: CheckCircle, color: 'bg-green-500/10 text-green-600 border-green-500/20' },
  rejected: { icon: XCircle, color: 'bg-red-500/10 text-red-600 border-red-500/20' },
};

export default function Admin() {
  const { t, language, dir } = useLanguage();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (!authLoading && user && !isAdmin) {
      toast.error(language === 'ar' ? 'غير مصرح لك بالوصول' : 'You are not authorized to access this page');
      navigate('/');
    }
  }, [user, isAdmin, authLoading, navigate, language]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error(language === 'ar' ? 'حدث خطأ في تحميل البيانات' : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchBookings();
    }
  }, [isAdmin]);

  const updateStatus = async (id: string, status: BookingStatus) => {
    setUpdating(id);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
      toast.success(language === 'ar' ? 'تم تحديث الحالة' : 'Status updated');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(language === 'ar' ? 'حدث خطأ في التحديث' : 'Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const deleteBooking = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setBookings(prev => prev.filter(b => b.id !== id));
      toast.success(language === 'ar' ? 'تم حذف الحجز' : 'Booking deleted');
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error(language === 'ar' ? 'حدث خطأ في الحذف' : 'Failed to delete booking');
    }
  };

  const getServiceLabel = (type: string) => {
    const services: Record<string, { en: string; ar: string }> = {
      uiux: { en: 'UI/UX Design', ar: 'تصميم واجهات المستخدم' },
      web: { en: 'Web Development', ar: 'تطوير المواقع' },
      mobile: { en: 'Mobile Development', ar: 'تطوير التطبيقات' },
      seo: { en: 'SEO Optimization', ar: 'تحسين محركات البحث' },
    };
    return language === 'ar' ? services[type]?.ar || type : services[type]?.en || type;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
        >
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mb-2"
            >
              <ArrowLeft className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2 rotate-180' : 'mr-2'}`} />
              {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
            </Button>
            <h1 className={`text-3xl font-bold ${dir === 'rtl' ? 'font-arabic-heading' : ''}`}>
              {t('admin.title')}
            </h1>
          </div>
          <Button onClick={fetchBookings} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            {language === 'ar' ? 'تحديث' : 'Refresh'}
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
        <div className="bg-primary/10 text-primary rounded-xl p-4 border border-primary/20">
            <div className="text-2xl font-bold">{bookings.length}</div>
            <div className="text-sm opacity-80">{language === 'ar' ? 'الكل' : 'Total'}</div>
          </div>
          <div className="bg-accent/20 text-accent-foreground rounded-xl p-4 border border-accent/30">
            <div className="text-2xl font-bold">{bookings.filter(b => b.status === 'pending').length}</div>
            <div className="text-sm opacity-80">{t('admin.status.pending')}</div>
          </div>
          <div className="bg-secondary/20 text-secondary-foreground rounded-xl p-4 border border-secondary/30">
            <div className="text-2xl font-bold">{bookings.filter(b => b.status === 'approved').length}</div>
            <div className="text-sm opacity-80">{t('admin.status.approved')}</div>
          </div>
          <div className="bg-destructive/10 text-destructive rounded-xl p-4 border border-destructive/20">
            <div className="text-2xl font-bold">{bookings.filter(b => b.status === 'rejected').length}</div>
            <div className="text-sm opacity-80">{t('admin.status.rejected')}</div>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-xl overflow-hidden"
        >
          {bookings.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              {t('admin.noBookings')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('booking.form.name')}</TableHead>
                    <TableHead>{t('booking.form.email')}</TableHead>
                    <TableHead>{t('booking.form.phone')}</TableHead>
                    <TableHead>{t('booking.form.service')}</TableHead>
                    <TableHead>{t('booking.form.date')}</TableHead>
                    <TableHead>{t('booking.form.time')}</TableHead>
                    <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                    <TableHead>{t('admin.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => {
                    const StatusIcon = statusConfig[booking.status].icon;
                    return (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.full_name}</TableCell>
                        <TableCell>{booking.email}</TableCell>
                        <TableCell dir="ltr">{booking.phone}</TableCell>
                        <TableCell>{getServiceLabel(booking.service_type)}</TableCell>
                        <TableCell>{new Date(booking.preferred_date).toLocaleDateString()}</TableCell>
                        <TableCell>{booking.preferred_time}</TableCell>
                        <TableCell>
                          <Select
                            value={booking.status}
                            onValueChange={(value: BookingStatus) => updateStatus(booking.id, value)}
                            disabled={updating === booking.id}
                          >
                            <SelectTrigger className="w-[140px]">
                              {updating === booking.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Badge variant="outline" className={statusConfig[booking.status].color}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {t(`admin.status.${booking.status}`)}
                                </Badge>
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-yellow-600" />
                                  {t('admin.status.pending')}
                                </div>
                              </SelectItem>
                              <SelectItem value="approved">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  {t('admin.status.approved')}
                                </div>
                              </SelectItem>
                              <SelectItem value="rejected">
                                <div className="flex items-center gap-2">
                                  <XCircle className="w-4 h-4 text-red-600" />
                                  {t('admin.status.rejected')}
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {language === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?'}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {language === 'ar' 
                                    ? 'سيتم حذف هذا الحجز نهائياً ولا يمكن استعادته.'
                                    : 'This action cannot be undone. This will permanently delete the booking.'}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>
                                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteBooking(booking.id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  {t('admin.delete')}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
