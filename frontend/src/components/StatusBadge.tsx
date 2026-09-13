import { Badge } from "./ui/badge";

export function StatusBadge({ status }: { status: string | null }) {
  if (!status) return <Badge variant="outline">Unknown</Badge>;
  
  switch (status) {
    case 'Succeeded':
      return <Badge variant="success">Succeeded</Badge>;
    case 'Failed':
      return <Badge variant="destructive">Failed</Badge>;
    case 'Running':
      return <Badge className="bg-blue-500 hover:bg-blue-600 animate-pulse text-white">Running</Badge>;
    case 'Pending':
      return <Badge variant="secondary">Pending</Badge>;
    case 'TimedOut':
      return <Badge variant="warning">Timed Out</Badge>;
    case 'Cancelled':
      return <Badge variant="outline" className="text-muted-foreground">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
