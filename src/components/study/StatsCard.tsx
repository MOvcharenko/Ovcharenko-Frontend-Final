interface StatsCardProps {
  label: string;
  value: number | string;
}

export default function StatsCard({ label, value }: StatsCardProps) {
  return (
    <div className="stat-card">
      <h3>{value}</h3>
      <p>{label}</p>
    </div>
  );
}
