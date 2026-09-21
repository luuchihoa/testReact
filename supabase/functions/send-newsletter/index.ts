// supabase/functions/send-newsletter/index.ts
// Deploy: supabase functions deploy send-newsletter --no-verify-jwt
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") || "Ban Giáo Lý <onboarding@resend.dev>";
const RESEND_ADMIN_COPY_EMAIL = Deno.env.get("RESEND_ADMIN_COPY_EMAIL") || null;
const PUBLIC_SITE_URL = Deno.env.get("PUBLIC_SITE_URL") || "https://giaoxuanngai.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Hàm escape HTML chống XSS và vỡ bố cục email
 */
function escapeHtml(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Hàm format message: escape HTML trước rồi mới chuyển đổi \n thành <br/>
 */
function formatMessage(msg: string): string {
  const escaped = escapeHtml(msg);
  return escaped.replace(/\n/g, "<br/>");
}

/**
 * Chuẩn hóa link: chuyển relative path (/tuyển-sinh) thành URL tuyệt đối (https://...)
 */
function resolveAbsoluteLink(rawLink: string | null | undefined): string | null {
  if (!rawLink) return null;
  const trimmed = rawLink.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("/")) {
    const base = PUBLIC_SITE_URL.replace(/\/+$/, "");
    return `${base}${trimmed}`;
  }

  // Chỉ chấp nhận link http:// hoặc https:// hợp lệ
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Tính SHA-256 hash của payload để bind chặt chẽ với Idempotency Key
 */
async function computePayloadHash(title: string, message: string, link: string | null | undefined): Promise<string> {
  const normalized = `${title.trim()}\n${message.trim()}\n${link?.trim() || ""}`;
  const data = new TextEncoder().encode(normalized);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

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
      return new Response(JSON.stringify({ success: false, status: "failed", error: "Lỗi: Không tìm thấy Token xác thực từ trình duyệt" }), {
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
      return new Response(JSON.stringify({ success: false, status: "failed", error: "Chưa đăng nhập hoặc Token hết hạn" }), {
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
      return new Response(JSON.stringify({ success: false, status: "failed", error: "Không có quyền gửi Newsletter" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // 3. Lấy nội dung thông báo và idempotencyKey
    const { title, message, link, idempotencyKey } = await req.json();
    if (!title || !message) {
      return new Response(JSON.stringify({ success: false, status: "failed", error: "Thiếu tiêu đề hoặc nội dung" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const cleanTitle = title.trim();
    const cleanMessage = message.trim();
    const cleanLink = link?.trim() || null;
    const cleanIdempotencyKey = idempotencyKey?.trim() || null;

    // Dùng Service Role Key để quản lý jobs, truy xuất subscribers và ghi nhận lịch sử
    const supabaseAdmin = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 4. ATOMIC IDEMPOTENCY CLAIM (Lock nguyên tử & kiểm tra hash nội dung ở database)
    const payloadHash = await computePayloadHash(cleanTitle, cleanMessage, cleanLink);

    if (cleanIdempotencyKey) {
      const { data: claimData, error: claimError } = await supabaseAdmin.rpc("claim_newsletter_send_job", {
        p_idempotency_key: cleanIdempotencyKey,
        p_payload_hash: payloadHash,
        p_title: cleanTitle,
        p_message: cleanMessage,
        p_link: cleanLink,
        p_created_by: userData.username || "Hệ thống"
      });

      if (claimError) {
        console.error("Lỗi khi claim newsletter job:", claimError);
        return new Response(JSON.stringify({ success: false, status: "failed", error: `Lỗi máy chủ: ${claimError.message}` }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      if (claimData) {
        // Trường hợp 1: Replay kết quả trước đó
        if (claimData.action === "replay") {
          return new Response(JSON.stringify({
            success: true,
            status: claimData.status,
            requested: claimData.requested,
            accepted: claimData.accepted,
            rejected: claimData.rejected,
            delivered: claimData.accepted, // Tương thích ngược
            failed: claimData.rejected,
            failedBatches: claimData.failed_batches,
            errors: claimData.errors,
            message: claimData.message || "Bản tin đã được xử lý trước đó (Idempotent response)",
            replayed: true
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }

        // Trường hợp 2: Conflict (job đang được xử lý)
        if (claimData.action === "conflict") {
          return new Response(JSON.stringify({
            success: false,
            status: "processing",
            error: claimData.message || "Yêu cầu phát bản tin này đang được máy chủ xử lý. Vui lòng đợi trong giây lát."
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 409,
          });
        }

        // Trường hợp 3: Payload hash mismatch
        if (claimData.action === "payload_mismatch") {
          return new Response(JSON.stringify({
            success: false,
            status: "failed",
            error: claimData.message || "Idempotency key này đã được sử dụng cho một nội dung thông báo khác."
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          });
        }
      }
    }

    // 5. Lấy danh sách email subscribers đang hoạt động
    const { data: subscribers, error: subError } = await supabaseAdmin
      .from("subscribers")
      .select("email")
      .eq("status", "active");

    if (subError) {
      if (cleanIdempotencyKey) {
        await supabaseAdmin.rpc("finalize_newsletter_send_job", {
          p_idempotency_key: cleanIdempotencyKey,
          p_status: "failed",
          p_requested: 0,
          p_accepted: 0,
          p_rejected: 0,
          p_failed_batches: 0,
          p_errors: [subError.message]
        });
      }

      return new Response(JSON.stringify({ success: false, status: "failed", error: `Lỗi truy xuất database: ${subError.message}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    if (!subscribers || subscribers.length === 0) {
      if (cleanIdempotencyKey) {
        await supabaseAdmin.rpc("finalize_newsletter_send_job", {
          p_idempotency_key: cleanIdempotencyKey,
          p_status: "failed",
          p_requested: 0,
          p_accepted: 0,
          p_rejected: 0,
          p_failed_batches: 0,
          p_errors: ["Chưa có người đăng ký nhận email nào đang kích hoạt"]
        });
      }

      return new Response(JSON.stringify({
        success: false,
        status: "empty",
        requested: 0,
        accepted: 0,
        rejected: 0,
        delivered: 0,
        failed: 0,
        error: "Chưa có người đăng ký nhận email nào đang kích hoạt. Không thể gửi bản tin.",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const emailList = subscribers.map((s) => s.email);

    // Chuẩn hóa và escape nội dung
    const safeTitle = escapeHtml(cleanTitle);
    const formattedMessage = formatMessage(cleanMessage);
    const absoluteLink = resolveAbsoluteLink(cleanLink);

    // 6. CHIA NHỎ DANH SÁCH & GỬI EMAIL (BCC BẢO MẬT 100% — KHÔNG LỘ EMAIL SUB TRONG TO)
    const emailChunks = chunkArray(emailList, 50);

    // Đặt địa chỉ To là địa chỉ hệ thống để mọi subscriber chỉ nằm trong BCC
    const systemToAddress = RESEND_ADMIN_COPY_EMAIL || RESEND_FROM_EMAIL;

    const sendPromises = emailChunks.map((chunk) => {
      return fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: RESEND_FROM_EMAIL,
          to: [systemToAddress],
          bcc: chunk,
          subject: `[Ban Giáo Lý] ${cleanTitle}`,
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
                ${safeTitle}
              </h2>

              <div style="color: #44403c; font-size: 16px; line-height: 1.8;">
                ${formattedMessage}
              </div>

              <!-- Nút đính kèm URL tuyệt đối -->
              ${absoluteLink ? `
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 40px;">
                <tr>
                  <td align="left">
                    <a href="${escapeHtml(absoluteLink)}" style="display: inline-block; background-color: #b45309; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 16px 32px; border-radius: 50px; box-shadow: 0 4px 12px rgba(180, 83, 9, 0.25);">
                      Xem Chi Tiết Đính Kèm
                    </a>
                  </td>
                </tr>
              </table>
              ` : ""}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #fafaf9; border-top: 1px solid #f5ede4; padding: 32px;">
              <p style="margin: 0; color: #78716c; font-size: 13px; line-height: 1.6;">
                Bạn nhận được thông báo này vì đã đăng ký nhận bản tin từ hệ thống Ban Giáo Lý.<br>
                © ${new Date().getFullYear()} Xứ Đoàn Hùng Tâm Dũng Chí - Giáo Xứ An Ngãi.
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

    // 7. DÙNG Promise.allSettled ĐỂ KHÔNG BỊ MẤT DẤU TRẠNG THÁI KHI CÓ LÔ LỖI MẠNG
    const settledResults = await Promise.allSettled(sendPromises);

    let acceptedCount = 0;
    let rejectedCount = 0;
    let failedBatches = 0;
    const batchErrors: string[] = [];

    for (let i = 0; i < settledResults.length; i++) {
      const resultItem = settledResults[i];
      const chunk = emailChunks[i];

      if (resultItem.status === "fulfilled") {
        const res = resultItem.value;
        if (res.ok) {
          acceptedCount += chunk.length;
        } else {
          rejectedCount += chunk.length;
          failedBatches++;
          try {
            const errData = await res.text();
            console.error(`Batch ${i + 1} lỗi Resend HTTP:`, errData);
            batchErrors.push(`Lô ${i + 1}: ${errData.slice(0, 120)}`);
          } catch {
            batchErrors.push(`Lô ${i + 1} thất bại (HTTP error)`);
          }
        }
      } else {
        rejectedCount += chunk.length;
        failedBatches++;
        console.error(`Batch ${i + 1} lỗi mạng/fetch:`, resultItem.reason);
        batchErrors.push(`Lô ${i + 1} lỗi kết nối: ${String(resultItem.reason).slice(0, 120)}`);
      }
    }

    let finalStatus: "success" | "partial" | "failed" = "success";
    if (acceptedCount === 0 && emailList.length > 0) {
      finalStatus = "failed";
    } else if (rejectedCount > 0) {
      finalStatus = "partial";
    }

    // 8. CẬP NHẬT JOB RECORD & GHI NHẬN LỊCH SỬ NGUYÊN TỬ TRÊN SERVER
    if (cleanIdempotencyKey) {
      await supabaseAdmin.rpc("finalize_newsletter_send_job", {
        p_idempotency_key: cleanIdempotencyKey,
        p_status: finalStatus,
        p_requested: emailList.length,
        p_accepted: acceptedCount,
        p_rejected: rejectedCount,
        p_failed_batches: failedBatches,
        p_errors: batchErrors.length > 0 ? batchErrors : null,
      });
    } else if (acceptedCount > 0) {
      // Trường hợp không có idempotency key (direct call)
      await supabaseAdmin.from("newsletters").insert({
        title: cleanTitle,
        message: cleanMessage,
        link: absoluteLink || null,
        created_by: userData.username || "Hệ thống",
      });
      await supabaseAdmin.from("notifications").insert({
        type: "email",
        title: cleanTitle,
        message: cleanMessage,
        link: absoluteLink || null,
        created_by: userData.username || "Hệ thống",
      });
    }

    const responsePayload = {
      success: finalStatus !== "failed",
      status: finalStatus,
      requested: emailList.length,
      accepted: acceptedCount,
      rejected: rejectedCount,
      delivered: acceptedCount, // Tương thích ngược
      failed: rejectedCount,
      failedBatches,
      errors: batchErrors.length > 0 ? batchErrors : undefined,
    };

    return new Response(JSON.stringify(responsePayload), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: finalStatus === "failed" ? 502 : 200,
    });

  } catch (error: any) {
    console.error("Lỗi nội bộ Edge Function:", error);
    return new Response(JSON.stringify({ success: false, status: "failed", error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
