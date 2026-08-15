import { useEffect } from 'react';
import { getPropertyPublicURL } from '../lib/seoUtils';

export default function SEOHead({ title, description, property, canonicalUrl }) {
  useEffect(() => {
    const fullURL = canonicalUrl || (property ? getPropertyPublicURL(property) : window.location.href);

    // 1. Atualizar Título da Página
    if (title) {
      document.title = `${title} | ImobiFlow`;
    } else if (property?.title) {
      const loc = property.location ? ` em ${property.location}` : '';
      document.title = `${property.title}${loc} | ImobiFlow`;
    }

    // 2. Atualizar Meta Description
    const metaDesc = document.querySelector('meta[name="description"]');
    const descText = description || (property ? `Confira ${property.title} em ${property.location || 'excelente localização'}. Valor: ${property.price.startsWith('R$') ? property.price : `R$ ${property.price}`}. Especificações: ${property.specs}. CRECI credenciado.` : 'Plataforma de inteligência imobiliária com qualificação automatizada de leads.');
    if (metaDesc) {
      metaDesc.setAttribute('content', descText);
    }

    // 3. Atualizar Open Graph & Canonical Link
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title || property?.title || 'ImobiFlow');

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', descText);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', fullURL);

    if (property?.image) {
      const ogImg = document.querySelector('meta[property="og:image"]');
      if (ogImg) ogImg.setAttribute('content', property.image);
    }

    // Canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', fullURL);

    // 4. Injetar Dados Estruturados JSON-LD (Schema.org) para E-E-A-T & Google Rich Snippets
    let scriptTag = document.getElementById('json-ld-schema');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'json-ld-schema';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const schemaData = property ? {
      "@context": "https://schema.org",
      "@type": "RealEstateListing",
      "name": property.title,
      "description": descText,
      "url": fullURL,
      "datePosted": new Date().toISOString(),
      "offers": {
        "@type": "Offer",
        "price": property.price ? property.price.replace(/[^\d]/g, '') : "0",
        "priceCurrency": "BRL",
        "availability": "https://schema.org/InStock"
      },
      "author": {
        "@type": "RealEstateAgent",
        "name": property.brokerName || "Corretor Credenciado ImobiFlow",
        "identifier": property.brokerCreci || "CRECI Validado",
        "telephone": property.brokerWhatsapp || ""
      }
    } : {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "ImobiFlow",
      "url": "https://imobiflow.com.br",
      "logo": "https://imobiflow.com.br/imoveis/logoimovel.webp",
      "sameAs": [],
      "publisher": {
        "@type": "Organization",
        "name": "PEIXEWEB AGÊNCIA DIGITAL"
      }
    };

    scriptTag.textContent = JSON.stringify(schemaData);

  }, [title, description, property, canonicalUrl]);

  return null;
}
