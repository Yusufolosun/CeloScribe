export function ImageSkeleton() {
  return (
    <div className="image-skeleton" aria-hidden="true">
      <span className="image-skeleton__shimmer" />
      <span className="image-skeleton__spinner" />
    </div>
  );
}
