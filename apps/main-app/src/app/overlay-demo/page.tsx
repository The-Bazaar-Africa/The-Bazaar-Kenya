'use client';

import { useState } from 'react';
import { Button } from '@tbk/ui/primitives/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@tbk/ui/primitives/card';
import { Input } from '@tbk/ui/primitives/input';
import { Label } from '@tbk/ui/primitives/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@tbk/ui/primitives/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@tbk/ui/primitives/sheet';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@tbk/ui/primitives/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@tbk/ui/primitives/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@tbk/ui/primitives/alert-dialog';
import { Toaster, toast } from '@tbk/ui/primitives/sonner';

export default function OverlayDemoPage() {
  const [sheetSide, setSheetSide] = useState<'top' | 'bottom' | 'left' | 'right'>('right');

  return (
    <TooltipProvider>
      <main className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-2 text-4xl font-bold">Overlay Components Demo</h1>
          <p className="mb-8 text-muted-foreground">
            Tier 3 UI components migrated from shadcn-ui to @tbk/ui
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Dialog */}
            <Card>
              <CardHeader>
                <CardTitle>Dialog</CardTitle>
                <CardDescription>Modal dialog with form content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Open Dialog</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                      <DialogDescription>
                        Make changes to your profile here. Click save when you&apos;re done.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Name
                        </Label>
                        <Input id="name" defaultValue="John Doe" className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right">
                          Username
                        </Label>
                        <Input id="username" defaultValue="@johndoe" className="col-span-3" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Save changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Sheet */}
            <Card>
              <CardHeader>
                <CardTitle>Sheet</CardTitle>
                <CardDescription>Slide-out panel from any side</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
                    <Sheet key={side}>
                      <SheetTrigger asChild>
                        <Button variant="outline" onClick={() => setSheetSide(side)}>
                          {side.charAt(0).toUpperCase() + side.slice(1)}
                        </Button>
                      </SheetTrigger>
                      <SheetContent side={side}>
                        <SheetHeader>
                          <SheetTitle>Sheet from {side}</SheetTitle>
                          <SheetDescription>
                            This sheet slides in from the {side} of the screen.
                          </SheetDescription>
                        </SheetHeader>
                        <div className="py-4">
                          <p className="text-sm text-muted-foreground">
                            Add your content here. Sheets are great for navigation,
                            filters, or any side panel content.
                          </p>
                        </div>
                        <SheetFooter>
                          <SheetClose asChild>
                            <Button variant="outline">Close</Button>
                          </SheetClose>
                        </SheetFooter>
                      </SheetContent>
                    </Sheet>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Popover */}
            <Card>
              <CardHeader>
                <CardTitle>Popover</CardTitle>
                <CardDescription>Floating content panel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">Open Popover</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium leading-none">Dimensions</h4>
                        <p className="text-sm text-muted-foreground">
                          Set the dimensions for the layer.
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label htmlFor="width">Width</Label>
                          <Input id="width" defaultValue="100%" className="col-span-2 h-8" />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label htmlFor="maxWidth">Max. width</Label>
                          <Input id="maxWidth" defaultValue="300px" className="col-span-2 h-8" />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label htmlFor="height">Height</Label>
                          <Input id="height" defaultValue="25px" className="col-span-2 h-8" />
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </CardContent>
            </Card>

            {/* Tooltip */}
            <Card>
              <CardHeader>
                <CardTitle>Tooltip</CardTitle>
                <CardDescription>Hover information display</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline">Hover me (Top)</Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Tooltip on top</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline">Hover me (Bottom)</Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Tooltip on bottom</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline">Hover me (Left)</Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>Tooltip on left</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline">Hover me (Right)</Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Tooltip on right</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>

            {/* Alert Dialog */}
            <Card>
              <CardHeader>
                <CardTitle>Alert Dialog</CardTitle>
                <CardDescription>Confirmation modal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete Account</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        account and remove your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>

            {/* Toast (Sonner) */}
            <Card>
              <CardHeader>
                <CardTitle>Toast (Sonner)</CardTitle>
                <CardDescription>Notification toasts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => toast('Event has been created')}
                  >
                    Default Toast
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      toast.success('Profile saved!', {
                        description: 'Your changes have been saved successfully.',
                      })
                    }
                  >
                    Success Toast
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      toast.error('Something went wrong', {
                        description: 'Please try again later.',
                      })
                    }
                  >
                    Error Toast
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      toast.promise(
                        new Promise((resolve) => setTimeout(resolve, 2000)),
                        {
                          loading: 'Loading...',
                          success: 'Data loaded successfully!',
                          error: 'Failed to load data',
                        }
                      )
                    }
                  >
                    Promise Toast
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <Button variant="link" asChild>
              <a href="/">← Back to Home</a>
            </Button>
            {' | '}
            <Button variant="link" asChild>
              <a href="/form-demo">Form Components Demo →</a>
            </Button>
          </div>
        </div>

        {/* Sonner Toaster - renders toast notifications */}
        <Toaster />
      </main>
    </TooltipProvider>
  );
}

