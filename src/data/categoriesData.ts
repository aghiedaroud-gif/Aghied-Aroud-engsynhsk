import { ProjectCategory } from '../types';

export const DEFAULT_PROJECT_CATEGORIES: ProjectCategory[] = [
  {
    id: 'cat_res',
    code: 'RES-01',
    name_ar: 'الأبنية السكنية والفلل',
    name_ku: 'Avahiyên Niştecîbûnê',
    color: '#00FFD1',
    description: 'المنازل الفردية، الطوابق السكنية، الفلل والمجمعات الأسرية',
    targetSharePct: 45,
    isDefault: true,
    createdAt: '2026-01-01'
  },
  {
    id: 'cat_com',
    code: 'COM-02',
    name_ar: 'المجمعات التجارية والمكاتب',
    name_ku: 'Navendên Bazirganî û Nivîsgeh',
    color: '#3B82F6',
    description: 'المولات، المحلات، الأسواق والمباني الإدارية التجارية',
    targetSharePct: 20,
    isDefault: true,
    createdAt: '2026-01-01'
  },
  {
    id: 'cat_ind',
    code: 'IND-03',
    name_ar: 'المنشآت الصناعية والمستودعات',
    name_ku: 'Avahiyên Pîşesazî û Embar',
    color: '#F59E0B',
    description: 'المعامل، الورش الحرفية، مستودعات التخزين والهناجر المعدنية',
    targetSharePct: 12,
    isDefault: true,
    createdAt: '2026-01-01'
  },
  {
    id: 'cat_pub',
    code: 'PUB-04',
    name_ar: 'المرافق العامة والتعليمية والصحية',
    name_ku: 'Saziyên Giştî û Tenduristî',
    color: '#10B981',
    description: 'المدارس، المراكز الطبية، المستوصفات، والمباني الخدمية',
    targetSharePct: 10,
    isDefault: true,
    createdAt: '2026-01-01'
  },
  {
    id: 'cat_agr',
    code: 'AGR-05',
    name_ar: 'المنشآت الزراعية والري',
    name_ku: 'Çandinî, Avdanî û Xwedîkirin',
    color: '#84CC16',
    description: 'المداجن، المباقر، الصوامع، شبكات الري والمزارع النموذجية',
    targetSharePct: 5,
    isDefault: true,
    createdAt: '2026-01-01'
  },
  {
    id: 'cat_infra',
    code: 'INF-06',
    name_ar: 'مشاريع البنية التحتية والمياه',
    name_ku: 'Binesazî, Rê û Av',
    color: '#8B5CF6',
    description: 'شبكات الصرف، الطرقات، الجسور، الآبار وخزانات المياه العالية',
    targetSharePct: 5,
    isDefault: true,
    createdAt: '2026-01-01'
  },
  {
    id: 'cat_ren',
    code: 'REN-07',
    name_ar: 'الترميم والسلامة الإنشائية',
    name_ku: 'Nûjenkirin û Ewlehî',
    color: '#EC4899',
    description: 'تدعيم الأعمدة، فحص المطرقة، ترميم الشقوق وإعادة التأهيل الإنشائي',
    targetSharePct: 3,
    isDefault: true,
    createdAt: '2026-01-01'
  }
];

export const getStoredCategories = (): ProjectCategory[] => {
  try {
    const stored = localStorage.getItem('syn_project_categories_v1');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load stored categories', e);
  }
  return DEFAULT_PROJECT_CATEGORIES;
};

export const saveStoredCategories = (categories: ProjectCategory[]): void => {
  try {
    localStorage.setItem('syn_project_categories_v1', JSON.stringify(categories));
  } catch (e) {
    console.error('Failed to save categories', e);
  }
};
