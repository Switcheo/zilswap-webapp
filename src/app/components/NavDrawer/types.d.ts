export type NavigationPageOptions = {
  title: string;
  href: string;
  external?: boolean;
  badge?: string;
  show?: boolean;
}

export type NavigationOptions = {
  title?: string;
  pages: NavigationPageOptions[];
}
