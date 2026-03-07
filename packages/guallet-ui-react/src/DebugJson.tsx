export function DebugJson({ data }: Readonly<{ data: unknown }>) {
  return (
    <pre
      style={{
        background: 'rgba(15, 23, 42, 0.06)',
        borderRadius: '0.5rem',
        fontSize: '0.8rem',
        overflowX: 'auto',
        padding: '0.75rem',
      }}
    >
      <code>{JSON.stringify(data, null, 2)}</code>
    </pre>
  );
}
