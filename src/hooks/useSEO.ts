import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  productSchema?: any;
  organizationSchema?: any;
  breadcrumbSchema?: any;
}

export function useSEO({
  title = 'NEXRA 3D | Industrial 3D Printers, Filaments & On-Demand Printing Services',
  description = 'India’s premier provider of industrial 3D printers, additive manufacturing materials, engineering filaments, SLA resins, and custom CAD on-demand 3D printing services.',
  keywords = '3D printing India, Bambu Lab X1C, SLA Resin 3D Printers, Additive Manufacturing, Rapid Prototyping, CAD Quote, NEXRA 3D',
  image = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=1200',
  url,
  productSchema,
  organizationSchema,
  breadcrumbSchema
}: SEOProps) {
  useEffect(() => {
    // 1. Set Title
    document.title = title.includes('NEXRA 3D') ? title : `${title} | NEXRA 3D`;

    // Helper to update meta tag
    const updateMeta = (selector: string, attribute: string, value: string) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        const [attrName, attrVal] = selector.replace('meta[', '').replace(']', '').split('=');
        element.setAttribute(attrName, attrVal.replace(/"/g, ''));
        document.head.appendChild(element);
      }
      element.setAttribute(attribute, value);
    };

    // 2. Standard Meta
    updateMeta('meta[name="description"]', 'content', description);
    updateMeta('meta[name="keywords"]', 'content', keywords);

    // 3. OpenGraph Meta
    updateMeta('meta[property="og:title"]', 'content', title);
    updateMeta('meta[property="og:description"]', 'content', description);
    updateMeta('meta[property="og:image"]', 'content', image);
    updateMeta('meta[property="og:type"]', 'content', 'website');
    if (url) updateMeta('meta[property="og:url"]', 'content', url);

    // 4. Twitter Card
    updateMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
    updateMeta('meta[name="twitter:title"]', 'content', title);
    updateMeta('meta[name="twitter:description"]', 'content', description);
    updateMeta('meta[name="twitter:image"]', 'content', image);

    // 5. Canonical Link
    const currentUrl = url || window.location.href;
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', currentUrl);

    // 6. JSON-LD Schemas
    const defaultOrgSchema = organizationSchema || {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'NEXRA 3D',
      legalName: 'NEXRA 3D Technologies',
      url: window.location.origin,
      logo: `${window.location.origin}/logo.png`,
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+91-8886149998',
        contactType: 'customer support',
        areaServed: 'IN',
        availableLanguage: ['en', 'hi']
      }
    };

    const schemasToInject = [defaultOrgSchema];
    if (productSchema) schemasToInject.push(productSchema);
    if (breadcrumbSchema) schemasToInject.push(breadcrumbSchema);

    let script = document.getElementById('nexra-jsonld-schema') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = 'nexra-jsonld-schema';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schemasToInject);
  }, [title, description, keywords, image, url, productSchema, organizationSchema, breadcrumbSchema]);
}
