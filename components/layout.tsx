export function Container({
  children,
  className = '',
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function Grid({
  children,
  cols = 3,
  className = '',
}: {
  children: React.ReactNode;
  cols?: number;
  className?: string;
}) {
  const colsClass = {
    1: 'grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  }[cols];

  return (
    <div className={`grid ${colsClass} gap-4 ${className}`}>{children}</div>
  );
}

export function Stack({
  children,
  direction = 'col',
  gap = 4,
  className = '',
}: {
  children: React.ReactNode;
  direction?: 'row' | 'col';
  gap?: number;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-${direction} gap-${gap} ${className}`}
    >
      {children}
    </div>
  );
}
