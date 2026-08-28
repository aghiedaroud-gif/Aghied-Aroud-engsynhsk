import { BranchCode, BranchInfo } from '../types';

export const BRANCH_CONFIG: Record<BranchCode, BranchInfo> = {
  HAS: {
    code: 'HAS',
    name_ar: 'وحدة الحسكة',
    city_ar: 'الحسكة',
    header_title: 'نقابة المهندسين في محافظة الحسكة - وحدة الحسكة',
    sub_kurdish: 'Sendîkaya Endezyaran li parêzgeha Hesekê | Yekîneya Hesekê',
    default_accountant: 'عمر العبدالله',
    address: 'الحسكة - شارع النقابة المركزي',
    phone: '+963 52 468 912'
  },
  QAM: {
    code: 'QAM',
    name_ar: 'وحدة القامشلي',
    city_ar: 'القامشلي',
    header_title: 'نقابة المهندسين في محافظة الحسكة - وحدة القامشلي',
    sub_kurdish: 'Sendîkaya Endezyaran li parêzgeha Hesekê | Yekîneya Qamişlo',
    default_accountant: 'جان خليل',
    address: 'القامشلي - حي السياحي، مقابل الحديقة العامة',
    phone: '+963 52 431 875'
  },
  DER: {
    code: 'DER',
    name_ar: 'وحدة المالكية / ديريك',
    city_ar: 'ديريك',
    header_title: 'نقابة المهندسين في محافظة الحسكة - وحدة المالكية / ديريك',
    sub_kurdish: 'Sendîkaya Endezyaran li parêzgeha Hesekê | Yekîneya Dêrikê',
    default_accountant: 'فادي الياس',
    address: 'ديريك - السوق المركزي، بناء النقابات',
    phone: '+963 52 752 104'
  }
};
