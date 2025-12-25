// Utils
export { cn } from './utils/cn';

// Primitives - Tier 1: Core
export { Button, buttonVariants, type ButtonProps } from './primitives/button';
export { Input } from './primitives/input';
export { Label, labelVariants } from './primitives/label';
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from './primitives/card';
export { Badge, badgeVariants, type BadgeProps } from './primitives/badge';

// Primitives - Tier 2: Form Components
export { Checkbox } from './primitives/checkbox';
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from './primitives/select';
export { Switch } from './primitives/switch';
export { RadioGroup, RadioGroupItem } from './primitives/radio-group';
export { Textarea } from './primitives/textarea';
export {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
  useFormField,
} from './primitives/form';

// Primitives - Tier 3: Overlays
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './primitives/dialog';
export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  sheetVariants,
} from './primitives/sheet';
export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor } from './primitives/popover';
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './primitives/tooltip';
export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from './primitives/alert-dialog';
export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  toastVariants,
} from './primitives/toast';
export { Toaster, toast } from './primitives/sonner';

// Primitives - Tier 4: Navigation
export { Tabs, TabsList, TabsTrigger, TabsContent } from './primitives/tabs';
export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from './primitives/breadcrumb';
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from './primitives/dropdown-menu';
export {
  navigationMenuTriggerStyle,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
} from './primitives/navigation-menu';
export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
} from './primitives/menubar';
export { Separator } from './primitives/separator';
export { Skeleton } from './primitives/skeleton';

// Sidebar (complex component with sub-modules)
export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
  sidebarMenuButtonVariants,
} from './primitives/sidebar';

// Primitives - Tier 5: Data Display
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from './primitives/table';
export {
  DataTable,
  type DataTableColumn,
  type DataTableProps,
  type DataTableSort,
  type DataTablePagination,
} from './primitives/data-table';
export {
  StatCard,
  StatCardGroup,
  type StatCardProps,
  type StatCardGroupProps,
} from './primitives/stat-card';
export { Avatar, AvatarImage, AvatarFallback } from './primitives/avatar';
export { Progress } from './primitives/progress';
export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from './primitives/accordion';
export {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from './primitives/collapsible';
export { ScrollArea, ScrollBar } from './primitives/scroll-area';
export { AspectRatio } from './primitives/aspect-ratio';
export { HoverCard, HoverCardTrigger, HoverCardContent } from './primitives/hover-card';
export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
  useChart,
  type ChartConfig,
} from './primitives/chart';

// Primitives - Tier 6: Additional Components (migrated from legacy)
export { Alert, AlertTitle, AlertDescription, alertVariants } from './primitives/alert';
export { Toggle, toggleVariants } from './primitives/toggle';
export { ToggleGroup, ToggleGroupItem } from './primitives/toggle-group';
export { Slider } from './primitives/slider';
export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
} from './primitives/drawer';
export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './primitives/pagination';
export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
} from './primitives/context-menu';
export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from './primitives/command';
export {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from './primitives/resizable';
export {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from './primitives/input-otp';

// Hooks
export { useIsMobile } from './hooks/use-mobile';
