-- Create portfolio_projects table
CREATE TABLE public.portfolio_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_ar TEXT NOT NULL,
  image_url TEXT NOT NULL,
  project_link TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'hidden')),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Anyone can view active projects (public read)
CREATE POLICY "Anyone can view active portfolio projects" 
ON public.portfolio_projects 
FOR SELECT 
USING (status = 'active');

-- Admins can view all projects
CREATE POLICY "Admins can view all portfolio projects" 
ON public.portfolio_projects 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert projects
CREATE POLICY "Admins can create portfolio projects" 
ON public.portfolio_projects 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update projects
CREATE POLICY "Admins can update portfolio projects" 
ON public.portfolio_projects 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete projects
CREATE POLICY "Admins can delete portfolio projects" 
ON public.portfolio_projects 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_portfolio_projects_updated_at
BEFORE UPDATE ON public.portfolio_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert the provided portfolio projects
INSERT INTO public.portfolio_projects (title_en, title_ar, description_en, description_ar, image_url, project_link, status, display_order) VALUES
(
  'Customer Support Outsourcing Platform',
  'منصة دعم العملاء للتعهيد الخارجي',
  'This platform connects skilled Egyptian agents with international companies in markets like Germany and the USA. By providing remote support, it helps businesses reduce costs while maintaining high-quality customer service, offering a flexible and efficient outsourcing solution.',
  'تربط هذه المنصة وكلاء مصريين ماهرين بشركات دولية في أسواق مثل ألمانيا والولايات المتحدة. من خلال تقديم دعم عن بُعد، تساعد الشركات على تقليل التكاليف مع الحفاظ على جودة خدمة العملاء العالية، وتقدم حلاً مرنًا وفعالاً للتعهيد.',
  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=80',
  'https://ywmina.com/',
  'active',
  1
),
(
  'Glocal Solutions – Construction & Consultancy',
  'جلوكال سوليوشنز – البناء والاستشارات',
  'Glocal Solutions is a consulting and construction management firm helping businesses navigate U.S. government-funded projects. From regulatory compliance to project execution, the platform provides expert guidance, webinars, and newsletters to ensure companies operate efficiently and successfully in both the U.S. and MENA regions.',
  'جلوكال سوليوشنز هي شركة استشارات وإدارة بناء تساعد الشركات في التعامل مع المشاريع الممولة من الحكومة الأمريكية. من الامتثال التنظيمي إلى تنفيذ المشاريع، توفر المنصة إرشادات متخصصة وندوات عبر الإنترنت ونشرات إخبارية لضمان عمل الشركات بكفاءة ونجاح في كل من الولايات المتحدة ومنطقة الشرق الأوسط وشمال أفريقيا.',
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
  'https://www.glocalsolutions.us/home',
  'active',
  2
),
(
  'Dark Code Learning Platform',
  'منصة دارك كود التعليمية',
  'Dark Code is a comprehensive programming learning platform that offers detailed course information, structured learning paths, and an easy-to-use booking system, making it simple and engaging for learners to efficiently acquire practical skills and advance their coding knowledge.',
  'دارك كود هي منصة تعليمية شاملة للبرمجة تقدم معلومات تفصيلية عن الدورات ومسارات تعليمية منظمة ونظام حجز سهل الاستخدام، مما يجعل اكتساب المهارات العملية وتطوير المعرفة البرمجية أمرًا بسيطًا وجذابًا للمتعلمين.',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80',
  'https://darkcodee.netlify.app/#home',
  'active',
  3
),
(
  'Strategic Solutions for Business Growth',
  'حلول استراتيجية لنمو الأعمال',
  'Strategic Solutions is a consulting service that helps companies grow and succeed by providing expert guidance, tailored strategies, and practical tools to expand operations, streamline workflows, and achieve lasting success.',
  'الحلول الاستراتيجية هي خدمة استشارية تساعد الشركات على النمو والنجاح من خلال تقديم إرشادات متخصصة واستراتيجيات مخصصة وأدوات عملية لتوسيع العمليات وتبسيط سير العمل وتحقيق نجاح دائم.',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
  'https://consulting-sepia-eight.vercel.app/',
  'active',
  4
),
(
  'Elite Medical Center – Comprehensive Healthcare',
  'المركز الطبي إيليت – رعاية صحية شاملة',
  'Elite Medical Center is a multidisciplinary healthcare facility offering specialized services in cardiology, orthopedics, pediatrics, dentistry, radiology, and laboratory diagnostics. With a team of experienced consultants and specialists, the center delivers high-quality, patient-centered care around the clock.',
  'المركز الطبي إيليت هو منشأة رعاية صحية متعددة التخصصات تقدم خدمات متخصصة في أمراض القلب والعظام والأطفال وطب الأسنان والأشعة والتشخيص المخبري. مع فريق من الاستشاريين والمتخصصين ذوي الخبرة، يقدم المركز رعاية عالية الجودة تركز على المريض على مدار الساعة.',
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80',
  'https://elite-medical-center-comprehensive.vercel.app/',
  'active',
  5
),
(
  'GrandView Hotel – Miami Beach',
  'فندق جراند فيو – ميامي بيتش',
  'A modern and responsive hotel website with a smooth booking experience, built to showcase rooms, services, and the unique hospitality of GrandView Hotel in Miami Beach.',
  'موقع فندقي حديث ومتجاوب مع تجربة حجز سلسة، تم بناؤه لعرض الغرف والخدمات والضيافة الفريدة لفندق جراند فيو في ميامي بيتش.',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
  'https://grand-view.vercel.app/index.html',
  'active',
  6
);