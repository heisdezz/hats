export default function RouteHeader(props: {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  const { title = "Dashboard", subtitle = "" } = props;
  return (
    <div className="flex">
      <div className="space-y-2 flex-1">
        <h2 className="text-3xl font-bold ">{title}</h2>
        <p className="text-current/50">{subtitle}</p>
      </div>
      <div className="">{props.children}</div>
    </div>
  );
}
