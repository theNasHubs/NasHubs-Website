import { Link, useLocation } from 'react-router-dom';

export default function PageNotFound() {
  const { pathname } = useLocation();

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-surface text-ink">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-7xl font-light text-ink-muted">404</h1>
          <div className="h-0.5 w-16 bg-border mx-auto" />
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold">Không tìm thấy trang</h2>
          <p className="text-ink-muted leading-relaxed">
            Đường dẫn <span className="font-medium text-ink">{pathname}</span> không tồn tại.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center rounded-full bg-[#0F172A] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#6366F1] dark:bg-white dark:text-[#0F172A]"
        >
          Về trang chủ
        </Link>
      </div>
    </main>
  );
}
