import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/final')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/final"!</div>
}
