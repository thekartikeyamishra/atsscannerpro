export default function JsonLd({ data }: { data: object }) {
  // JSON.stringify output is safe in a script tag once "<" is escaped.
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
