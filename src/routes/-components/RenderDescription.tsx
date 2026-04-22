import DOMPurify from "isomorphic-dompurify";

export default function RenderDescription(props: { text: string }) {
  const isoText = DOMPurify.sanitize(props.text);
  return <div dangerouslySetInnerHTML={{ __html: isoText }}></div>;
}
