import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, ArrowLeft, AlertCircle, User } from 'lucide-react';
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

const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128),
});

export default function Auth() {
  const { t, language, dir } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; password?: string }>({});
  const [verificationSent, setVerificationSent] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (isForgotPassword) {
      // Handle forgot password
      const emailResult = z.string().email().safeParse(email);
      if (!emailResult.success) {
        setErrors({ email: 'Invalid email address' });
        return;
      }

      setIsLoading(true);
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) throw error;

        toast.success(
          language === 'ar' 
            ? 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني'
            : 'Password reset link sent to your email'
        );
        setIsForgotPassword(false);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Validate input based on mode
    if (isLogin) {
      const result = loginSchema.safeParse({ email, password });
      if (!result.success) {
        const fieldErrors: { fullName?: string; email?: string; password?: string } = {};
        result.error.errors.forEach((err) => {
          if (err.path[0] === 'email') fieldErrors.email = err.message;
          if (err.path[0] === 'password') fieldErrors.password = err.message;
        });
        setErrors(fieldErrors);
        return;
      }
    } else {
      const result = signupSchema.safeParse({ fullName, email, password });
      if (!result.success) {
        const fieldErrors: { fullName?: string; email?: string; password?: string } = {};
        result.error.errors.forEach((err) => {
          if (err.path[0] === 'fullName') fieldErrors.fullName = err.message;
          if (err.path[0] === 'email') fieldErrors.email = err.message;
          if (err.path[0] === 'password') fieldErrors.password = err.message;
        });
        setErrors(fieldErrors);
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error(language === 'ar' ? 'بيانات الدخول غير صحيحة' : 'Invalid email or password');
          } else if (error.message.includes('Email not confirmed')) {
            toast.error(
              language === 'ar' 
                ? 'يرجى تأكيد بريدك الإلكتروني قبل تسجيل الدخول'
                : 'Please verify your email before logging in'
            );
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
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: fullName,
              name: fullName,
            },
          },
        });

        if (error) {
          if (error.message.includes('already registered')) {
            toast.error(language === 'ar' ? 'البريد الإلكتروني مسجل بالفعل' : 'Email already registered');
          } else {
            toast.error(error.message);
          }
        } else {
          setVerificationSent(true);
        }
      }
    } catch {
      toast.error(t('auth.error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Verification message screen
  if (verificationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-xl text-center"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h2 className={`text-2xl font-bold mb-4 ${dir === 'rtl' ? 'font-arabic-heading' : ''}`}>
            {language === 'ar' ? 'تحقق من بريدك الإلكتروني' : 'Check Your Email'}
          </h2>
          <p className={`text-muted-foreground mb-6 ${dir === 'rtl' ? 'font-arabic' : ''}`}>
            {language === 'ar' 
              ? 'لقد أرسلنا رابط التحقق إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد والنقر على الرابط لتفعيل حسابك.'
              : 'We\'ve sent a verification link to your email. Please check your inbox and click the link to activate your account.'
            }
          </p>
          <div className="flex items-center gap-2 p-4 bg-muted rounded-lg mb-6">
            <AlertCircle className="w-5 h-5 text-primary shrink-0" />
            <p className={`text-sm ${dir === 'rtl' ? 'font-arabic' : ''}`}>
              {language === 'ar' 
                ? 'لن تتمكن من تسجيل الدخول حتى تتحقق من بريدك الإلكتروني.'
                : 'You won\'t be able to log in until you verify your email.'
              }
            </p>
          </div>
          <Button
            onClick={() => {
              setVerificationSent(false);
              setIsLogin(true);
            }}
            variant="outline"
            className="w-full"
          >
            {language === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Login'}
          </Button>
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
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2 rotate-180' : 'mr-2'}`} />
          {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
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
            {isForgotPassword 
              ? (language === 'ar' ? 'نسيت كلمة المرور' : 'Forgot Password')
              : (isLogin ? t('auth.login') : t('auth.signup'))
            }
          </h1>
          <p className={`text-muted-foreground text-center mb-8 ${dir === 'rtl' ? 'font-arabic' : ''}`}>
            {isForgotPassword
              ? (language === 'ar' ? 'أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور' : 'Enter your email to reset your password')
              : (language === 'ar' 
                ? isLogin ? 'مرحباً بعودتك!' : 'أنشئ حساباً جديداً'
                : isLogin ? 'Welcome back!' : 'Create a new account')
            }
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name - Only for signup */}
            {!isLogin && !isForgotPassword && (
              <div className="space-y-2">
                <label className={`text-sm font-medium ${dir === 'rtl' ? 'font-arabic' : ''}`}>
                  {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                </label>
                <div className="relative">
                  <User className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground ${dir === 'rtl' ? 'right-3' : 'left-3'}`} />
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`${dir === 'rtl' ? 'pr-10' : 'pl-10'} ${errors.fullName ? 'border-destructive' : ''}`}
                    placeholder={language === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                    required
                  />
                </div>
                {errors.fullName && (
                  <p className="text-sm text-destructive">{errors.fullName}</p>
                )}
              </div>
            )}

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
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            {!isForgotPassword && (
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
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>
            )}

            {isLogin && !isForgotPassword && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-sm text-primary hover:underline"
                >
                  {language === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                </button>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="w-full bg-gradient-brand hover:opacity-90 text-primary-foreground font-semibold"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isForgotPassword ? (
                language === 'ar' ? 'إرسال رابط الإعادة' : 'Send Reset Link'
              ) : (
                isLogin ? t('auth.login') : t('auth.signup')
              )}
            </Button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            {isForgotPassword ? (
              <button
                type="button"
                onClick={() => setIsForgotPassword(false)}
                className="text-sm text-primary font-medium hover:underline"
              >
                {language === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Login'}
              </button>
            ) : (
              <p className={`text-sm text-muted-foreground ${dir === 'rtl' ? 'font-arabic' : ''}`}>
                {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary font-medium hover:underline"
                >
                  {isLogin ? t('auth.signup') : t('auth.login')}
                </button>
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}