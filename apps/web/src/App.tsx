import { useState, useEffect } from 'react';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

type Route = 'login' | 'register';

const getRoute = (): Route => {
  const path = window.location.pathname;
  if (path === '/register') return 'register';
  return 'login';
};

const App = () => {
  const [route, setRoute] = useState<Route>(getRoute);

  useEffect(() => {
    const onPop = () => setRoute(getRoute());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Intercept <a href> clicks for in-app navigation
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (href === '/login' || href === '/register') {
        e.preventDefault();
        window.history.pushState(null, '', href);
        setRoute(href.slice(1) as Route);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  if (route === 'register') return <RegisterPage />;
  return <LoginPage />;
};

export default App;
