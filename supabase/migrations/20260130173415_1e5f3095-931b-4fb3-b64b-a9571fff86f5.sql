-- ================================================
-- 1. Create services table for dynamic services management
-- ================================================
CREATE TABLE public.services (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title_en TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    description_en TEXT NOT NULL,
    description_ar TEXT NOT NULL,
    icon_name TEXT DEFAULT 'Palette',
    display_order INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'hidden')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Public read access for active services
CREATE POLICY "Anyone can view active services"
ON public.services
FOR SELECT
USING (status = 'active');

-- Admins can manage services
CREATE POLICY "Admins can manage services"
ON public.services
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default services
INSERT INTO public.services (title_en, title_ar, description_en, description_ar, icon_name, display_order) VALUES
('UI/UX Design', 'تصميم واجهات المستخدم', 'Beautiful, intuitive designs that enhance user experience and drive engagement.', 'تصاميم جميلة وبديهية تعزز تجربة المستخدم وتزيد التفاعل.', 'Palette', 1),
('Web Development', 'تطوير المواقع', 'Fast, responsive, and scalable web applications built with modern technologies.', 'تطبيقات ويب سريعة ومتجاوبة وقابلة للتوسع مبنية بأحدث التقنيات.', 'Code2', 2),
('Mobile Development', 'تطوير التطبيقات', 'Native and cross-platform mobile apps that deliver exceptional performance.', 'تطبيقات جوال أصلية ومتعددة المنصات تقدم أداءً استثنائياً.', 'Smartphone', 3),
('SEO Optimization', 'تحسين محركات البحث', 'Strategic SEO solutions to boost your online visibility and organic traffic.', 'حلول SEO استراتيجية لتعزيز ظهورك على الإنترنت وزيادة الزيارات العضوية.', 'Search', 4);

-- ================================================
-- 2. Create contact_info table for global contact information
-- ================================================
CREATE TABLE public.contact_info (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL DEFAULT 'info@devstudio.com',
    phone TEXT NOT NULL DEFAULT '+1 (555) 123-4567',
    whatsapp TEXT,
    address_en TEXT DEFAULT 'Dubai, United Arab Emirates',
    address_ar TEXT DEFAULT 'دبي، الإمارات العربية المتحدة',
    website_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.contact_info ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view contact info"
ON public.contact_info
FOR SELECT
USING (true);

-- Admins can manage contact info
CREATE POLICY "Admins can manage contact info"
ON public.contact_info
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_contact_info_updated_at
BEFORE UPDATE ON public.contact_info
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default contact info
INSERT INTO public.contact_info (email, phone, whatsapp, address_en, address_ar) VALUES
('info@devstudio.com', '+1 (555) 123-4567', '+1 (555) 123-4567', 'Dubai, United Arab Emirates', 'دبي، الإمارات العربية المتحدة');

-- ================================================
-- 3. Create packages table for website packages
-- ================================================
CREATE TABLE public.packages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    description_en TEXT NOT NULL,
    description_ar TEXT NOT NULL,
    features_en TEXT[] NOT NULL DEFAULT '{}',
    features_ar TEXT[] NOT NULL DEFAULT '{}',
    marketing_text_en TEXT,
    marketing_text_ar TEXT,
    starting_price TEXT NOT NULL,
    cta_text_en TEXT DEFAULT 'Get Started',
    cta_text_ar TEXT DEFAULT 'ابدأ الآن',
    cta_link TEXT,
    display_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'hidden')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

-- Public read access for active packages
CREATE POLICY "Anyone can view active packages"
ON public.packages
FOR SELECT
USING (status = 'active');

-- Admins can manage packages
CREATE POLICY "Admins can manage packages"
ON public.packages
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_packages_updated_at
BEFORE UPDATE ON public.packages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default packages
INSERT INTO public.packages (name_en, name_ar, description_en, description_ar, features_en, features_ar, marketing_text_en, marketing_text_ar, starting_price, cta_text_en, cta_text_ar, display_order, is_featured) VALUES
(
    'Starter – Get Online',
    'البداية – انطلق على الإنترنت',
    'Perfect for small businesses looking to establish their online presence.',
    'مثالي للشركات الصغيرة التي تتطلع لتأسيس وجودها على الإنترنت.',
    ARRAY['One-page professional website showcasing services and brand story', 'Mobile-friendly design for seamless user experience', 'Basic SEO setup to appear in Google search results', 'Contact & WhatsApp integration for instant communication'],
    ARRAY['موقع احترافي من صفحة واحدة يعرض خدماتك وقصة علامتك التجارية', 'تصميم متوافق مع الجوال لتجربة مستخدم سلسة', 'إعداد SEO أساسي للظهور في نتائج بحث جوجل', 'تكامل التواصل والواتساب للتواصل الفوري'],
    'Establish your online presence, gain credibility, and start connecting with customers today.',
    'أسس وجودك على الإنترنت، واكتسب المصداقية، وابدأ التواصل مع العملاء اليوم.',
    '9,000 EGP',
    'Get Started',
    'ابدأ الآن',
    1,
    false
),
(
    'Growth – Attract More Clients',
    'النمو – اجذب المزيد من العملاء',
    'Designed for growing businesses that need more visibility and client engagement.',
    'مصمم للشركات المتنامية التي تحتاج لمزيد من الظهور والتفاعل مع العملاء.',
    ARRAY['Multi-page website (Home, About, Services, Blog, Contact)', 'Advanced SEO to increase visibility and attract more clients', 'Blog / Content pages to share updates and grow traffic', 'Lead generation forms for inquiries and potential clients', 'Monthly performance report'],
    ARRAY['موقع متعدد الصفحات (الرئيسية، من نحن، الخدمات، المدونة، التواصل)', 'SEO متقدم لزيادة الظهور وجذب المزيد من العملاء', 'صفحات المدونة / المحتوى لمشاركة التحديثات وزيادة الزيارات', 'نماذج توليد العملاء المحتملين للاستفسارات', 'تقرير أداء شهري'],
    'Expand your reach, engage more clients, and grow your business efficiently.',
    'وسّع نطاق وصولك، وتفاعل مع المزيد من العملاء، ونمِّ عملك بكفاءة.',
    '17,000 EGP',
    'Book Free Consultation',
    'احجز استشارة مجانية',
    2,
    true
),
(
    'Premium – Full Power',
    'المميز – القوة الكاملة',
    'The ultimate solution for businesses ready to dominate their market.',
    'الحل الأمثل للشركات المستعدة للهيمنة على سوقها.',
    ARRAY['Custom UI/UX design reflecting brand identity', 'Booking system or online store', 'Advanced analytics for visitor tracking and decision-making', 'Priority support for fast issue resolution', 'Continuous optimization for top performance'],
    ARRAY['تصميم UI/UX مخصص يعكس هوية العلامة التجارية', 'نظام حجز أو متجر إلكتروني', 'تحليلات متقدمة لتتبع الزوار واتخاذ القرارات', 'دعم ذو أولوية لحل المشكلات بسرعة', 'تحسين مستمر لأعلى أداء'],
    'Transform your website into a powerful business tool that drives sales and growth.',
    'حوّل موقعك إلى أداة عمل قوية تدفع المبيعات والنمو.',
    '30,000 EGP',
    'Let''s Talk',
    'لنتحدث',
    3,
    false
);