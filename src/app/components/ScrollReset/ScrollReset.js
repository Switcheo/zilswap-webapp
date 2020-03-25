import { useRouter } from 'app/utils';
import { useEffect } from 'react';


const ScrollReset = () => {
  const router = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [router.location.pathname]);

  return null;
};

export default ScrollReset;
