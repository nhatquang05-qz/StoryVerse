import '../assets/styles/LegalPage.css';

const TermsOfServicePage = () => {
  return (
    <div className="legal-page-container">
      <div className="legal-wrapper">
        <div className="legal-header">
          <h1 className="legal-title">Điều Khoản Dịch Vụ</h1>
          <p className="legal-last-updated">Cập nhật lần cuối: 01/12/2025</p>
        </div>

        <div className="legal-content">
          <section>
            <h2>1. Chấp nhận các điều khoản</h2>
            <p>
              Bằng cách truy cập và sử dụng trang web StoryVerse, bạn đồng ý tuân thủ và bị ràng buộc bởi các Điều khoản dịch vụ này. Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, bạn không được phép truy cập trang web.
            </p>
          </section>

          <section>
            <h2>2. Tài khoản người dùng</h2>
            <p>
              Để truy cập một số tính năng của trang web, bạn có thể cần phải đăng ký tài khoản. Bạn chịu trách nhiệm duy trì tính bảo mật của tài khoản và mật khẩu của mình, bao gồm nhưng không giới hạn ở việc hạn chế quyền truy cập vào máy tính và/hoặc tài khoản của bạn. Bạn đồng ý chịu trách nhiệm cho mọi hoạt động hoặc hành động xảy ra dưới tài khoản và/hoặc mật khẩu của mình.
            </p>
          </section>

          <section>
            <h2>3. Quyền sở hữu trí tuệ</h2>
            <p>
              Dịch vụ và nội dung gốc của nó, các tính năng và chức năng là và sẽ vẫn là tài sản độc quyền của StoryVerse và các nhà cấp phép của nó. Dịch vụ được bảo vệ bởi bản quyền, thương hiệu và các luật khác của cả Việt Nam và nước ngoài.
            </p>
            <p>
              Nội dung truyện tranh được đăng tải thuộc bản quyền của tác giả hoặc nhà xuất bản tương ứng. StoryVerse chỉ đóng vai trò là nền tảng phân phối.
            </p>
          </section>

          <section>
            <h2>4. Hành vi người dùng</h2>
            <p>Bạn đồng ý không sử dụng Dịch vụ để:</p>
            <ul>
              <li>Đăng tải nội dung vi phạm pháp luật, có hại, đe dọa, lạm dụng, quấy rối, đồi trụy, phỉ báng, xâm phạm quyền riêng tư của người khác.</li>
              <li>Mạo danh bất kỳ cá nhân hoặc tổ chức nào.</li>
              <li>Tham gia vào bất kỳ hoạt động nào gây cản trở hoặc gián đoạn Dịch vụ.</li>
              <li>Sử dụng các bình luận thô tục, xúc phạm trong phần bình luận hoặc chat.</li>
            </ul>
          </section>

          <section>
            <h2>5. Chấm dứt</h2>
            <p>
              Chúng tôi có thể chấm dứt hoặc đình chỉ quyền truy cập của bạn ngay lập tức, mà không cần thông báo trước hoặc chịu trách nhiệm pháp lý, vì bất kỳ lý do gì, bao gồm nhưng không giới hạn ở việc bạn vi phạm các Điều khoản.
            </p>
          </section>

          <section>
            <h2>6. Thay đổi điều khoản</h2>
            <p>
              Chúng tôi bảo lưu quyền, theo quyết định riêng của mình, sửa đổi hoặc thay thế các Điều khoản này bất kỳ lúc nào. Nếu bản sửa đổi là quan trọng, chúng tôi sẽ cố gắng cung cấp thông báo ít nhất 30 ngày trước khi bất kỳ điều khoản mới nào có hiệu lực.
            </p>
          </section>

          <section>
            <h2>7. Liên hệ</h2>
            <p>
              Nếu bạn có bất kỳ câu hỏi nào về các Điều khoản này, vui lòng liên hệ với chúng tôi tại <a href="mailto:support@storyverse.com">support@storyverse.com</a> hoặc qua trang <a href="/contact">Liên hệ</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;