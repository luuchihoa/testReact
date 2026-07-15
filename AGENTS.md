# Quy tắc hoạt động của Agent

## Quy trình thay đổi Code (Code Change Workflow)
1. Đối với bất kỳ yêu cầu thay đổi code phức tạp nào, Agent KHÔNG ĐƯỢC tự ý sửa đổi file trực tiếp ngay lập tức.
2. Agent phải luôn bắt đầu bằng việc tạo ra một Bản kế hoạch triển khai (Implementation Plan) chi tiết dưới dạng một Artifact.
3. Bản kế hoạch phải liệt kê:
   - Các file bị ảnh hưởng.
   - Giải pháp kiến trúc / thay đổi logic.
   - Cách thức chạy kiểm thử (test suite) để xác minh sau khi sửa đổi.
4. Chờ xác nhận "Phê duyệt" (Approve) từ người dùng trước khi chuyển sang bước viết code.