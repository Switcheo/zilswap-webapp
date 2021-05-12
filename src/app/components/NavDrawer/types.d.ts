export type NavigationPageOptions = {
  title: string;
  href?: string;
  external?: boolean;
  badge?: string;
  show?: boolean;
  expand?: boolean;
  purchase?: boolean;
  highlight?: boolean;
  items?: NavigationPageOptions[];
}

export type NavigationOptions = {
  title?: string;
  pages: NavigationPageOptions[];
}
