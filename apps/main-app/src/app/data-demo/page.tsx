'use client';

import * as React from 'react';
import { Button } from '@tbk/ui/primitives/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@tbk/ui/primitives/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@tbk/ui/primitives/table';
import { Avatar, AvatarFallback, AvatarImage } from '@tbk/ui/primitives/avatar';
import { Progress } from '@tbk/ui/primitives/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@tbk/ui/primitives/accordion';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@tbk/ui/primitives/collapsible';
import { ScrollArea } from '@tbk/ui/primitives/scroll-area';
import { AspectRatio } from '@tbk/ui/primitives/aspect-ratio';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@tbk/ui/primitives/hover-card';
import { Skeleton } from '@tbk/ui/primitives/skeleton';
import { Badge } from '@tbk/ui/primitives/badge';

// Sample data
const invoices = [
  { id: 'INV001', status: 'Paid', method: 'Credit Card', amount: '$250.00' },
  { id: 'INV002', status: 'Pending', method: 'PayPal', amount: '$150.00' },
  { id: 'INV003', status: 'Unpaid', method: 'Bank Transfer', amount: '$350.00' },
  { id: 'INV004', status: 'Paid', method: 'Credit Card', amount: '$450.00' },
  { id: 'INV005', status: 'Paid', method: 'PayPal', amount: '$550.00' },
];

const tags = Array.from({ length: 50 }).map((_, i, a) => `Tag ${a.length - i}`);

export default function DataDemoPage() {
  const [progress, setProgress] = React.useState(13);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-4xl font-bold">Data Display Components Demo</h1>
        <p className="mb-8 text-muted-foreground">
          Tier 5 UI components migrated from shadcn-ui to @tbk/ui
        </p>

        <div className="space-y-8">
          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle>Table</CardTitle>
              <CardDescription>Display tabular data</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>A list of your recent invoices.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Invoice</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            invoice.status === 'Paid'
                              ? 'default'
                              : invoice.status === 'Pending'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{invoice.method}</TableCell>
                      <TableCell className="text-right">{invoice.amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Avatar */}
            <Card>
              <CardHeader>
                <CardTitle>Avatar</CardTitle>
                <CardDescription>User profile images with fallback</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-4">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarImage src="https://github.com/vercel.png" alt="@vercel" />
                  <AvatarFallback>VC</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <Avatar className="h-16 w-16">
                  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </CardContent>
            </Card>

            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Progress</CardTitle>
                <CardDescription>Show completion status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Loading</span>
                    <span>25%</span>
                  </div>
                  <Progress value={25} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Complete</span>
                    <span>100%</span>
                  </div>
                  <Progress value={100} />
                </div>
              </CardContent>
            </Card>

            {/* Accordion */}
            <Card>
              <CardHeader>
                <CardTitle>Accordion</CardTitle>
                <CardDescription>Expandable content sections</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Is it accessible?</AccordionTrigger>
                    <AccordionContent>
                      Yes. It adheres to the WAI-ARIA design pattern.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Is it styled?</AccordionTrigger>
                    <AccordionContent>
                      Yes. It comes with default styles that matches the other components&apos; aesthetic.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Is it animated?</AccordionTrigger>
                    <AccordionContent>
                      Yes. It&apos;s animated by default, but you can disable it if you prefer.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* Collapsible */}
            <Card>
              <CardHeader>
                <CardTitle>Collapsible</CardTitle>
                <CardDescription>Toggle content visibility</CardDescription>
              </CardHeader>
              <CardContent>
                <Collapsible
                  open={isOpen}
                  onOpenChange={setIsOpen}
                  className="w-full space-y-2"
                >
                  <div className="flex items-center justify-between space-x-4 px-4">
                    <h4 className="text-sm font-semibold">
                      @tbk/ui has many components
                    </h4>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm">
                        {isOpen ? 'Hide' : 'Show'}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <div className="rounded-md border px-4 py-3 font-mono text-sm">
                    @tbk/ui/primitives/button
                  </div>
                  <CollapsibleContent className="space-y-2">
                    <div className="rounded-md border px-4 py-3 font-mono text-sm">
                      @tbk/ui/primitives/card
                    </div>
                    <div className="rounded-md border px-4 py-3 font-mono text-sm">
                      @tbk/ui/primitives/dialog
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>

            {/* Scroll Area */}
            <Card>
              <CardHeader>
                <CardTitle>Scroll Area</CardTitle>
                <CardDescription>Custom scrollbar styling</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-72 w-full rounded-md border">
                  <div className="p-4">
                    <h4 className="mb-4 text-sm font-medium leading-none">Tags</h4>
                    {tags.map((tag) => (
                      <React.Fragment key={tag}>
                        <div className="text-sm">{tag}</div>
                        <div className="my-2 h-px bg-border" />
                      </React.Fragment>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Aspect Ratio & Hover Card */}
            <Card>
              <CardHeader>
                <CardTitle>Aspect Ratio & Hover Card</CardTitle>
                <CardDescription>Maintain proportions and show preview on hover</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <AspectRatio ratio={16 / 9} className="bg-muted rounded-md overflow-hidden">
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                    <span className="text-muted-foreground">16:9 Aspect Ratio</span>
                  </div>
                </AspectRatio>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button variant="link">@thebazaar</Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="flex justify-between space-x-4">
                      <Avatar>
                        <AvatarImage src="https://github.com/vercel.png" />
                        <AvatarFallback>TB</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold">@thebazaar</h4>
                        <p className="text-sm">
                          The marketplace for everything you need – built with @tbk/ui
                        </p>
                        <div className="flex items-center pt-2">
                          <span className="text-xs text-muted-foreground">
                            Joined December 2024
                          </span>
                        </div>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </CardContent>
            </Card>

            {/* Skeleton (already in Tier 4, but including for completeness) */}
            <Card>
              <CardHeader>
                <CardTitle>Skeleton</CardTitle>
                <CardDescription>Loading placeholder</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button variant="link" asChild>
            <a href="/">← Back to Home</a>
          </Button>
          {' | '}
          <Button variant="link" asChild>
            <a href="/form-demo">Form Demo</a>
          </Button>
          {' | '}
          <Button variant="link" asChild>
            <a href="/overlay-demo">Overlay Demo</a>
          </Button>
          {' | '}
          <Button variant="link" asChild>
            <a href="/nav-demo">Navigation Demo</a>
          </Button>
        </div>
      </div>
    </main>
  );
}

