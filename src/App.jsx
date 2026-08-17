import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ScrollToTop from '@/components/ScrollToTop';
import { I18nProvider } from '@/lib/i18n';
import PageNotFound from '@/lib/PageNotFound';
import { ThemeProvider } from '@/lib/theme';
import Home from '@/pages/Home';
import Legal from '@/pages/Legal';

function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <Router basename={import.meta.env.BASE_URL} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/privacy" element={<Legal />} />
            <Route path="/security" element={<Legal />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
      </I18nProvider>
    </ThemeProvider>
  );
}

export default App;
