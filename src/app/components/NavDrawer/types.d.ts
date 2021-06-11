export type NavigationPageOptions = {
  title: string;
  href?: string;
  icon?: string;
  external?: boolean;
  badge?: string;
  show?: boolean;
  expand?: boolean;
  purchase?: boolean;
  disabled?: boolean;
  highlight?: boolean;
  items?: NavigationPageOptions[];
}

export type NavigationOptions = {
  title?: string;
  pages: NavigationPageOptions[];
}
