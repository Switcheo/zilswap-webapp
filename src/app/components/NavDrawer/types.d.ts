export type NavigationPageOptions = {
  title: string;
  href?: string;
  external?: boolean;
  badge?: string;
  show?: boolean;
  expand?: boolean;
  items?: NavigationPageOptions[];
}

export type NavigationOptions = {
  title?: string;
  pages: NavigationPageOptions[];
}
