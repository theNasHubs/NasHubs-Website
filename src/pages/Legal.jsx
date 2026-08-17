import { Link } from "react-router-dom";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";

// Bilingual legal content (Privacy Policy + Security Commitment). Kept inline so
// it doesn't bloat the app translations file. This page is the public URL you
// declare in App Store Connect / Google Play as the privacy policy.
const CONTENT = {
  vn: {
    updated: "Cập nhật lần cuối: 08/2026",
    back: "Về trang chủ",
    privacy: {
      title: "Chính sách quyền riêng tư",
      sections: [
        ["Tóm tắt", "NasHubs được thiết kế để bạn tự quản lý NAS của mình. Ứng dụng KHÔNG bán dữ liệu của bạn, KHÔNG chạy quảng cáo và KHÔNG gửi nội dung/tệp trên NAS về máy chủ của chúng tôi. Kết nối tới NAS diễn ra trực tiếp giữa thiết bị của bạn và thiết bị NAS."],
        ["Dữ liệu lưu trên thiết bị", "Thông tin đăng nhập NAS (địa chỉ, tài khoản, mật khẩu) được lưu an toàn trong kho khoá bảo mật của hệ điều hành (Keychain trên iOS, Keystore/EncryptedSharedPreferences trên Android) ngay trên thiết bị của bạn, và chỉ dùng để kết nối tới NAS. Chúng không được truyền tới chúng tôi hay bên thứ ba."],
        ["Tài khoản NasHubs", "Nếu bạn đăng nhập bằng Apple hoặc Google, chúng tôi lưu email và mã định danh tài khoản (qua dịch vụ đám mây bảo mật) chỉ để xác thực và quản lý trạng thái gói (miễn phí/Pro). Bạn có thể yêu cầu xoá tài khoản và dữ liệu này bất cứ lúc nào."],
        ["Thanh toán", "Việc mua gói Pro được xử lý hoàn toàn bởi Apple (In-App Purchase) hoặc Google Play Billing. Chúng tôi không nhận hay lưu trữ thông tin thẻ/thanh toán của bạn."],
        ["Kết nối tới NAS & Agent", "Mọi thao tác quản lý NAS đi trực tiếp tới NAS của bạn. Khi dùng NasHubs Agent, kênh kết nối được bảo vệ bằng chữ ký Ed25519 và TLS. Chúng tôi không có quyền truy cập vào NAS của bạn."],
        ["Quyền & dữ liệu thiết bị", "Ứng dụng chỉ dùng mạng để kết nối NAS và các dịch vụ bạn cấu hình. Ảnh/tệp bạn xem hoặc tải chỉ được xử lý cục bộ trên thiết bị theo yêu cầu của bạn."],
        ["Liên hệ", "Mọi câu hỏi về quyền riêng tư, vui lòng liên hệ: duconmang43@gmail.com"],
      ],
    },
    security: {
      title: "Cam kết bảo mật",
      items: [
        ["Mật khẩu lưu trong kho khoá thiết bị", "Thông tin đăng nhập NAS được lưu trong Keychain/Keystore, mã hoá ở cấp thiết bị và không rời khỏi máy bạn."],
        ["Kênh Agent Ed25519 + TLS", "NasHubs Agent xác thực mọi yêu cầu bằng chữ ký Ed25519 và mã hoá đường truyền bằng TLS, kèm ghim chứng chỉ (TLS pinning)."],
        ["Không thu thập nội dung", "Chúng tôi không đọc, sao chép hay tải lên tệp/ảnh trên NAS của bạn. Dữ liệu đi trực tiếp giữa thiết bị và NAS."],
        ["Tối thiểu hoá dữ liệu", "Chỉ lưu email và trạng thái gói để vận hành tài khoản. Không bán dữ liệu, không quảng cáo, không theo dõi bên thứ ba."],
        ["Bạn kiểm soát", "Bạn có thể đăng xuất để xoá phiên và thông tin nhạy cảm khỏi thiết bị, hoặc yêu cầu xoá tài khoản NasHubs bất cứ lúc nào."],
      ],
    },
  },
  en: {
    updated: "Last updated: Aug 2026",
    back: "Back to home",
    privacy: {
      title: "Privacy Policy",
      sections: [
        ["Summary", "NasHubs is built for you to manage your own NAS. The app does NOT sell your data, does NOT show ads, and does NOT send your NAS content/files to our servers. Connections to your NAS happen directly between your device and the NAS."],
        ["Data stored on device", "Your NAS credentials (address, account, password) are stored securely in the operating system's secure store (Keychain on iOS, Keystore/EncryptedSharedPreferences on Android) on your own device, used only to connect to your NAS. They are never transmitted to us or any third party."],
        ["NasHubs account", "If you sign in with Apple or Google, we store your email and account identifier (via a secure cloud service) solely to authenticate you and manage your plan (Free/Pro). You may request deletion of this account and data at any time."],
        ["Payments", "Pro purchases are handled entirely by Apple (In-App Purchase) or Google Play Billing. We never receive or store your card/payment details."],
        ["NAS & Agent connection", "All NAS management goes directly to your NAS. When using the NasHubs Agent, the channel is protected with Ed25519 signatures and TLS. We have no access to your NAS."],
        ["Device permissions & data", "The app uses the network only to reach your NAS and the services you configure. Photos/files you view or download are processed locally on your device at your request."],
        ["Contact", "For any privacy questions, contact us at: duconmang43@gmail.com"],
      ],
    },
    security: {
      title: "Security Commitment",
      items: [
        ["Credentials in the device secure store", "NAS credentials live in the Keychain/Keystore, encrypted at the device level, and never leave your device."],
        ["Ed25519 + TLS agent channel", "The NasHubs Agent authenticates every request with Ed25519 signatures and encrypts traffic with TLS, including certificate pinning."],
        ["No content collection", "We do not read, copy, or upload the files/photos on your NAS. Data flows directly between your device and your NAS."],
        ["Data minimization", "We only store your email and plan status to run your account. No data selling, no ads, no third-party tracking."],
        ["You are in control", "You can sign out to wipe your session and sensitive data from the device, or request deletion of your NasHubs account at any time."],
      ],
    },
  },
};

