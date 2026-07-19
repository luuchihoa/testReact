// supabase/functions/send-newsletter/index.ts
// Deploy: supabase functions deploy send-newsletter --no-verify-jwt
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Hàm chia nhỏ mảng (Chunking Array)
 */
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Hàm chuyển đổi xuống dòng (\n) thành <br>
 */
function formatMessage(msg: string): string {
  // Thay thế ký tự xuống dòng thành <br> để email hiển thị tốt hơn
  return msg.replace(/\n/g, "<br/>");
}

serve(async (req) => {
  // 1. Xử lý CORS cho trình duyệt
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 2. Xác thực người gửi (Phải là Admin)
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: "Lỗi: Không tìm thấy Token xác thực từ trình duyệt" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: getUserError } = await supabaseClient.auth.getUser(token);
    if (getUserError || !user) {
      return new Response(JSON.stringify({ success: false, error: "Chưa đăng nhập hoặc Token hết hạn" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Kiểm tra quyền Admin
    const { data: userData } = await supabaseClient
      .from("users")
      .select("role, username")
      .eq("auth_id", user.id)
      .single();
      
    if (userData?.role !== "admin") {
      return new Response(JSON.stringify({ success: false, error: "Không có quyền gửi Newsletter" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // 3. Lấy nội dung thông báo
    const { title, message, link } = await req.json();
    if (!title || !message) {
      return new Response(JSON.stringify({ success: false, error: "Thiếu tiêu đề hoặc nội dung" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const formattedMessage = formatMessage(message);

    // Dùng Service Role Key để bỏ qua RLS khi truy xuất danh sách email và log lịch sử
    const supabaseAdmin = createClient(
      supabaseUrl, 
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 4. Lấy danh sách email
    const { data: subscribers, error: subError } = await supabaseAdmin
      .from("subscribers")
      .select("email")
      .eq("status", "active");

    if (subError) {
      return new Response(JSON.stringify({ success: false, error: `Lỗi truy xuất database: ${subError.message}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    if (!subscribers || subscribers.length === 0) {
      return new Response(JSON.stringify({ success: true, message: "Không có người đăng ký nào" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const emailList = subscribers.map(s => s.email);

    // 5. CHIA NHỎ DANH SÁCH & GỬI EMAIL
    // Resend giới hạn tối đa 50 email BCC mỗi lần gọi API
    const emailChunks = chunkArray(emailList, 50);
    
    // Gửi song song tất cả các lô email
    const sendPromises = emailChunks.map(chunk => {
      return fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Ban Giáo Lý <onboarding@resend.dev>", 
          to: ["globallowcostdigitalcurrent@gmail.com"], // Gửi chính mình để tránh spam list
          bcc: chunk, // Tối đa 50 người
          subject: `[Ban Giáo Lý] ${title}`,
          html: `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #FDFBF7; font-family: 'Inter', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FDFBF7; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05); border: 1px solid #f5ede4;">
          
          <!-- Header Banner -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #92400e 0%, #d97706 100%); padding: 40px 20px;">
              <h1 style="margin: 0; color: #ffffff; font-family: 'Playfair Display', Georgia, serif; font-size: 28px; font-weight: 700; letter-spacing: 1px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">BAN GIÁO LÝ</h1>
              <p style="margin: 8px 0 0 0; color: #fef3c7; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 3px; opacity: 0.9;">Giáo Xứ An Ngãi</p>
            </td>
          </tr>

          <!-- Nội dung chính -->
          <tr>
            <td style="padding: 48px 36px;">
              <h2 style="margin: 0 0 24px 0; color: #292524; font-size: 22px; font-weight: 700; line-height: 1.4;">
                ${title}
              </h2>
              
              <div style="color: #44403c; font-size: 16px; line-height: 1.8;">
                ${formattedMessage}
              </div>

              <!-- Nút đính kèm -->
              ${link ? `
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 40px;">
                <tr>
                  <td align="left">
                    <a href="${link}" style="display: inline-block; background-color: #b45309; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 16px 32px; border-radius: 50px; box-shadow: 0 4px 12px rgba(180, 83, 9, 0.25);">
                      Xem Chi Tiết Đính Kèm
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #fafaf9; border-top: 1px solid #f5ede4; padding: 32px;">
              <p style="margin: 0; color: #78716c; font-size: 13px; line-height: 1.6;">
                Bạn nhận được thông báo này vì đã đăng ký nhận bản tin từ hệ thống Ban Giáo Lý.<br>
                © ${new Date().getFullYear()} Xứ Đoàn Thiếu Nhi Thánh Thể - Giáo Xứ An Ngãi.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
          `,
        }),
      });
    });

    const results = await Promise.all(sendPromises);
    
    // Kiểm tra xem có batch nào bị lỗi không
    for (const res of results) {
      if (!res.ok) {
        const errData = await res.text();
        console.error("Lỗi gửi một batch:", errData);
        // Không throw ngay để các batch khác vẫn có thể hoàn thành, nhưng sẽ log lại
      }
    }

    // 6. LƯU LỊCH SỬ VÀO DATABASE (Bảng newsletters)
    const { error: logError } = await supabaseAdmin
      .from("newsletters")
      .insert({
        title: title,
        message: message,
        link: link || null,
        created_by: userData.username || "Hệ thống"
      });

    if (logError) {
      console.error("Lưu lịch sử Newsletter thất bại:", logError.message);
      // Vẫn trả về 200 vì mail đã gửi xong, lỗi log không ảnh hưởng tới kết quả gửi mail
    }

    return new Response(JSON.stringify({ success: true, count: emailList.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Lỗi nội bộ Edge Function:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});