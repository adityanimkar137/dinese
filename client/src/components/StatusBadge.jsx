// Shows a coloured pill. The CSS class comes from the status text, e.g. "badge-confirmed".
function StatusBadge({ status }) {
  return <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>;
}

export default StatusBadge;