export default function Legal() {
  const { lang } = useI18n();
  const c = CONTENT[lang === "en" ? "en" : "vn"];

  return (
    <main className="min-h-screen bg-surface text-ink">
      <div className="mx-auto w-full max-w-3xl px-6 py-14">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted transition-colors hover:text-emerald-500">
          <ArrowLeft className="h-4 w-4" />
          {c.back}
        </Link>

        {/* Privacy Policy */}
        <section id="privacy" className="mt-8 scroll-mt-24">
          <h1 className="text-3xl font-extrabold tracking-tight">{c.privacy.title}</h1>
          <p className="mt-1 text-sm text-ink-muted">{c.updated}</p>
          <div className="mt-8 space-y-7">
            {c.privacy.sections.map(([title, body]) => (
              <div key={title}>
                <h2 className="text-lg font-bold text-emerald-500">{title}</h2>
                <p className="mt-1.5 leading-relaxed text-ink/85">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Security Commitment */}
        <section id="security" className="mt-14 scroll-mt-24 border-t border-border pt-12">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-6 w-6 text-emerald-500" />
            <h1 className="text-3xl font-extrabold tracking-tight">{c.security.title}</h1>
          </div>
          <div className="mt-8 space-y-5">
            {c.security.items.map(([title, body]) => (
              <div key={title} className="flex gap-4 rounded-2xl border border-border bg-surface-2/60 p-5">
                <Lock className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                <div>
                  <h3 className="font-bold">{title}</h3>
                  <p className="mt-1 leading-relaxed text-ink/80">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-16 border-t border-border pt-6 text-center text-xs text-ink-muted">
          © {new Date().getFullYear()} NasHubs · duconmang43@gmail.com
        </footer>
      </div>
    </main>
  );
}
