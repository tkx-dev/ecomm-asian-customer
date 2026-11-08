/** Formats an ISO 8601 date from the API for display, such as "Nov 5, 2026". */
export function formatDate(
  iso: string,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
) {
  return new Intl.DateTimeFormat('en-US', options).format(new Date(iso))
}
