interface Props {
  title: string;
  rightContent: string | null;
}

export default function GroupHeader({ title, rightContent }: Readonly<Props>) {
  return (
    <div className="flex items-center justify-between px-4">
      <p className="font-bold">{title}</p>
      <p className="font-bold">{rightContent}</p>
    </div>
  );
}
