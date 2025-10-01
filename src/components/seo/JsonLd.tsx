'use client';

import { generateJsonLd } from '@/lib/seo';

interface JsonLdProps {
  type: 'organization' | 'product' | 'article' | 'breadcrumb' | 'faq' | 'localBusiness';
  data: any;
}

export default function JsonLd({ type, data }: JsonLdProps) {
  const jsonLd = generateJsonLd({ type, data });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={jsonLd}
    />
  );
}
