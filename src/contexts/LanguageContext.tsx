import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navbar
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.services': 'Services',
    'nav.portfolio': 'Portfolio',
    'nav.booking': 'Book Now',
    'nav.admin': 'Admin',
    'nav.login': 'Login',
    'nav.logout': 'Logout',
    
    // Hero
    'hero.title': 'Transforming Ideas into',
    'hero.title.highlight': 'Digital Reality',
    'hero.subtitle': 'With over 3 years of experience, we craft exceptional digital experiences that drive growth and innovation for businesses worldwide.',
    'hero.cta': 'Book a Free Consultation',
    'hero.secondary': 'View Our Work',
    
    // About
    'about.title': 'About Us',
    'about.subtitle': 'Who We Are',
    'about.description': 'We are a passionate team of designers, developers, and strategists dedicated to creating innovative digital solutions. With over 3 years of combined experience, we have helped businesses of all sizes achieve their digital goals.',
    'about.experience': 'Years of Experience',
    'about.projects': 'Projects Completed',
    'about.clients': 'Happy Clients',
    'about.support': '24/7 Support',
    
    // Services
    'services.title': 'Our Services',
    'services.subtitle': 'What We Offer',
    'services.uiux.title': 'UI/UX Design',
    'services.uiux.description': 'Beautiful, intuitive designs that enhance user experience and drive engagement.',
    'services.web.title': 'Web Development',
    'services.web.description': 'Fast, responsive, and scalable web applications built with modern technologies.',
    'services.mobile.title': 'Mobile Development',
    'services.mobile.description': 'Native and cross-platform mobile apps that deliver exceptional performance.',
    'services.seo.title': 'SEO Optimization',
    'services.seo.description': 'Strategic SEO solutions to boost your online visibility and organic traffic.',
    
    // Portfolio
    'portfolio.title': 'Our Portfolio',
    'portfolio.subtitle': 'Recent Projects',
    'portfolio.viewProject': 'View Project',
    
    // Booking
    'booking.title': 'Book a Consultation',
    'booking.subtitle': 'Let\'s discuss your project',
    'booking.form.name': 'Full Name',
    'booking.form.email': 'Email Address',
    'booking.form.phone': 'Phone Number',
    'booking.form.service': 'Service Type',
    'booking.form.date': 'Preferred Date',
    'booking.form.time': 'Preferred Time',
    'booking.form.message': 'Message',
    'booking.form.submit': 'Book Consultation',
    'booking.form.success': 'Your booking has been submitted successfully! We will contact you soon.',
    'booking.form.selectService': 'Select a service',
    'booking.form.selectTime': 'Select a time',
    
    // Footer
    'footer.description': 'Transforming ideas into digital reality with innovative solutions and exceptional design.',
    'footer.quickLinks': 'Quick Links',
    'footer.contact': 'Contact Us',
    'footer.rights': 'All rights reserved.',
    
    // Admin
    'admin.title': 'Admin Dashboard',
    'admin.bookings': 'Booking Requests',
    'admin.noBookings': 'No bookings found.',
    'admin.status.pending': 'Pending',
    'admin.status.approved': 'Approved',
    'admin.status.rejected': 'Rejected',
    'admin.actions': 'Actions',
    'admin.delete': 'Delete',
    
    // Auth
    'auth.login': 'Login',
    'auth.signup': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'auth.loginSuccess': 'Logged in successfully!',
    'auth.signupSuccess': 'Account created successfully!',
    'auth.error': 'Authentication error. Please try again.',
  },
  ar: {
    // Navbar
    'nav.home': 'الرئيسية',
    'nav.about': 'من نحن',
    'nav.services': 'خدماتنا',
    'nav.portfolio': 'أعمالنا',
    'nav.booking': 'احجز الآن',
    'nav.admin': 'لوحة التحكم',
    'nav.login': 'تسجيل الدخول',
    'nav.logout': 'تسجيل الخروج',
    
    // Hero
    'hero.title': 'نحول أفكارك إلى',
    'hero.title.highlight': 'واقع رقمي',
    'hero.subtitle': 'بخبرة تزيد عن 3 سنوات، نقدم تجارب رقمية استثنائية تدفع النمو والابتكار للشركات حول العالم.',
    'hero.cta': 'احجز استشارة مجانية',
    'hero.secondary': 'شاهد أعمالنا',
    
    // About
    'about.title': 'من نحن',
    'about.subtitle': 'تعرف علينا',
    'about.description': 'نحن فريق شغوف من المصممين والمطورين والاستراتيجيين المكرسين لإنشاء حلول رقمية مبتكرة. مع أكثر من 3 سنوات من الخبرة المجمعة، ساعدنا الشركات من جميع الأحجام في تحقيق أهدافها الرقمية.',
    'about.experience': 'سنوات الخبرة',
    'about.projects': 'مشروع مكتمل',
    'about.clients': 'عميل سعيد',
    'about.support': 'دعم على مدار الساعة',
    
    // Services
    'services.title': 'خدماتنا',
    'services.subtitle': 'ما نقدمه',
    'services.uiux.title': 'تصميم واجهات المستخدم',
    'services.uiux.description': 'تصاميم جميلة وبديهية تعزز تجربة المستخدم وتزيد التفاعل.',
    'services.web.title': 'تطوير المواقع',
    'services.web.description': 'تطبيقات ويب سريعة ومتجاوبة وقابلة للتوسع مبنية بأحدث التقنيات.',
    'services.mobile.title': 'تطوير التطبيقات',
    'services.mobile.description': 'تطبيقات جوال أصلية ومتعددة المنصات تقدم أداءً استثنائياً.',
    'services.seo.title': 'تحسين محركات البحث',
    'services.seo.description': 'حلول SEO استراتيجية لتعزيز ظهورك على الإنترنت وزيادة الزيارات العضوية.',
    
    // Portfolio
    'portfolio.title': 'أعمالنا',
    'portfolio.subtitle': 'مشاريع حديثة',
    'portfolio.viewProject': 'عرض المشروع',
    
    // Booking
    'booking.title': 'احجز استشارة',
    'booking.subtitle': 'دعنا نناقش مشروعك',
    'booking.form.name': 'الاسم الكامل',
    'booking.form.email': 'البريد الإلكتروني',
    'booking.form.phone': 'رقم الهاتف',
    'booking.form.service': 'نوع الخدمة',
    'booking.form.date': 'التاريخ المفضل',
    'booking.form.time': 'الوقت المفضل',
    'booking.form.message': 'الرسالة',
    'booking.form.submit': 'إرسال الحجز',
    'booking.form.success': 'تم إرسال حجزك بنجاح! سنتواصل معك قريباً.',
    'booking.form.selectService': 'اختر خدمة',
    'booking.form.selectTime': 'اختر وقتاً',
    
    // Footer
    'footer.description': 'نحول الأفكار إلى واقع رقمي من خلال حلول مبتكرة وتصميم استثنائي.',
    'footer.quickLinks': 'روابط سريعة',
    'footer.contact': 'تواصل معنا',
    'footer.rights': 'جميع الحقوق محفوظة.',
    
    // Admin
    'admin.title': 'لوحة التحكم',
    'admin.bookings': 'طلبات الحجز',
    'admin.noBookings': 'لا توجد حجوزات.',
    'admin.status.pending': 'قيد الانتظار',
    'admin.status.approved': 'مقبول',
    'admin.status.rejected': 'مرفوض',
    'admin.actions': 'الإجراءات',
    'admin.delete': 'حذف',
    
    // Auth
    'auth.login': 'تسجيل الدخول',
    'auth.signup': 'إنشاء حساب',
    'auth.email': 'البريد الإلكتروني',
    'auth.password': 'كلمة المرور',
    'auth.noAccount': 'ليس لديك حساب؟',
    'auth.hasAccount': 'لديك حساب بالفعل؟',
    'auth.loginSuccess': 'تم تسجيل الدخول بنجاح!',
    'auth.signupSuccess': 'تم إنشاء الحساب بنجاح!',
    'auth.error': 'خطأ في المصادقة. يرجى المحاولة مرة أخرى.',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
