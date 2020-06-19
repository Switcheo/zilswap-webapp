export type NavigationPageOptions = {
  title: string;
  href: string;
  external?: boolean;
}

export type NavigationOptions = {
  title?: string;
  pages: NavigationPageOptions[];
}