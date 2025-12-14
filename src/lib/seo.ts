import { Metadata } from 'next';
import { Product, Category, BlogPost } from './types';

// Base SEO configuration
export const seoConfig = {
  siteName: 'Scarlet',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://scarletunlimited.net',
  defaultTitle: 'Scarlet - Premium Beauty & Skincare Store',
  defaultDescription: 'Discover the finest collection of beauty and skincare products at Scarlet. From K-beauty essentials to premium international brands.',
  defaultKeywords: 'beauty, skincare, makeup, cosmetics, K-beauty, premium beauty, Bangladesh, Dhaka, online beauty store',
  twitterHandle: '@ScarletBeauty',
  facebookAppId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
  googleSiteVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  bingSiteVerification: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION,
  yandexVerification: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
};

// Generate page metadata
export function generateMetadata({
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
}: {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  noIndex?: boolean;
  noFollow?: boolean;
}): Metadata {
  const fullTitle = title ? `${title} | ${seoConfig.siteName}` : seoConfig.defaultTitle;
  const fullDescription = description || seoConfig.defaultDescription;
  const fullKeywords = keywords ? [...seoConfig.defaultKeywords.split(', '), ...keywords].join(', ') : seoConfig.defaultKeywords;
  const fullImage = image || `${seoConfig.siteUrl}/images/og-default.jpg`;
  const fullUrl = url ? `${seoConfig.siteUrl}${url}` : seoConfig.siteUrl;

  return {
    title: fullTitle,
    description: fullDescription,
    keywords: fullKeywords,
    authors: authors ? authors.map(name => ({ name })) : undefined,
    creator: seoConfig.siteName,
    publisher: seoConfig.siteName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(seoConfig.siteUrl),
    alternates: {
      canonical: fullUrl,
    },
    robots: {
      index: !noIndex,
      follow: !noFollow,
      googleBot: {
        index: !noIndex,
        follow: !noFollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type,
      title: fullTitle,
      description: fullDescription,
      url: fullUrl,
      siteName: seoConfig.siteName,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      locale: 'en_US',
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(authors && { authors }),
    },
    twitter: {
      card: 'summary_large_image',
      site: seoConfig.twitterHandle,
      creator: seoConfig.twitterHandle,
      title: fullTitle,
      description: fullDescription,
      images: [fullImage],
    },
    verification: {
      google: seoConfig.googleSiteVerification,
      yandex: seoConfig.yandexVerification,
      yahoo: seoConfig.bingSiteVerification,
    },
    other: {
      'fb:app_id': seoConfig.facebookAppId,
    },
  };
}

// Generate product metadata
export function generateProductMetadata(product: Product): Metadata {
  const keywords = [
    product.title,
    product.brand || '',
    product.category?.name || '',
    ...(product.tags || []),
    'beauty',
    'skincare',
    'makeup',
    'cosmetics',
  ].filter(Boolean);

  // Use 'website' as Open Graph type (valid types: 'website', 'article', 'book', 'profile')
  // 'product' is not a valid OG type, but 'website' works perfectly for product pages
  // Product-specific data is handled via JSON-LD structured data in the component
  return generateMetadata({
    title: product.title,
    description: product.description || `Buy ${product.title} from ${product.brand || 'Scarlet'}. ${product.price.currency} ${product.price.amount}.`,
    keywords,
    image: product.images?.[0] || `${seoConfig.siteUrl}/images/products/${product.slug}.jpg`,
    url: `/products/${product.slug}`,
    type: 'website', // Valid OG type - Facebook will still show product correctly with proper image/title/description
  });
}

// Generate category metadata
export function generateCategoryMetadata(category: Category): Metadata {
  const keywords = [
    category.name,
    category.description || '',
    'beauty',
    'skincare',
    'makeup',
    'cosmetics',
  ].filter(Boolean);

  return generateMetadata({
    title: category.name,
    description: category.description || `Shop ${category.name} products at Scarlet. Premium beauty and skincare products.`,
    keywords,
    url: `/products?category=${category.slug}`,
  });
}

// Generate blog post metadata
export function generateBlogMetadata(post: BlogPost): Metadata {
  const keywords = [
    post.title,
    ...(post.tags || []),
    'beauty tips',
    'skincare advice',
    'makeup tutorial',
    'beauty blog',
  ].filter(Boolean);

  return generateMetadata({
    title: post.title,
    description: post.excerpt || post.content?.substring(0, 160) || '',
    keywords,
    image: post.featuredImage || `${seoConfig.siteUrl}/images/blog/${post.slug}.jpg`,
    url: `/blog/${post.slug}`,
    type: 'article',
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    authors: post.author ? [post.author.name] : undefined,
  });
}

// Generate JSON-LD structured data
export function generateJsonLd(data: {
  type: 'organization' | 'product' | 'article' | 'breadcrumb' | 'faq' | 'localBusiness';
  data: any;
}) {
  const baseStructuredData = {
    '@context': 'https://schema.org',
    '@type': data.type,
    ...data.data,
  };

  return {
    __html: JSON.stringify(baseStructuredData, null, 2),
  };
}

// Organization structured data
export function generateOrganizationJsonLd() {
  return generateJsonLd({
    type: 'organization',
    data: {
      name: seoConfig.siteName,
      url: seoConfig.siteUrl,
      logo: 'https://res.cloudinary.com/db5yniogx/image/upload/v1760152223/scarletlogopng001_tebeai_10b44a.png',
      description: seoConfig.defaultDescription,
      address: {
        '@type': 'PostalAddress',
        streetAddress: '123 Beauty Street',
        addressLocality: 'Dhaka',
        addressRegion: 'Dhaka',
        postalCode: '1000',
        addressCountry: 'BD',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+880-1234-567890',
        contactType: 'customer service',
        availableLanguage: ['English', 'Bengali'],
      },
      sameAs: [
        'https://www.facebook.com/scarletbeauty',
        'https://www.instagram.com/scarletbeauty',
        'https://www.twitter.com/scarletbeauty',
      ],
    },
  });
}

// Product structured data
export function generateProductJsonLd(product: Product) {
  return generateJsonLd({
    type: 'product',
    data: {
      name: product.title,
      description: product.description,
      image: product.images,
      brand: {
        '@type': 'Brand',
        name: product.brand || 'Scarlet',
      },
      offers: {
        '@type': 'Offer',
        price: product.price.amount,
        priceCurrency: product.price.currency,
        availability: product.stock && product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: seoConfig.siteName,
        },
        url: `${seoConfig.siteUrl}/products/${product.slug}`,
      },
      category: product.category?.name,
      sku: product.sku,
      gtin: product.gtin,
      mpn: product.mpn,
    },
  });
}

