export type NavigationPageOptions = {
  title: string;
  href: string;
  external?: boolean;
  badge?: string;
}

export type NavigationOptions = {
  title?: string;
  pages: NavigationPageOptions[];
}
