import Link from "next/link";
import Image from "next/image";
import LandingImage from "@/components/landing-image";
import {
  Guitar,
  Music,
  Clock,
  MapPin,
  Phone,
  Mail,
  GraduationCap,
  Users,
  Star,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

function FacebookIcon({ className = "h-4.5 w-4.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.5-3.91 3.78-3.91 1.09 0 2.24.2 2.24.2v2.47H15.2c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.45 2.91h-2.33V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
  );
}

function ZaloIcon({ className = "h-4.5 w-4.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect width="24" height="24" rx="6" fill="#0068FF" />
      <text
        x="12"
        y="16.8"
        textAnchor="middle"
        fontSize="14"
        fontWeight="700"
        fill="#FFFFFF"
        fontFamily="Arial, sans-serif"
      >
        Z
      </text>
    </svg>
  );
}

const courses = [
  {
    name: "Cơ bản (Đệm hát)",
    level: "Dành cho người mới bắt đầu",
    duration: "3 - 6 tháng",
    tuition: "800.000đ / tháng",
    image:
      "https://images.unsplash.com/photo-1550291652-6ea9114a47b1?auto=format&fit=crop&w=800&q=80",
    description: "Làm quen với đàn, hợp âm cơ bản, điệu nhạc và đệm hát những bài nhạc yêu thích.",
    features: [
      "Nhạc lý cơ bản & kỹ thuật bấm hợp âm",
      "Các điệu cơ bản: Ballad, Pop, Valse",
      "Đệm hát thành thạo 5 - 10 bài",
    ],
  },
  {
    name: "Cổ điển (Classic)",
    level: "Dành cho người đã biết đệm hát",
    duration: "6 - 12 tháng",
    tuition: "900.000đ / tháng",
    image:
      "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?auto=format&fit=crop&w=800&q=80",
    description: "Kỹ thuật fingerpicking, ngón bấm chuẩn và những tác phẩm guitar cổ điển nổi tiếng.",
    features: [
      "Kỹ thuật chạy ngón, vibrato, tremolo",
      "Luyện tập các bản classic kinh điển",
      "Đọc sheet & phân tích tác phẩm",
    ],
  },
  {
    name: "Nâng cao (Fingerstyle)",
    level: "Dành cho học viên khá - giỏi",
    duration: "6 - 12 tháng",
    tuition: "1.000.000đ / tháng",
    image:
      "https://images.unsplash.com/photo-1518987048-93e29699e79a?auto=format&fit=crop&w=800&q=80",
    description: "Fingerstyle hiện đại, sáng tác, cải biên và biểu diễn sân khấu chuyên nghiệp.",
    features: [
      "Kỹ thuật percussive guitar",
      "Cải biên bài hát theo phong cách riêng",
      "Biểu diễn & ghi hình tác phẩm",
    ],
  },
];

const highlights = [
  {
    icon: GraduationCap,
    title: "Giảng viên tận tâm",
    description: "Đội ngũ giảng viên tốt nghiệp nhạc viện, giàu kinh nghiệm giảng dạy mọi lứa tuổi.",
  },
  {
    icon: Star,
    title: "Lộ trình rõ ràng",
    description: "Mỗi học viên có lộ trình riêng, được kiểm tra định kỳ và điều chỉnh phù hợp.",
  },
  {
    icon: Guitar,
    title: "Đàn & phòng học chuẩn",
    description: "Phòng học cách âm, đàn guitar chất lượng cao, môi trường luyện tập thoải mái.",
  },
  {
    icon: Clock,
    title: "Giờ học linh hoạt",
    description: "Ca học sáng - chiều - tối tất cả các ngày trong tuần, kể cả cuối tuần.",
  },
];

const teacher = {
  name: "Thầy Tiến Guitar",
  role: "Sáng lập & Giảng viên chính",
  bio: "10 năm kinh nghiệm giảng dạy, chuyên đào tạo học viên từ con số 0 đến biểu diễn sân khấu. Người truyền cảm hứng cho hơn 300 học viên của trung tâm.",
  stats: [
    { value: "10+", label: "Năm giảng dạy" },
    { value: "300+", label: "Học viên đã dạy" },
    { value: "50+", label: "Học viên biểu diễn thành công" },
  ],
  quote:
    "\"Cây đàn là người bạn đồng hành — việc của tôi là giúp bạn và nó trở thành bạn thân.\"",
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 text-neutral-900 transition-colors duration-300 dark:bg-neutral-950 dark:text-neutral-50">
      <header className="sticky top-0 z-50 w-full border-b border-neutral-200/50 bg-white/70 backdrop-blur-md transition-colors dark:border-neutral-800/50 dark:bg-neutral-950/70">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5 text-lg font-semibold tracking-tight">
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-brand-subtle/60 shadow-sm">
              <Image
                src="/logo/logo.jpg"
                alt="May Center"
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            </div>
            <span>May Center</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-neutral-500 md:flex dark:text-neutral-400">
            <a href="#gioi-thieu" className="transition-colors hover:text-brand-dark dark:hover:text-brand-light">Giới thiệu</a>
            <a href="#khoa-hoc" className="transition-colors hover:text-brand-dark dark:hover:text-brand-light">Khóa học</a>
            <a href="#giang-vien" className="transition-colors hover:text-brand-dark dark:hover:text-brand-light">Giảng viên</a>
            <a href="#lien-he" className="transition-colors hover:text-brand-dark dark:hover:text-brand-light">Liên hệ</a>
          </nav>
          <a
            href="#lien-he"
            className="rounded-full bg-brand px-5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-brand-dark"
          >
            Đăng ký học
          </a>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden px-4 py-20 sm:py-28 lg:px-8">
          <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-subtle/40 blur-3xl dark:bg-brand/10" />
          <div className="fade-in relative mx-auto max-w-4xl text-center">

            <h1 className="text-4xl font-extrabold leading-[1.15] tracking-tight text-neutral-900 sm:text-6xl dark:text-white">
              Học Guitar <br />
              <span className="bg-gradient-to-r from-brand-light via-brand to-brand-dark bg-clip-text text-transparent">
                Từ con số 0
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-neutral-500 sm:text-lg dark:text-neutral-400">
              May Center đồng hành cùng bạn trên hành trình chinh phục cây đàn — từ những hợp âm
              đầu tiên đến những bản nhạc hoàn chỉnh, với lộ trình bài bản và giảng viên tận tâm.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-x-4">
              <a
                href="#khoa-hoc"
                className="rounded-xl bg-brand px-6 py-3 text-center text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-dark sm:w-auto"
              >
                Xem các khóa học
              </a>
              <a
                href="#lien-he"
                className="group flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200/80 bg-white px-6 py-3 text-center text-sm font-semibold transition-all hover:bg-neutral-50 sm:w-auto dark:border-neutral-800 dark:bg-neutral-900"
              >
                Tư vấn miễn phí
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>

          <div className="fade-in mx-auto mt-16 max-w-4xl rounded-3xl border border-neutral-200 bg-white p-6 shadow-xl sm:p-8 dark:border-neutral-800 dark:bg-neutral-900/40" style={{ animationDelay: "0.15s" }}>
            <div className="grid grid-cols-2 gap-6 text-center sm:grid-cols-4">
              {[
                { value: "8+", label: "Năm kinh nghiệm" },
                { value: "300+", label: "Học viên đã đào tạo" },
                { value: "1:1", label: "Hướng dẫn trực tiếp" },
                { value: "3", label: "Cấp độ khóa học" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl font-extrabold tracking-tight text-brand-dark dark:text-brand-light">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="fade-in mx-auto mt-10 max-w-5xl overflow-hidden rounded-3xl border border-neutral-300 bg-neutral-100/60 dark:border-neutral-700 dark:bg-neutral-900/30" style={{ animationDelay: "0.3s" }}>
            <div className="relative aspect-[16/8] w-full sm:aspect-[16/7]">
              <LandingImage
                src="https://images.unsplash.com/photo-1525201548942-d8732f6617a0?auto=format&fit=crop&w=1600&q=80"
                alt="Lớp học guitar tại May Center"
                label="Hình ảnh lớp học guitar — sẽ cập nhật sau"
              />
            </div>
          </div>
        </section>

        <section id="gioi-thieu" className="border-t border-neutral-200/50 bg-neutral-100/30 py-20 sm:py-24 dark:border-neutral-800/50 dark:bg-neutral-900/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Vì sao chọn May Center?</h2>
              <p className="mt-4 text-base text-neutral-500 dark:text-neutral-400">
                Chúng tôi tin rằng ai cũng có thể chơi được guitar — chỉ cần một người thầy đúng và một lộ trình phù hợp.
              </p>
            </div>

            <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-2xl border border-neutral-200 bg-white p-6 transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/50">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-subtle/60 text-brand-dark dark:bg-brand/15 dark:text-brand-light">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-neutral-900 dark:text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="khoa-hoc" className="py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Các khóa học</h2>
              <p className="mt-4 text-base text-neutral-500 dark:text-neutral-400">
                Lộ trình học tập rõ ràng cho mọi trình độ, từ người mới bắt đầu đến học viên nâng cao.
              </p>
            </div>

            <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-3">
              {courses.map((course) => (
                <div
                  key={course.name}
                  className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all hover:-translate-y-1 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900/50"
                >
                  <div className="relative aspect-video w-full border-b border-neutral-200 bg-neutral-100/60 dark:border-neutral-800 dark:bg-neutral-900/40">
                    <LandingImage
                      src={course.image}
                      alt={`Khóa học ${course.name}`}
                      label="Hình ảnh khóa học — sẽ cập nhật sau"
                    />
                  </div>

                  <div className="flex flex-1 flex-col p-7">
                    <div className="flex items-center gap-2">
                      <Music className="h-4 w-4 text-brand dark:text-brand-light" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-dark dark:text-brand-light">
                        {course.level}
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-bold text-neutral-900 dark:text-white">{course.name}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                      {course.description}
                    </p>

                    <ul className="mt-5 space-y-2.5">
                      {course.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand dark:text-brand-light" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-5 dark:border-neutral-800">
                      <div>
                        <p className="text-[10px] text-neutral-400">Học phí</p>
                        <p className="text-sm font-bold text-neutral-900 dark:text-white">{course.tuition}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-neutral-400">Thời gian</p>
                        <p className="flex items-center gap-1 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                          <Clock className="h-3.5 w-3.5 text-brand dark:text-brand-light" />
                          {course.duration}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="giang-vien" className="border-t border-neutral-200/50 bg-neutral-100/30 py-20 sm:py-24 dark:border-neutral-800/50 dark:bg-neutral-900/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Giảng viên của bạn</h2>
              <p className="mt-4 text-base text-neutral-500 dark:text-neutral-400">
                Mọi khóa học đều do thầy trực tiếp đứng lớp — đảm bảo chất lượng và sự tận tâm trọn vẹn.
              </p>
            </div>

            <div className="mx-auto mt-14 max-w-4xl overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900/40">
              <div className="grid grid-cols-1 md:grid-cols-5">
                <div className="relative aspect-[4/5] w-full border-b border-neutral-200 bg-neutral-100/60 md:col-span-2 md:border-b-0 md:border-r dark:border-neutral-800 dark:bg-neutral-900/40">
                  <LandingImage
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"
                    alt="Thầy Tiến Guitar"
                    label="Hình ảnh giảng viên — sẽ cập nhật sau"
                  />
                </div>

                <div className="flex flex-col justify-center p-8 sm:p-10 md:col-span-3">
                  <span className="inline-flex w-fit items-center rounded-full bg-brand-subtle/60 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-dark dark:bg-brand/15 dark:text-brand-light">
                    {teacher.role}
                  </span>
                  <h3 className="mt-3 text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
                    {teacher.name}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                    {teacher.bio}
                  </p>

                  <div className="mt-7 grid grid-cols-3 gap-4">
                    {teacher.stats.map((stat) => (
                      <div key={stat.label} className="rounded-xl border border-neutral-100 bg-neutral-50/60 p-3 text-center dark:border-neutral-800 dark:bg-neutral-950/30">
                        <p className="text-xl font-extrabold tracking-tight text-brand-dark dark:text-brand-light">
                          {stat.value}
                        </p>
                        <p className="mt-0.5 text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  <blockquote className="mt-7 border-l-2 border-brand pl-4 text-sm italic leading-relaxed text-neutral-600 dark:text-neutral-400">
                    {teacher.quote}
                  </blockquote>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="lien-he" className="py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-8">
            <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900/40">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-8 sm:p-10">
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Liên hệ đăng ký học</h2>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                    Để lại thông tin hoặc gọi điện trực tiếp cho chúng tôi để được tư vấn khóa học phù hợp nhất.
                  </p>

                  <div className="mt-8 space-y-4 text-sm">
                    <div className="flex items-center gap-3 text-neutral-700 dark:text-neutral-300">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-subtle/60 text-brand-dark dark:bg-brand/15 dark:text-brand-light">
                        <MapPin className="h-4.5 w-4.5" />
                      </div>
                      <span>100/5 Tô Hiến Thành, Đà Nẵng, Việt Nam</span>
                    </div>
                    <div className="flex items-center gap-3 text-neutral-700 dark:text-neutral-300">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-subtle/60 text-brand-dark dark:bg-brand/15 dark:text-brand-light">
                        <Phone className="h-4.5 w-4.5" />
                      </div>
                      <a href="tel:+84777564456" className="transition-colors hover:text-brand-dark dark:hover:text-brand-light">
                        077 756 4456
                      </a>
                    </div>
                    <div className="flex items-center gap-3 text-neutral-700 dark:text-neutral-300">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-subtle/60 text-brand-dark dark:bg-brand/15 dark:text-brand-light">
                        <Mail className="h-4.5 w-4.5" />
                      </div>
                      <a href="mailto:maycenter1502@gmail.com" className="transition-colors hover:text-brand-dark dark:hover:text-brand-light">
                        maycenter1502@gmail.com
                      </a>
                    </div>
                    <div className="flex items-center gap-3 text-neutral-700 dark:text-neutral-300">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-subtle/60 text-brand-dark dark:bg-brand/15 dark:text-brand-light">
                        <Users className="h-4.5 w-4.5" />
                      </div>
                      <span>Giờ mở cửa: 8:00 - 21:00, tất cả các ngày</span>
                    </div>
                    <div className="flex items-center gap-3 text-neutral-700 dark:text-neutral-300">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-subtle/60 text-brand-dark dark:bg-brand/15 dark:text-brand-light">
                        <FacebookIcon />
                      </div>
                      <a
                        href="https://www.facebook.com/profile.php?id=61589223766770"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-colors hover:text-brand-dark dark:hover:text-brand-light"
                      >
                        May Center trên Facebook
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center border-t border-neutral-200 bg-neutral-50/60 p-8 sm:p-10 dark:border-neutral-800 dark:bg-neutral-950/30">
                  <a
                    href="https://www.facebook.com/profile.php?id=61589223766770"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-center text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-dark"
                  >
                    <FacebookIcon />
                    Liên hệ ngay trên Facebook
                  </a>
                  <a
                    href="https://zalo.me/0777564456"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-[#0068FF] px-6 py-3.5 text-center text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#0055CC]"
                  >
                    <ZaloIcon className="h-5 w-5" />
                    Chat Zalo: 077 756 4456
                  </a>
                  <a
                    href="tel:+84777564456"
                    className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-6 py-3.5 text-center text-sm font-semibold text-neutral-700 transition-all hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
                  >
                    <Phone className="h-4.5 w-4.5 text-brand dark:text-brand-light" />
                    Gọi ngay: 077 756 4456
                  </a>
                  <p className="mt-4 text-center text-[11px] leading-relaxed text-neutral-400">
                    Buổi học thử đầu tiên hoàn toàn miễn phí. Hãy đến trải nghiệm cùng chúng tôi!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200/50 bg-white py-8 transition-colors dark:border-neutral-800/50 dark:bg-neutral-950">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-neutral-500 dark:text-neutral-400 sm:px-8">
          <p>© {new Date().getFullYear()} May Center. Trung tâm dạy đàn guitar — đam mê, tận tâm, chất lượng.</p>
        </div>
      </footer>
    </div>
  );
}
