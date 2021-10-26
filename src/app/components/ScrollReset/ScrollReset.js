import { useEffect } from 'react';
import { useRouter } from 'app/utils';


const ScrollReset = () => {
  const router = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [router.location.pathname]);

  return null;
};

export default ScrollReset;
