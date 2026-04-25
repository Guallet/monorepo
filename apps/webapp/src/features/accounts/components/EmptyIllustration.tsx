export function EmptyIllustration() {
  return (
    <svg
      width="200"
      height="120"
      viewBox="0 0 200 120"
      fill="none"
      style={{ display: 'block', margin: '0 auto' }}
    >
      <rect
        x="30"
        y="20"
        width="140"
        height="60"
        rx="10"
        fill="white"
        stroke="var(--mantine-color-gray-3)"
        strokeWidth="1.5"
        transform="rotate(-6 100 50)"
      />
      <rect
        x="30"
        y="30"
        width="140"
        height="60"
        rx="10"
        fill="var(--mantine-color-blue-0)"
        stroke="var(--mantine-color-blue-2)"
        strokeWidth="1.5"
      />
      <g>
        <rect x="30" y="40" width="140" height="64" rx="12" fill="var(--mantine-color-blue-6)" />
        <circle cx="48" cy="58" r="8" fill="white" opacity="0.9" />
        <path
          d="M44 58 L52 58 M44 60 L52 60"
          stroke="var(--mantine-color-blue-6)"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <rect x="64" y="54" width="60" height="6" rx="3" fill="white" opacity="0.4" />
        <rect x="64" y="66" width="40" height="6" rx="3" fill="white" opacity="0.25" />
        <rect x="40" y="84" width="80" height="6" rx="3" fill="white" opacity="0.15" />
        <rect x="128" y="84" width="20" height="6" rx="3" fill="var(--mantine-color-teal-4)" opacity="0.9" />
      </g>
    </svg>
  );
}
