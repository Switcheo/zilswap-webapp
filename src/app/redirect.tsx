import React from "react";
import { useRouter } from "./utils";

interface Props {
}

const RedirectComp: React.FC<Props> = () => {
  const router = useRouter();
  router.history.replace(router.location.pathname.replace("ark/", "arky/"));
  return null;
};

export default RedirectComp;
