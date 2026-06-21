import React from "react";

export default function BaoMat() {
  const sections = [
    {
      heading: "1. Thông tin chúng tôi thu thập",
      body: "Hệ thống thu thập các thông tin cơ bản khi đăng ký tài khoản: họ tên, tên Thánh, ngày sinh, thông tin liên hệ và kết quả học tập (điểm số, điểm danh) phục vụ cho việc theo dõi quá trình học giáo lý.",
    },
    {
      heading: "2. Mục đích sử dụng thông tin",
      body: "Thông tin được sử dụng để quản lý hồ sơ học viên, hiển thị kết quả học tập, và liên hệ khi cần thiết. Chúng tôi không bán, cho thuê hay chia sẻ thông tin cá nhân cho bên thứ ba ngoài mục đích nội bộ của Ban Giáo Lý.",
    },
    {
      heading: "3. Lưu trữ và bảo vệ dữ liệu",
      body: "Dữ liệu được lưu trữ trên hệ thống của Google (Google Sheets, Apps Script) với quyền truy cập giới hạn cho giáo lý viên quản trị. Mật khẩu tài khoản được xử lý theo cơ chế bảo mật của nền tảng, không hiển thị công khai.",
    },
    {
      heading: "4. Ảnh đại diện và hình ảnh",
      body: "Ảnh đại diện do người dùng tự tải lên chỉ hiển thị trong phạm vi tài khoản cá nhân và không được sử dụng cho mục đích khác ngoài nhận diện trong hệ thống.",
    },
    {
      heading: "5. Quyền của người dùng",
      body: "Người dùng có quyền yêu cầu chỉnh sửa, cập nhật hoặc xóa thông tin cá nhân của mình bằng cách liên hệ trực tiếp với Ban Giáo Lý qua email hoặc trang Liên hệ.",
    },
    {
      heading: "6. Liên hệ",
      body: "Mọi câu hỏi liên quan đến chính sách bảo mật, vui lòng liên hệ qua email htdcanngai@gmail.com.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 antialiased">
      <div className="max-w-3xl mx-auto px-6 pt-16 pb-20 md:pt-24">
        <header className="mb-10 border-b border-stone-200/70 pb-8">
          <h1 className="font-serif font-black text-3xl md:text-4xl tracking-tight text-stone-900 mb-3">
            Chính sách bảo mật
          </h1>
          <p className="text-xs font-medium text-stone-400">Cập nhật lần cuối: tháng 6/2026</p>
        </header>

        <div className="space-y-8">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="font-serif font-bold text-lg md:text-xl text-stone-900 mb-2">
                {s.heading}
              </h2>
              <p className="text-sm md:text-[15px] text-stone-600 leading-relaxed">
                {s.body}
              </p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}