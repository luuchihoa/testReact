/**
 * Formats an ISO date string into Vietnamese locale ("dd/mm/yyyy, hh:mm").
 * Extracted from ArticlesTab so it's independently testable and reusable
 * across other admin views (e.g. a future CommentsTab / UsersTab).
 *
 * @param {string | null | undefined} dateStr
 * @returns {string}
 */
export function formatDateVi(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Keeps a list of articles sorted the same way the server query does
 * (oldest submission first). Used when re-inserting an article that was
 * optimistically removed but whose server mutation then failed.
 *
 * @param {Array<{submitted_at: string}>} list
 */
export function sortBySubmittedAt(list) {
  return [...list].sort((a, b) => new Date(a.submitted_at) - new Date(b.submitted_at));
}