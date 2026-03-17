interface StudyHeaderProps {
  title: string;
  progressText: string;
}

export default function StudyHeader({ title, progressText }: StudyHeaderProps) {
  return (
    <div className="study-header">
      <h1>{title}</h1>
      <div className="progress">{progressText}</div>
    </div>
  );
}
