export type NavigationPageOptions = {
  title: string;
  href: string;
}

export type NavigationOptions = {
  title?: string;
  pages: NavigationPageOptions[];
}