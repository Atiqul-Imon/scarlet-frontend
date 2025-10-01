'use client';

import Head from 'next/head';
import { generateMetadata, seoConfig } from '@/lib/seo';

interface PageSeoProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  noIndex?: boolean;
  noFollow?: boolean;
  canonical?: string;
  structuredData?: any;
  breadcrumbs?: Array<{ name: string; url: string }>;
  faqs?: Array<{ question: string; answer: string }>;
}

export default function PageSeo({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  authors,
  noIndex = false,
  noFollow = false,
  canonical,
  structuredData,
  breadcrumbs,
  faqs,
}: PageSeoProps) {
  const metadata = generateMetadata({
    title,
    description,
    keywords,
    image,
    url,
    type,
    publishedTime,
    modifiedTime,
    authors,
    noIndex,
    noFollow,
  });

  const canonicalUrl = canonical || `${seoConfig.siteUrl}${url || ''}`;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <meta name="keywords" content={metadata.keywords} />
      <meta name="author" content={metadata.creator} />
      <meta name="robots" content={`${noIndex ? 'noindex' : 'index'}, ${noFollow ? 'nofollow' : 'follow'}`} />
      <meta name="googlebot" content={`${noIndex ? 'noindex' : 'index'}, ${noFollow ? 'nofollow' : 'follow'}`} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={metadata.openGraph?.type} />
      <meta property="og:title" content={metadata.openGraph?.title} />
      <meta property="og:description" content={metadata.openGraph?.description} />
      <meta property="og:url" content={metadata.openGraph?.url} />
      <meta property="og:site_name" content={metadata.openGraph?.siteName} />
      <meta property="og:image" content={metadata.openGraph?.images?.[0]?.url} />
      <meta property="og:image:width" content={metadata.openGraph?.images?.[0]?.width?.toString()} />
      <meta property="og:image:height" content={metadata.openGraph?.images?.[0]?.height?.toString()} />
      <meta property="og:image:alt" content={metadata.openGraph?.images?.[0]?.alt} />
      <meta property="og:locale" content={metadata.openGraph?.locale} />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {authors?.map((author, index) => (
        <meta key={index} property="article:author" content={author} />
      ))}
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={metadata.twitter?.card} />
      <meta name="twitter:site" content={metadata.twitter?.site} />
      <meta name="twitter:creator" content={metadata.twitter?.creator} />
      <meta name="twitter:title" content={metadata.twitter?.title} />
      <meta name="twitter:description" content={metadata.twitter?.description} />
      <meta name="twitter:image" content={metadata.twitter?.images?.[0]} />
      <meta name="twitter:image:alt" content={metadata.openGraph?.images?.[0]?.alt} />
      
      {/* Additional Meta Tags */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="theme-color" content="#dc2626" />
      <meta name="msapplication-TileColor" content="#dc2626" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={seoConfig.siteName} />
      
      {/* Verification Tags */}
      {seoConfig.googleSiteVerification && (
        <meta name="google-site-verification" content={seoConfig.googleSiteVerification} />
      )}
      {seoConfig.bingSiteVerification && (
        <meta name="msvalidate.01" content={seoConfig.bingSiteVerification} />
      )}
      {seoConfig.yandexVerification && (
        <meta name="yandex-verification" content={seoConfig.yandexVerification} />
      )}
      
      {/* Facebook App ID */}
      {seoConfig.facebookAppId && (
        <meta property="fb:app_id" content={seoConfig.facebookAppId} />
      )}
      
      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData, null, 2),
          }}
        />
      )}
      
      {/* Breadcrumb Structured Data */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: breadcrumbs.map((item, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: item.name,
                item: `${seoConfig.siteUrl}${item.url}`,
              })),
            }, null, 2),
          }}
        />
      )}
      
      {/* FAQ Structured Data */}
      {faqs && faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faqs.map(faq => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: faq.answer,
                },
              })),
            }, null, 2),
          }}
        />
      )}
    </Head>
  );
}
