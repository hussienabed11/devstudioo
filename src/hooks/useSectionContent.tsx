import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

export interface SectionContentItem {
  id: string;
  section_name: string;
  content_key: string;
  content_en: string;
  content_ar: string;
  content_type: string;
  display_order: number;
  parent_key: string | null;
}

export function useSectionContent(sectionName: string) {
  const [items, setItems] = useState<SectionContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  const fetchContent = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('section_content')
      .select('*')
      .eq('section_name', sectionName)
      .order('display_order', { ascending: true });

    if (!error && data) {
      setItems(data as SectionContentItem[]);
    }
    setLoading(false);
  }, [sectionName]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const get = useCallback(
    (key: string): string => {
      const item = items.find((i) => i.content_key === key);
      if (!item) return '';
      return language === 'ar' ? item.content_ar : item.content_en;
    },
    [items, language]
  );

  const getAll = useCallback(
    (prefix: string) => {
      return items
        .filter((i) => i.content_key.startsWith(prefix))
        .sort((a, b) => a.display_order - b.display_order);
    },
    [items]
  );

  return { items, loading, get, getAll, refetch: fetchContent };
}

// Helper to get grouped items like features/steps/stats
export function useGroupedContent(sectionName: string, prefix: string) {
  const { items, loading, get, refetch } = useSectionContent(sectionName);
  const { language } = useLanguage();

  const grouped = items
    .filter((i) => i.content_key.startsWith(prefix))
    .reduce<Record<string, Record<string, string>>>((acc, item) => {
      // e.g., "feature_1_title" -> group "1", field "title"
      const withoutPrefix = item.content_key.replace(`${prefix}_`, '');
      const parts = withoutPrefix.split('_');
      const num = parts[0];
      const field = parts.slice(1).join('_');
      if (!acc[num]) acc[num] = {};
      acc[num][field] = language === 'ar' ? item.content_ar : item.content_en;
      return acc;
    }, {});

  const list = Object.entries(grouped)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([num, fields]) => ({ num, ...fields } as { num: string } & Record<string, string>));

  return { list, loading, get, refetch, items };
}