// Article structured data
export function generateArticleJsonLd(post: BlogPost) {
  return generateJsonLd({
    type: 'article',
    data: {
      headline: post.title,
      description: post.excerpt || post.content?.substring(0, 160),
      image: post.featuredImage,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      author: {
        '@type': 'Person',
        name: post.author?.name || 'Scarlet Team',
        url: post.author?.url || seoConfig.siteUrl,
      },
      publisher: {
        '@type': 'Organization',
        name: seoConfig.siteName,
        logo: {
          '@type': 'ImageObject',
          url: 'https://res.cloudinary.com/db5yniogx/image/upload/v1760152223/scarletlogopng001_tebeai_10b44a.png',
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${seoConfig.siteUrl}/blog/${post.slug}`,
      },
    },
  });
}

// Breadcrumb structured data
export function generateBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return generateJsonLd({
    type: 'breadcrumb',
    data: {
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: `${seoConfig.siteUrl}${item.url}`,
      })),
    },
  });
}

// FAQ structured data
export function generateFaqJsonLd(faqs: Array<{ question: string; answer: string }>) {
  return generateJsonLd({
    type: 'faq',
    data: {
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    },
  });
}

// Local business structured data
export function generateLocalBusinessJsonLd() {
  return generateJsonLd({
    type: 'localBusiness',
    data: {
      name: seoConfig.siteName,
      description: seoConfig.defaultDescription,
      url: seoConfig.siteUrl,
      telephone: '+880-1234-567890',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '123 Beauty Street',
        addressLocality: 'Dhaka',
        addressRegion: 'Dhaka',
        postalCode: '1000',
        addressCountry: 'BD',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 23.8103,
        longitude: 90.4125,
      },
      openingHours: 'Mo-Sa 09:00-21:00',
      priceRange: '$$',
      paymentAccepted: 'Cash, Credit Card, bKash, Nagad, Rocket',
      currenciesAccepted: 'BDT',
    },
  });
}

// Generate sitemap data
export async function generateSitemapData() {
  const baseUrl = seoConfig.siteUrl;
  const currentDate = new Date().toISOString();

  // Static pages
  const staticPages = [
    { url: '', priority: 1.0, changefreq: 'daily' },
    { url: '/products', priority: 0.9, changefreq: 'daily' },
    { url: '/skincare', priority: 0.8, changefreq: 'weekly' },
    { url: '/makeup', priority: 0.8, changefreq: 'weekly' },
    { url: '/bath-body', priority: 0.8, changefreq: 'weekly' },
    { url: '/blog', priority: 0.7, changefreq: 'daily' },
    { url: '/about', priority: 0.6, changefreq: 'monthly' },
    { url: '/contact', priority: 0.6, changefreq: 'monthly' },
    { url: '/help', priority: 0.5, changefreq: 'monthly' },
    { url: '/privacy', priority: 0.3, changefreq: 'yearly' },
    { url: '/terms', priority: 0.3, changefreq: 'yearly' },
  ];

  // Dynamic pages (you would fetch these from your API)
  const dynamicPages = [
    // Products would be fetched from API
    // Categories would be fetched from API
    // Blog posts would be fetched from API
  ];

  return [
    ...staticPages.map(page => ({
      url: `${baseUrl}${page.url}`,
      lastModified: currentDate,
      changeFrequency: page.changefreq as 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never',
      priority: page.priority,
    })),
    ...dynamicPages,
  ];
}

// SEO utility functions
export const seoUtils = {
  // Generate meta description from content
  generateDescription: (content: string, maxLength: number = 160): string => {
    const cleanContent = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    return cleanContent.length > maxLength 
      ? cleanContent.substring(0, maxLength - 3) + '...'
      : cleanContent;
  },

  // Generate keywords from content
  generateKeywords: (content: string, additionalKeywords: string[] = []): string[] => {
    const words = content
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['this', 'that', 'with', 'from', 'they', 'been', 'have', 'will', 'your', 'said', 'each', 'which', 'their', 'time', 'would', 'there', 'could', 'other', 'after', 'first', 'well', 'also', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us'].includes(word));
    
    const wordCount = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sortedWords = Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);

    return [...new Set([...sortedWords, ...additionalKeywords])];
  },

  // Generate canonical URL
  generateCanonicalUrl: (path: string): string => {
    return `${seoConfig.siteUrl}${path}`;
  },

  // Generate Open Graph image URL
  generateOgImageUrl: (title: string, description?: string): string => {
    const params = new URLSearchParams({
      title: title.substring(0, 60),
      description: description?.substring(0, 120) || '',
      site: seoConfig.siteName,
    });
    return `${seoConfig.siteUrl}/api/og?${params.toString()}`;
  },
};
