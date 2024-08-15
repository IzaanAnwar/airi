import Link from 'next/link';
import moment from 'moment';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

export default function CoversationCard(props: {
  title: string;
  id: string;
  label?: string;
  updatedAt: number;
}) {
  return (
    <Link href={`/dashboard/${props.id}`} className="group" prefetch={false}>
      <Card className="h-full w-full overflow-hidden transition-all duration-300  hover:shadow-lg hover:border-primary border-2  animate-fade-down">
        <CardHeader className="bg-muted/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <Badge>{props.label ?? 'Not labeled'}</Badge>
            <div className="text-sm text-muted-foreground">
              {moment(props.updatedAt * 1000).fromNow()}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 py-4">
          <p>{props.title}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
