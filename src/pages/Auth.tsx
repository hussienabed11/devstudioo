import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';

const loginSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128),
});

export default function Auth() {
  const { t, language, dir } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate input
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === 'email') fieldErrors.email = err.message;
        if (err.path[0] === 'password') fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error(language === 'ar' ? 'بيانات الدخول غير صحيحة' : 'Invalid email or password');
        } else {
          toast.error(error.message);
        }
        return;
      }

      // Check if email is verified
      if (data.user && !data.user.email_confirmed_at) {
        await supabase.auth.signOut();
        toast.error(
          language === 'ar'
            ? 'يرجى تأكيد بريدك الإلكتروني قبل تسجيل الدخول'
            : 'Please verify your email before logging in'
        );
        return;
      }

      toast.success(t('auth.loginSuccess'));
      navigate('/');
    } catch {
      toast.error(t('auth.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-6">
          <ArrowLeft className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2 rotate-180' : 'mr-2'}`} />
          {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
        </Button>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-lg bg-gradient-brand flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-2xl">VT</span>
            </div>
            <span className="font-bold text-2xl">Vertex Solutions</span>
          </div>

          {/* Title */}
          <h1 className={`text-2xl font-bold text-center mb-2 ${dir === 'rtl' ? 'font-arabic-heading' : ''}`}>
            {t('auth.login')}
          </h1>
          <p className={`text-muted-foreground text-center mb-8 ${dir === 'rtl' ? 'font-arabic' : ''}`}>
            {language === 'ar' ? 'مرحباً بعودتك!' : 'Welcome back!'}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className={`text-sm font-medium ${dir === 'rtl' ? 'font-arabic' : ''}`}>
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground ${dir === 'rtl' ? 'right-3' : 'left-3'}`} />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${dir === 'rtl' ? 'pr-10' : 'pl-10'} ${errors.email ? 'border-destructive' : ''}`}
                  placeholder="name@example.com"
                  required
                />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <label className={`text-sm font-medium ${dir === 'rtl' ? 'font-arabic' : ''}`}>
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground ${dir === 'rtl' ? 'right-3' : 'left-3'}`} />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${dir === 'rtl' ? 'pr-10' : 'pl-10'} ${errors.password ? 'border-destructive' : ''}`}
                  placeholder="••••••••"
                  required
                />
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="w-full bg-gradient-brand hover:opacity-90 text-primary-foreground font-semibold"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('auth.login')}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
