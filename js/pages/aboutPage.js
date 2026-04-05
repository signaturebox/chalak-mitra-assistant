// About NWR Chalak Mitra Page
const AboutPage = {
  render(container) {
    if (!container) return;

    container.innerHTML = `
      <style>
        .about-page {
          --primary-blue: #003399;
          --rail-orange: #f39c12;
          --white: #ffffff;
          --light-gray: #f4f7f6;
          --dark-blue: #002266;
          --text-dark: #2c3e50;
          font-family: 'Hind', 'Poppins', sans-serif;
          color: var(--text-dark);
          line-height: 1.6;
          text-align: center;
        }

        .about-page .hero {
          background: linear-gradient(rgba(0, 51, 153, 0.85), rgba(0, 34, 102, 0.9)), 
                      url('https://images.unsplash.com/photo-1590674116010-333db9f79183?auto=format&fit=crop&q=80&w=1200');
          background-size: cover;
          background-position: center;
          color: white;
          padding: 60px 20px;
          border-radius: 0 0 20px 20px;
          margin: -20px -20px 0 -20px;
        }

        .about-page .hero h1 {
          font-size: 2.2rem;
          margin-bottom: 10px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .about-page .hero p {
          font-size: 1.1rem;
          max-width: 800px;
          margin: 0 auto;
          opacity: 0.9;
        }

        .about-page .container {
          max-width: 1000px;
          margin: -30px auto 40px;
          padding: 0 20px;
        }

        .about-page .content-card {
          background: var(--white);
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          margin-bottom: 30px;
        }

        .about-page .section-title {
          color: var(--primary-blue);
          font-size: 1.8rem;
          margin-bottom: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          font-weight: 700;
        }

        .about-page .about-content p {
          font-size: 1rem;
          margin-bottom: 15px;
          text-align: center;
        }

        .about-page .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 15px;
          margin: 30px 0;
        }

        .about-page .f-card {
          padding: 20px;
          border: 1px solid #eee;
          border-radius: 12px;
          transition: 0.3s;
          background: #fafafa;
        }

        .about-page .f-card:hover {
          transform: translateY(-3px);
          border-color: var(--primary-blue);
          box-shadow: 0 5px 15px rgba(0,0,0,0.08);
        }

        .about-page .f-card i {
          font-size: 2rem;
          color: var(--rail-orange);
          margin-bottom: 12px;
        }

        .about-page .f-card h3 {
          font-size: 1.1rem;
          color: var(--dark-blue);
          margin-bottom: 8px;
        }

        .about-page .f-card p {
          font-size: 0.9rem;
          color: #666;
        }

        .about-page .category-group {
          margin-bottom: 35px;
        }

        .about-page .category-title {
          background: var(--primary-blue);
          color: white;
          display: inline-block;
          padding: 6px 25px;
          border-radius: 50px;
          font-size: 0.9rem;
          letter-spacing: 1px;
          margin-bottom: 20px;
          text-transform: uppercase;
        }

        .about-page .members-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 15px;
        }

        .about-page .member-card {
          background: #fff;
          padding: 20px;
          border: 1px solid #eee;
          border-radius: 12px;
          border-top: 4px solid var(--rail-orange);
          transition: 0.3s;
          width: 260px;
        }

        .about-page .member-card:hover {
          box-shadow: 0 8px 20px rgba(0,0,0,0.08);
        }

        .about-page .m-name {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--dark-blue);
        }

        .about-page .m-rank {
          font-size: 0.9rem;
          color: #666;
          font-weight: 500;
        }

        .about-page .prepared-box {
          background: #eef3ff;
          border: 2px dashed var(--primary-blue);
          padding: 30px;
          border-radius: 15px;
          margin-top: 15px;
        }

        .about-page .prepared-box h3 {
          color: var(--primary-blue);
          margin-bottom: 12px;
          font-size: 1.3rem;
        }

        .about-page .footer-section {
          background: #1a1a1a;
          color: #d1d1d1;
          padding: 40px 20px 25px;
          margin: 0 -20px -20px -20px;
          border-radius: 20px 20px 0 0;
        }

        .about-page .footer-link {
          color: var(--rail-orange);
          text-decoration: none;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .about-page .hero { padding: 40px 15px; }
          .about-page .hero h1 { font-size: 1.6rem; }
          .about-page .content-card { padding: 20px; }
          .about-page .member-card { width: 100%; max-width: 300px; }
          .about-page .section-title { font-size: 1.4rem; }
        }
      </style>

      <div class="about-page">
        <section class="hero">
          <h1>सुरक्षित और कुशल रेल परिचालन</h1>
          <p>लोको पायलट और सहायक लोको पायलटों के लिए एक समर्पित डिजिटल पोर्टल</p>
        </section>

        <div class="container">
          <div class="content-card">
            <h2 class="section-title"><i class="fas fa-info-circle"></i> पोर्टल के बारे में</h2>
            <div class="about-content">
              <p>
                <strong>"NWR चालक मित्र"</strong> उत्तर पश्चिम रेलवे (NWR) के चालक दल के सदस्यों के लिए तैयार किया गया एक अत्याधुनिक प्लेटफॉर्म है। इसका मुख्य उद्देश्य लोको पायलटों को उनके कार्यों से संबंधित महत्वपूर्ण जानकारी, नियम-पुस्तिकाएं और सुरक्षा निर्देश एक ही स्थान पर उपलब्ध कराना है।
              </p>
            </div>

            <div class="features-grid">
              <div class="f-card">
                <i class="fas fa-book"></i>
                <h3>नियम और सर्कुलर</h3>
                <p>नवीनतम G&SR नियम और HQ निर्देशों का संकलन।</p>
              </div>
              <div class="f-card">
                <i class="fas fa-hard-hat"></i>
                <h3>सुरक्षा अभियान</h3>
                <p>विशेष सुरक्षा ड्राइव और रेड नोटिस की जानकारी।</p>
              </div>
              <div class="f-card">
                <i class="fas fa-mobile-alt"></i>
                <h3>त्वरित एक्सेस</h3>
                <p>EBD और लोड टेबल अब आपकी जेब में।</p>
              </div>
            </div>
          </div>

          <div class="content-card">
            <h2 class="section-title"><i class="fas fa-users"></i> मार्गदर्शन एवं नेतृत्व</h2>
            
            <div class="category-group">
              <div class="category-title">INSPIRATION (प्रेरणा)</div>
              <div class="members-grid">
                <div class="member-card">
                  <div class="m-name">Sh. AMITABH</div>
                  <div class="m-rank">GM / North Western Railway</div>
                </div>
                <div class="member-card">
                  <div class="m-name">Sh. SANJAY KR GUPTA</div>
                  <div class="m-rank">PCEE / NWR</div>
                </div>
              </div>
            </div>

            <div class="category-group">
              <div class="category-title">MOTIVATION (प्रोत्साहन)</div>
              <div class="members-grid">
                <div class="member-card">
                  <div class="m-name">Sh. ASHISH KUMAR</div>
                  <div class="m-rank">DRM (Bikaner)</div>
                </div>
                <div class="member-card">
                  <div class="m-name">Sh. RUPESH KUMAR</div>
                  <div class="m-rank">ADRM (Bikaner)</div>
                </div>
                <div class="member-card">
                  <div class="m-name">Sh. VIJENDRA KR MEENA</div>
                  <div class="m-rank">DME (EnHM & P), Bikaner</div>
                </div>
              </div>
            </div>

            <div class="category-group">
              <div class="members-grid">
                <div>
                  <div class="category-title">GUIDANCE</div>
                  <div class="member-card">
                    <div class="m-name">Sh. STEYNDRA KUMAR</div>
                    <div class="m-rank">CLI / HMH</div>
                  </div>
                </div>
                <div>
                  <div class="category-title">SUPPORT</div>
                  <div class="member-card">
                    <div class="m-name">Sh. DAYARAM GURJAR</div>
                    <div class="m-rank">CLI / STAFF / BKN</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="prepared-box">
              <i class="fas fa-user-gear" style="font-size: 2rem; color: var(--primary-blue); margin-bottom: 12px;"></i>
              <h3>PREPARED BY (प्रस्तुतकर्ता)</h3>
              <div class="m-name" style="font-size: 1.4rem; margin-top: 10px;">Pradeep Kr Meena</div>
              <div class="m-rank" style="color: var(--primary-blue); font-weight: bold; font-size: 1rem; margin-top: 5px;">Senior Assistant Loco Pilot (Sr.ALP) / HMH</div>
              <p style="margin-top: 8px; color: #666; font-size: 0.9rem;">बीकानेर मंडल, उत्तर पश्चिम रेलवे</p>
            </div>
          </div>
        </div>

        <div class="footer-section">
          <div style="text-align: center;">
            <h3 style="margin-bottom: 8px;">उत्तर पश्चिम रेलवे चालक मित्र</h3>
            <p style="margin-bottom: 10px;">भारतीय रेल - आपकी सेवा में समर्पित</p>
            <p style="margin: 10px 0;">
              <a href="https://nwrchalak.ritutechno.com/" class="footer-link">आधिकारिक वेबसाइट पर जाएं</a>
            </p>
          </div>
          <div style="border-top: 1px solid #333; padding-top: 15px; margin-top: 20px; font-size: 0.85rem; text-align: center;">
            &copy; 2026 NWR Chalak Mitra | विकसित: रितु टेक्नो सॉल्यूशंस द्वारा।
          </div>
        </div>
      </div>
    `;

    // Scroll to top of everything
    const contentScroll = document.querySelector('.content-scroll');
    if (contentScroll) contentScroll.scrollTop = 0;
    window.scrollTo(0, 0);
  }
};
