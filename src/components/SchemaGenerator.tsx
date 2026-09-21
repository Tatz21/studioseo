import React, { useState } from 'react';
import { Code2, Copy, Check, Sparkles } from 'lucide-react';

export const SchemaGenerator: React.FC = () => {
  const [schemaType, setSchemaType] = useState<'LocalBusiness' | 'Organization' | 'Article' | 'Product' | 'FAQPage'>('LocalBusiness');
  const [copied, setCopied] = useState(false);

  // Form states for LocalBusiness
  const [bizName, setBizName] = useState('The Timeliners Kolkata');
  const [bizType, setBizType] = useState('ProfessionalService');
  const [bizUrl, setBizUrl] = useState('https://timelinerskolkata.com');
  const [bizPhone, setBizPhone] = useState('+91 98300 12345');
  const [bizCity, setBizCity] = useState('Kolkata');
  const [bizStreet, setBizStreet] = useState('Park Street');
  const [bizPrice, setBizPrice] = useState('$$$');

  // Form states for Article
  const [artHeadline, setArtHeadline] = useState('Complete Guide to Candid Wedding Photography in Kolkata');
  const [artAuthor, setArtAuthor] = useState('Timeliners Kolkata');
  const [artDate, setArtDate] = useState('2026-09-21');
  const [artImage, setArtImage] = useState('https://timelinerskolkata.com/banner.jpg');

  // Form states for FAQ
  const [faqQ1, setFaqQ1] = useState('What are your wedding photography packages in Kolkata?');
  const [faqA1, setFaqA1] = useState('We offer bespoke candid photography, pre-wedding cinematography, and heirloom albums tailored to your celebration.');
  const [faqQ2, setFaqQ2] = useState('Do you travel for destination weddings?');
  const [faqA2, setFaqA2] = useState('Yes, our creative team covers royal weddings across India and international destinations.');

  // Generate JSON-LD output
  let generatedJson = '';
  if (schemaType === 'LocalBusiness') {
    generatedJson = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': bizType,
      'name': bizName,
      'url': bizUrl,
      'telephone': bizPhone,
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': bizStreet,
        'addressLocality': bizCity,
        'addressCountry': 'IN'
      },
      'priceRange': bizPrice
    }, null, 2);
  } else if (schemaType === 'Organization') {
    generatedJson = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': bizName,
      'url': bizUrl,
      'logo': `${bizUrl}/logo.png`,
      'contactPoint': {
        '@type': 'ContactPoint',
        'telephone': bizPhone,
        'contactType': 'customer support'
      }
    }, null, 2);
  } else if (schemaType === 'Article') {
    generatedJson = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': artHeadline,
      'image': [artImage],
      'datePublished': artDate,
      'author': [{
        '@type': 'Person',
        'name': artAuthor
      }]
    }, null, 2);
  } else if (schemaType === 'Product') {
    generatedJson = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      'name': 'Bespoke Cinematography Package',
      'image': 'https://timelinerskolkata.com/cover.jpg',
      'description': '4K Cinematic wedding film coverage with drone capture and color-graded highlights.',
      'offers': {
        '@type': 'Offer',
        'priceCurrency': 'INR',
        'price': '85000',
        'availability': 'https://schema.org/InStock'
      }
    }, null, 2);
  } else if (schemaType === 'FAQPage') {
    generatedJson = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': faqQ1,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': faqA1
          }
        },
        {
          '@type': 'Question',
          'name': faqQ2,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': faqA2
          }
        }
      ]
    }, null, 2);
  }

  const handleCopy = () => {
    const fullSnippet = `<script type="application/ld+json">\n${generatedJson}\n</script>`;
    navigator.clipboard.writeText(fullSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 440px) 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
      {/* Configuration Form */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <Sparkles size={20} color="var(--accent-primary)" />
          <h3 style={{ fontSize: '1.15rem' }}>Schema.org Generator</h3>
        </div>

        {/* Schema Type Selector */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.4rem' }}>
            Structured Data Type
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {(['LocalBusiness', 'Organization', 'Article', 'Product', 'FAQPage'] as const).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setSchemaType(type)}
                className={`btn ${schemaType === type ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Inputs based on type */}
        {schemaType === 'LocalBusiness' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Business Name</label>
              <input type="text" value={bizName} onChange={e => setBizName(e.target.value)} className="input-text" />
            </div>
            <div className="grid-2">
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Business Type</label>
                <input type="text" value={bizType} onChange={e => setBizType(e.target.value)} className="input-text" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Price Range</label>
                <input type="text" value={bizPrice} onChange={e => setBizPrice(e.target.value)} className="input-text" />
              </div>
            </div>
            <div className="grid-2">
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Street Address</label>
                <input type="text" value={bizStreet} onChange={e => setBizStreet(e.target.value)} className="input-text" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>City / Location</label>
                <input type="text" value={bizCity} onChange={e => setBizCity(e.target.value)} className="input-text" />
              </div>
            </div>
            <div className="grid-2">
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Phone</label>
                <input type="text" value={bizPhone} onChange={e => setBizPhone(e.target.value)} className="input-text" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Website URL</label>
                <input type="text" value={bizUrl} onChange={e => setBizUrl(e.target.value)} className="input-text font-mono" />
              </div>
            </div>
          </div>
        )}

        {schemaType === 'Article' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Headline</label>
              <input type="text" value={artHeadline} onChange={e => setArtHeadline(e.target.value)} className="input-text" />
            </div>
            <div className="grid-2">
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Author</label>
                <input type="text" value={artAuthor} onChange={e => setArtAuthor(e.target.value)} className="input-text" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Publish Date</label>
                <input type="date" value={artDate} onChange={e => setArtDate(e.target.value)} className="input-text" />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Cover Image URL</label>
              <input type="text" value={artImage} onChange={e => setArtImage(e.target.value)} className="input-text font-mono" />
            </div>
          </div>
        )}

        {schemaType === 'FAQPage' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Question 1</label>
              <input type="text" value={faqQ1} onChange={e => setFaqQ1(e.target.value)} className="input-text" />
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0.25rem' }}>Answer 1</label>
              <textarea value={faqA1} onChange={e => setFaqA1(e.target.value)} className="textarea" rows={2} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Question 2</label>
              <input type="text" value={faqQ2} onChange={e => setFaqQ2(e.target.value)} className="input-text" />
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0.25rem' }}>Answer 2</label>
              <textarea value={faqA2} onChange={e => setFaqA2(e.target.value)} className="textarea" rows={2} />
            </div>
          </div>
        )}
      </div>

      {/* JSON-LD Preview & Code Box */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-cyan)' }}>
            <Code2 size={18} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Generated JSON-LD Script Tag</span>
          </div>

          <button onClick={handleCopy} className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Code'}</span>
          </button>
        </div>

        <pre style={{
          flex: 1,
          background: 'var(--bg-canvas)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '1.25rem',
          color: 'var(--accent-primary)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8125rem',
          lineHeight: 1.5,
          overflowX: 'auto'
        }}>
          {`<script type="application/ld+json">\n${generatedJson}\n</script>`}
        </pre>
      </div>
    </div>
  );
};
