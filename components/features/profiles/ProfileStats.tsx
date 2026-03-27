export function ProfileStats({
  viewCount = 0,
  followerCount = 0,
  commentCount = 0,
  ratingAvg = 0,
  ratingCount = 0,
}: {
  viewCount?: number;
  followerCount?: number;
  commentCount?: number;
  ratingAvg?: number;
  ratingCount?: number;
}) {
  return (
    <div className="flex flex-wrap gap-4 text-sm text-dark-400">
      {viewCount != null && <span>{viewCount.toLocaleString()} vues</span>}
      {followerCount != null && <span>{followerCount.toLocaleString()} abonnés</span>}
      {commentCount != null && commentCount > 0 && <span>{commentCount} avis</span>}
      {ratingAvg != null && ratingAvg > 0 && (
        <span>★ {ratingAvg.toFixed(1)}{ratingCount != null && ratingCount > 0 ? ` (${ratingCount})` : ""}</span>
      )}
    </div>
  );
}
