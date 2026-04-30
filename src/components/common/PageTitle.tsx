interface PageTitleProps {
  children: React.ReactNode;
}

export default function PageTitle({ children }: PageTitleProps) {
  return <h1 className="page-title">{children}</h1>;
}
