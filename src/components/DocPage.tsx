import Breadcrumbs from './Breadcrumbs';

export default function DocPage({
  title,
  path,
  lede,
  updated,
  children,
}: {
  title: string;
  path: string;
  lede?: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="wrap-narrow py-12">
      <Breadcrumbs items={[{ name: title, path }]} />
      <h1 className="mt-6 text-[clamp(2rem,4.6vw,3rem)] font-extrabold leading-[1.08] tracking-[-0.03em]">{title}</h1>
      {lede && <p className="lede mt-4">{lede}</p>}
      {updated && (
        <p className="small muted mt-4">
          Last updated <time dateTime={updated}>{new Date(updated + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}</time>
        </p>
      )}
      <div className="prose-guide mt-10 font-sans text-[1.05rem] [&_h2]:text-[1.45rem]">{children}</div>
    </div>
  );
}
