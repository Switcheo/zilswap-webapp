import React, { useEffect } from "react";
import { useHistory } from "react-router";

interface Props {
}

const RedirectComp: React.FC<Props> = () => {
  const history = useHistory();

  useEffect(() => {
    history.replace(history.location.pathname.replace("/ark", "/arky"));
    // eslint-disable-next-line
  }, []);

  return null;
};

export default RedirectComp;
