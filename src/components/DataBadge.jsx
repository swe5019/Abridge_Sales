// Small badge that surfaces whether a record is verified-public or illustrative.
export default function DataBadge({ confidence }) {
  if (confidence === 'known-public') {
    return <span className="badge known" title="Based on public information">✓ Public</span>
  }
  return (
    <span className="badge illustrative" title="Sample data — replace with verified intel">
      ◐ Sample
    </span>
  )
}
