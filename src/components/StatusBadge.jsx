import { STATUSES } from '../constants';

export default function StatusBadge({ status }) {
  const label = STATUSES.find((item) => item.value === status)?.label ?? status;
  return <span className={`badge badge--${status}`}>{label}</span>;
}
