import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const passwordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters').max(128),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function ResetPassword() {
  const { language, dir } = useLanguage();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  useEffect(() => {
    // Check if we have access_token in the URL hash (means we came from password reset email)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');
    
    if (!accessToken || type !== 'recovery') {
      // No valid recovery token, redirect to auth
      navigate('/auth');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = passwordSchema.safeParse({ password, confirmPassword });
    if (!result.success) {
      const fieldErrors: { password?: string; confirmPassword?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === 'password') fieldErrors.password = err.message;
        if (err.path[0] === 'confirmPassword') fieldErrors.confirmPassword = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      setIsSuccess(true);
      toast.success(language === 'ar' ? 'تم تحديث كلمة المرور بنجاح!' : 'Password updated successfully!');
      
      // Redirect to home after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-secondary" />
          </div>
          <h2 className={`text-2xl font-bold mb-2 ${dir === 'rtl' ? 'font-arabic-heading' : ''}`}>
            {language === 'ar' ? 'تم تحديث كلمة المرور!' : 'Password Updated!'}
          </h2>
          <p className={`text-muted-foreground ${dir === 'rtl' ? 'font-arabic' : ''}`}>
            {language === 'ar' ? 'جاري تحويلك للصفحة الرئيسية...' : 'Redirecting you to the home page...'}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4">
      {/* Background Elements */}
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
        <Button
          variant="ghost"
          onClick={() => navigate('/auth')}
          className="mb-6"
        >
          <ArrowLeft className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2 rotate-180' : 'mr-2'}`} />
          {language === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Login'}
        </Button>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-lg bg-gradient-brand flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-2xl">D</span>
            </div>
            <span className="font-bold text-2xl">DevStudio</span>
          </div>

          {/* Title */}
          <h1 className={`text-2xl font-bold text-center mb-2 ${dir === 'rtl' ? 'font-arabic-heading' : ''}`}>
            {language === 'ar' ? 'تعيين كلمة مرور جديدة' : 'Set New Password'}
          </h1>
          <p className={`text-muted-foreground text-center mb-8 ${dir === 'rtl' ? 'font-arabic' : ''}`}>
            {language === 'ar' ? 'أدخل كلمة المرور الجديدة' : 'Enter your new password'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className={`text-sm font-medium ${dir === 'rtl' ? 'font-arabic' : ''}`}>
                {language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
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
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className={`text-sm font-medium ${dir === 'rtl' ? 'font-arabic' : ''}`}>
                {language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
              </label>
              <div className="relative">
                <Lock className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground ${dir === 'rtl' ? 'right-3' : 'left-3'}`} />
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`${dir === 'rtl' ? 'pr-10' : 'pl-10'} ${errors.confirmPassword ? 'border-destructive' : ''}`}
                  placeholder="••••••••"
                  required
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="w-full bg-gradient-brand hover:opacity-90 text-primary-foreground font-semibold"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                language === 'ar' ? 'تحديث كلمة المرور' : 'Update Password'
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
