import "./Footer.css"

function Footer() {
  return (
    <footer className="footer mt-5 py-4">
      <div className="container">
        <div className="row justify-content-between">
          {/* 로고 섹션 */}
          <div className="col-lg-4 mb-4 mb-lg-0 text-center text-lg-start">
            <div className="logo-container">
              <img
                src={process.env.PUBLIC_URL + "/images/weblogo.png" || "/placeholder.svg"}
                alt="이음길"
                className="footer-logo"
                style={{
                  height: "180px",
                  width: "auto",
                  marginLeft: "20px",
                  marginTop: "15px",
                }}
              />
            </div>
          </div>

          {/* 바로가기 섹션 */}
          <div className="col-lg-3 mb-4 mb-lg-0">
            <h5 className="footer-subtitle">바로가기</h5>
            <ul className="footer-links">
              <li>
                <a href="/places">
                  <i className="bi bi-geo-alt me-2"></i>장소
                </a>
              </li>
              <li>
                <a href="/map">
                  <i className="bi bi-map me-2"></i> 지도
                </a>
              </li>
              <li>
                <a href="/community">
                  <i className="bi bi-people me-2"></i>커뮤니티
                </a>
              </li>
              <li>
                <a href="/mypage">
                  <i className="bi bi-person-circle me-2"></i>마이페이지
                </a>
              </li>
            </ul>
          </div>

          {/* 문의하기 섹션 */}
          <div className="col-lg-3 mb-4 mb-lg-0">
            <h5 className="footer-subtitle">문의하기</h5>
            <ul className="footer-contact">
              <li>
                <i className="bi bi-envelope me-2"></i>petplaces@example.com
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

        {/* 하단 저작권 및 링크 */}
        <div className="footer-bottom mt-4 pt-3">
          <div className="row">
            <div className="col-md-6 mb-2 mb-md-0">
              <p className="copyright">© 2025 이음길. All rights reserved.</p>
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
