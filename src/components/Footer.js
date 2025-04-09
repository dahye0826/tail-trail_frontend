import "./Footer.css"

function Footer() {
  return (
    <footer className="footer mt-5 py-4">
      <div className="container">
        <div className="row">
          <div className="col-lg-5 mb-4 mb-lg-0">
            <h5 className="footer-title">
              <img
                src={process.env.PUBLIC_URL + "/images/logo.png" || "/placeholder.svg"}
                alt="이음길"
                className="footer-logo me-2"
                style={{ height: "35px", width: "auto", display: "inline-block" }}
              />
              이음길
            </h5>
            <p className="footer-description mt-3">
              반려동물과의 시간은 매 순간이 특별합니다. 함께한 눈빛, 산책길, 여행의 추억을 이곳에 담아보세요. 이
              페이지는 당신과 반려동물이 나눈 소중한 순간들을 함께 기억하고, 더 많이 나눌 수 있는 공간입니다.
            </p>
          </div>

          <div className="col-lg-3 mb-4 mb-lg-0">
            <h5 className="footer-subtitle">바로가기</h5>
            <ul className="footer-links">
              <li>
                <a href="/places">
                  <i className="bi bi-map me-2"></i>장소
                </a>
              </li>
              <li>
                <a href="/community">
                  <i className="bi bi-people me-2"></i>커뮤니티
                </a>
              </li>
              <li>
                <a href="/map">
                  <i className="bi bi-geo-alt me-2"></i>지도로 보기
                </a>
              </li>
              <li>
                <a href="/mypage">
                  <i className="bi bi-person-circle me-2"></i>마이페이지
                </a>
              </li>
            </ul>
          </div>

          <div className="col-lg-4 mb-4 mb-lg-0">
            <h5 className="footer-subtitle">문의하기</h5>
            <ul className="footer-contact">
              <li>
                <i className="bi bi-envelope me-2"></i>ieumgil@example.com
              </li>
              <li>
                <i className="bi bi-telephone me-2"></i>02-123-4567
              </li>
              <li>
                <i className="bi bi-geo-alt me-2"></i>서울시 강남구 테헤란로 123
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom mt-4 pt-3">
          <div className="row">
            <div className="col-md-6 mb-2 mb-md-0">
              <p className="copyright">© 2023 이음길. All rights reserved.</p>
            </div>
            <div className="col-md-6 text-md-end">
              <a href="/terms" className="footer-bottom-link me-3">
                이용약관
              </a>
              <a href="/privacy" className="footer-bottom-link">
                개인정보처리방침
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
