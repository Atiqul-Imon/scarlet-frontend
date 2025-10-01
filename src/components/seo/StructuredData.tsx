'use client';

import { Product, Category, BlogPost } from '@/lib/types';
import { 
  generateOrganizationJsonLd, 
  generateProductJsonLd, 
  generateArticleJsonLd,
  generateBreadcrumbJsonLd,
  generateFaqJsonLd,
  generateLocalBusinessJsonLd 
} from '@/lib/seo';

interface StructuredDataProps {
  type: 'organization' | 'product' | 'article' | 'breadcrumb' | 'faq' | 'localBusiness';
  data?: Product | Category | BlogPost | Array<{ name: string; url: string }> | Array<{ question: string; answer: string }>;
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const getJsonLd = () => {
    switch (type) {
      case 'organization':
        return generateOrganizationJsonLd();
      case 'product':
        return generateProductJsonLd(data as Product);
      case 'article':
        return generateArticleJsonLd(data as BlogPost);
      case 'breadcrumb':
        return generateBreadcrumbJsonLd(data as Array<{ name: string; url: string }>);
      case 'faq':
        return generateFaqJsonLd(data as Array<{ question: string; answer: string }>);
      case 'localBusiness':
        return generateLocalBusinessJsonLd();
      default:
        return null;
    }
  };

  const jsonLd = getJsonLd();
  if (!jsonLd) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={jsonLd}
    />
  );
}
