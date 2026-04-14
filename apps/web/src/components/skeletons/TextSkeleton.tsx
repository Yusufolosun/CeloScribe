interface TextSkeletonProps {
  lines?: number;
}

export function TextSkeleton({ lines = 4 }: TextSkeletonProps) {
  const widths = ['100%', '92%', '78%', '64%', '88%', '70%'];

  return (
    <div className="text-skeleton" aria-hidden="true">
      {Array.from({ length: lines }, (_, index) => (
        <span
          key={index}
          className="text-skeleton__line"
          style={{ width: widths[index % widths.length] }}
        />
      ))}
    </div>
  );
}
