// src/components/SchemaMarkup.tsx
// Server component — injects JSON-LD structured data.
// SECURITY: '<' is escaped to \u003c so user-derived strings (FAQ answers,
// role titles) can never break out of the <script> tag (XSS via </script>).

interface SchemaMarkupProps {
  // Accepts a single schema object or an array of schema objects.
  // null/undefined entries are filtered out so callers can pass
  // conditional schemas (e.g. an FAQ schema that may be null).
  schemas: object | Array<object | null | undefined>;
}

function safeJsonLd(schema: object): string {
  return JSON.stringify(schema).replace(/</g, '\\u003c');
}

export default function SchemaMarkup({ schemas }: SchemaMarkupProps) {
  const schemaList = (Array.isArray(schemas) ? schemas : [schemas]).filter(
    (s): s is object => s != null
  );

  if (schemaList.length === 0) return null;

  return (
    <>
      {schemaList.map((schema, index) => (
        <script
          key={`schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
        />
      ))}
    </>
  );
}