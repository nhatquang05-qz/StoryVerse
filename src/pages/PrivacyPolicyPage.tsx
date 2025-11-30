import '../assets/styles/LegalPage.css';

const PrivacyPolicyPage = () => {
  return (
    <div className="legal-page-container">
      <div className="legal-wrapper">
        <div className="legal-header">
          <h1 className="legal-title">Chính Sách Bảo Mật</h1>
          <p className="legal-last-updated">Cập nhật lần cuối: 01/12/2025</p>
        </div>

        <div className="legal-content">
          <section>
            <h2>1. Giới thiệu</h2>
            <p>
              Chào mừng bạn đến với StoryVerse. Chúng tôi tôn trọng quyền riêng tư của bạn và cam kết bảo vệ thông tin cá nhân của bạn. Chính sách bảo mật này sẽ thông báo cho bạn về cách chúng tôi quản lý dữ liệu cá nhân khi bạn truy cập trang web của chúng tôi và về quyền riêng tư của bạn cũng như cách luật pháp bảo vệ bạn.
            </p>
          </section>

          <section>
            <h2>2. Thông tin chúng tôi thu thập</h2>
            <p>Chúng tôi có thể thu thập, sử dụng, lưu trữ và chuyển giao các loại dữ liệu cá nhân khác nhau về bạn, bao gồm:</p>
            <ul>
              <li><strong>Dữ liệu danh tính:</strong> bao gồm tên, tên người dùng hoặc mã định danh tương tự.</li>
              <li><strong>Dữ liệu liên hệ:</strong> bao gồm địa chỉ email và số điện thoại.</li>
              <li><strong>Dữ liệu kỹ thuật:</strong> bao gồm địa chỉ IP, thông tin đăng nhập, loại và phiên bản trình duyệt, cài đặt múi giờ và vị trí.</li>
              <li><strong>Dữ liệu sử dụng:</strong> bao gồm thông tin về cách bạn sử dụng trang web, sản phẩm và dịch vụ của chúng tôi (lịch sử đọc truyện, tương tác).</li>
            </ul>
          </section>

          <section>
            <h2>3. Cách chúng tôi sử dụng thông tin của bạn</h2>
            <p>Chúng tôi sẽ chỉ sử dụng dữ liệu cá nhân của bạn khi luật pháp cho phép. Phổ biến nhất, chúng tôi sẽ sử dụng dữ liệu cá nhân của bạn trong các trường hợp sau:</p>
            <ul>
              <li>Để đăng ký bạn là khách hàng mới.</li>
              <li>Để xử lý và giao đơn hàng của bạn bao gồm: Quản lý thanh toán, phí và lệ phí.</li>
              <li>Để quản lý mối quan hệ của chúng tôi với bạn.</li>
              <li>Để cải thiện trang web, sản phẩm/dịch vụ, tiếp thị, quan hệ khách hàng và trải nghiệm của bạn.</li>
            </ul>
          </section>

          <section>
            <h2>4. Bảo mật dữ liệu</h2>
            <p>
              Chúng tôi đã đưa ra các biện pháp bảo mật thích hợp để ngăn chặn dữ liệu cá nhân của bạn vô tình bị mất, bị sử dụng hoặc truy cập trái phép, bị thay đổi hoặc tiết lộ. Ngoài ra, chúng tôi giới hạn quyền truy cập vào dữ liệu cá nhân của bạn đối với những nhân viên, đại lý, nhà thầu và các bên thứ ba khác có nhu cầu kinh doanh cần biết.
            </p>
          </section>

          <section>
            <h2>5. Quyền của bạn</h2>
            <p>
              Theo luật bảo vệ dữ liệu, bạn có các quyền liên quan đến dữ liệu cá nhân của mình, bao gồm quyền yêu cầu truy cập, chỉnh sửa, xóa, hạn chế, chuyển giao, phản đối việc xử lý và quyền rút lại sự đồng ý.
            </p>
            <p>
              Nếu bạn muốn thực hiện bất kỳ quyền nào trong số những quyền này, vui lòng liên hệ với chúng tôi qua trang <a href="/contact">Liên hệ</a>.
            </p>
          </section>

          <section>
            <h2>6. Cookie</h2>
            <p>
              Trang web của chúng tôi sử dụng cookie để phân biệt bạn với những người dùng khác trên trang web của chúng tôi. Điều này giúp chúng tôi cung cấp cho bạn trải nghiệm tốt khi bạn duyệt trang web của chúng tôi và cũng cho phép chúng tôi cải thiện trang web của mình.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;