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
    'nav.packages': 'packages',
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
    
    // Right Choice Section
    'rightChoice.badge': 'Why Choose Us',
    'rightChoice.title': 'The Right Choice',
    'rightChoice.subtitle': "Partner with a team that's committed to your success. Here's what sets us apart.",
    'rightChoice.experience.title': '3+ Years of Experience',
    'rightChoice.experience.desc': 'Battle-tested solutions from years of solving complex problems across various industries.',
    'rightChoice.team.title': 'Professional Team',
    'rightChoice.team.desc': 'Skilled developers, designers, and project managers dedicated to your success.',
    'rightChoice.quality.title': 'High-Quality Delivery',
    'rightChoice.quality.desc': 'We never compromise on quality. Every project meets the highest standards.',
    'rightChoice.client.title': 'Client-Focused Approach',
    'rightChoice.client.desc': 'Your goals are our priority. We work closely with you at every step.',
    'rightChoice.whatYouGet': 'What You Get',
    'rightChoice.cta': 'Start Your Project',
    
    // Packages
    'packages.badge': 'Our Packages',
    'packages.title': 'Our Website Packages',
    'packages.subtitle': 'Choose the right solution for your business stage. Flexible, scalable, and built for growth.',
    'packages.note': 'Final pricing depends on project scope, selected features, and customization requirements.',
    
    // How We Work
    'howWeWork.badge': 'Our Process',
    'howWeWork.title': 'How We Work',
    'howWeWork.subtitle': 'Our step-by-step approach ensures high-quality delivery and excellent support at every stage.',
    'howWeWork.step1.title': 'Discovery & Requirements',
    'howWeWork.step1.desc': 'Understand business goals and technical needs.',
    'howWeWork.step2.title': 'Design & Approval',
    'howWeWork.step2.desc': 'Craft tailored designs and get client feedback.',
    'howWeWork.step3.title': 'Development & Testing',
    'howWeWork.step3.desc': 'Build with clean scalable code, thoroughly tested.',
    'howWeWork.step4.title': 'Launch & Support',
    'howWeWork.step4.desc': 'Deploy project and provide continuous support.',
    'howWeWork.support': 'Strong support team available at every stage',
    
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
    'admin.bookings': 'Bookings',
    'admin.portfolio': 'Portfolio',
    'admin.services': 'Services',
    'admin.packages': 'Packages',
    'admin.contact': 'Contact',
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
    "packages": "الباقات",
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
    
    // Right Choice Section
    'rightChoice.badge': 'لماذا نحن',
    'rightChoice.title': 'الخيار الصحيح',
    'rightChoice.subtitle': 'شارك فريقًا ملتزمًا بنجاحك. إليك ما يميزنا.',
    'rightChoice.experience.title': '+3 سنوات من الخبرة',
    'rightChoice.experience.desc': 'حلول مجربة من سنوات حل المشكلات المعقدة عبر مختلف الصناعات.',
    'rightChoice.team.title': 'فريق محترف',
    'rightChoice.team.desc': 'مطورون ومصممون ومديرو مشاريع ماهرون ملتزمون بنجاحك.',
    'rightChoice.quality.title': 'تسليم عالي الجودة',
    'rightChoice.quality.desc': 'لا نساوم أبدًا على الجودة. كل مشروع يلبي أعلى المعايير.',
    'rightChoice.client.title': 'نهج يركز على العميل',
    'rightChoice.client.desc': 'أهدافك هي أولويتنا. نعمل معك عن كثب في كل خطوة.',
    'rightChoice.whatYouGet': 'ما تحصل عليه',
    'rightChoice.cta': 'ابدأ مشروعك',
    
    // Packages
    'packages.badge': 'باقاتنا',
    'packages.title': 'باقات المواقع',
    'packages.subtitle': 'اختر الحل المناسب لمرحلة عملك. مرنة، قابلة للتوسع، ومصممة للنمو.',
    'packages.note': 'السعر النهائي يعتمد على نطاق المشروع والميزات المختارة ومتطلبات التخصيص.',
    
    // How We Work
    'howWeWork.badge': 'طريقة عملنا',
    'howWeWork.title': 'كيف نعمل',
    'howWeWork.subtitle': 'نهجنا خطوة بخطوة يضمن تسليماً عالي الجودة ودعماً ممتازاً في كل مرحلة.',
    'howWeWork.step1.title': 'الاكتشاف والمتطلبات',
    'howWeWork.step1.desc': 'فهم أهداف العمل والاحتياجات التقنية.',
    'howWeWork.step2.title': 'التصميم والموافقة',
    'howWeWork.step2.desc': 'صياغة تصاميم مخصصة والحصول على ملاحظات العميل.',
    'howWeWork.step3.title': 'التطوير والاختبار',
    'howWeWork.step3.desc': 'بناء بكود نظيف قابل للتوسع، مختبر بدقة.',
    'howWeWork.step4.title': 'الإطلاق والدعم',
    'howWeWork.step4.desc': 'نشر المشروع وتقديم الدعم المستمر.',
    'howWeWork.support': 'فريق دعم قوي متاح في كل مرحلة',
    
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
    'admin.bookings': 'الحجوزات',
    'admin.portfolio': 'المحفظة',
    'admin.services': 'الخدمات',
    'admin.packages': 'الباقات',
    'admin.contact': 'التواصل',
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