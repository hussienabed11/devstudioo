import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ContactInfo {
  id: string;
  email: string;
  phone: string;
  whatsapp: string | null;
  address_en: string | null;
  address_ar: string | null;
  website_url: string | null;
}

interface ContactInfoContextType {
  contactInfo: ContactInfo | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

const ContactInfoContext = createContext<ContactInfoContextType | undefined>(undefined);

export function ContactInfoProvider({ children }: { children: ReactNode }) {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchContactInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_info')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setContactInfo(data);
    } catch (error) {
      console.error('Error fetching contact info:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactInfo();
  }, []);

  return (
    <ContactInfoContext.Provider value={{ contactInfo, loading, refetch: fetchContactInfo }}>
      {children}
    </ContactInfoContext.Provider>
  );
}

export function useContactInfo() {
  const context = useContext(ContactInfoContext);
  if (context === undefined) {
    throw new Error('useContactInfo must be used within a ContactInfoProvider');
  }
  return context;
}
