// Certificate Generation Service
const CertificateService = {
  // Generate certificate PDF
  async generateCertificate(data) {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
      showNotification('❌ PDF library not loaded. Please refresh the page.', 'error');
      console.error('jsPDF not available');
      return;
    }

    try {
      // Create PDF in Portrait mode
      const doc = new jsPDF({
        unit: 'pt',
        format: 'a4',
        orientation: 'portrait'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;
      const contentWidth = pageWidth - (margin * 2);

      // Helper to load image as Data URL
      const loadImage = (src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'Anonymous';
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
          };
          img.onerror = (e) => {
            console.warn('Failed to load image:', src, e);
            resolve(null); // Resolve with null to continue without image
          };
          img.src = src;
        });
      };

      // Helper to render text as image (for Hindi support)
      const renderTextToImage = (text, options = {}) => {
        return new Promise((resolve) => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Set font to measure
          const fontSize = options.fontSize || 16;
          const fontFace = options.fontFace || 'Arial, sans-serif';
          ctx.font = `${options.fontWeight || 'normal'} ${fontSize}px ${fontFace}`;

          const textMetrics = ctx.measureText(text);
          canvas.width = textMetrics.width + 10; // Add padding
          canvas.height = fontSize * 1.5;

          // Re-set font after resize
          ctx.font = `${options.fontWeight || 'normal'} ${fontSize}px ${fontFace}`;
          ctx.fillStyle = options.color || '#000000';
          ctx.textBaseline = 'middle';
          ctx.textAlign = 'center';

          // Draw text
          ctx.fillText(text, canvas.width / 2, canvas.height / 2);

          resolve({
            dataUrl: canvas.toDataURL('image/png'),
            width: canvas.width,
            height: canvas.height
          });
        });
      };

      // Helper for centering text
      const centerText = (text, y, options = {}) => {
        doc.setFont(options.font || 'helvetica', options.style || 'normal');
        doc.setFontSize(options.size || 12);
        doc.setTextColor(options.color ? options.color[0] : 0, options.color ? options.color[1] : 0, options.color ? options.color[2] : 0);
        doc.text(text, pageWidth / 2, y, { align: 'center', maxWidth: options.maxWidth || contentWidth - 40 });
      };

      // --- Background & Border ---
      // White background
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      // Golden Border (Outer)
      doc.setDrawColor(212, 175, 55); // Gold color
      doc.setLineWidth(20);
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20, 'S');

      // Thin inner border
      doc.setLineWidth(2);
      doc.rect(25, 25, pageWidth - 50, pageHeight - 50, 'S');

      let currentY = 80;

      // --- Header Images ---

      // Load Images
      const flagPromise = loadImage('assets/images/indian-flag.png');
      const irLogoPromise = loadImage('assets/images/IR-LOGO.png');
      const emblemPromise = loadImage('assets/images/Emblem_of_India.svg');
      const vandeBharatPromise = loadImage('https://static.wixstatic.com/media/db4e60_eeee9d0b122948a580914955dfe79839~mv2.png/v1/fill/w_560,h_374/Vande%20Bharat%20Vision%20w%20DS.png');

      const [flagData, irLogoData, emblemData, vandeBharatData] = await Promise.all([flagPromise, irLogoPromise, emblemPromise, vandeBharatPromise]);

      // Flag (Top Left)
      if (flagData) {
        doc.addImage(flagData, 'PNG', 40, 40, 60, 40);
      } else {
        // Fallback flag drawing
        const flagX = 40; const flagY = 40; const flagW = 60; const flagH = 40;
        doc.setFillColor(255, 153, 51); doc.rect(flagX, flagY, flagW, flagH / 3, 'F');
        doc.setFillColor(255, 255, 255); doc.rect(flagX, flagY + flagH / 3, flagW, flagH / 3, 'F');
        doc.setFillColor(19, 136, 8); doc.rect(flagX, flagY + (2 * flagH) / 3, flagW, flagH / 3, 'F');
      }

      // IR Logo (Top Right)
      if (irLogoData) {
        doc.addImage(irLogoData, 'PNG', pageWidth - 100, 40, 60, 60);
      }

      // Center Watermark (IR Logo)
      if (irLogoData) {
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: 0.1 }));
        doc.addImage(irLogoData, 'PNG', (pageWidth - 300) / 2, (pageHeight - 300) / 2, 300, 300);
        doc.restoreGraphicsState();
      }

      // Bottom Right Watermark (Vande Bharat)
      if (vandeBharatData) {
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: 0.15 }));
        // Position it bottom right, above footer
        const vbWidth = 200;
        const vbHeight = 133; // Maintain aspect ratio 560x374
        doc.addImage(vandeBharatData, 'PNG', pageWidth - vbWidth - 40, pageHeight - vbHeight - 40, vbWidth, vbHeight);
        doc.restoreGraphicsState();
      }

      // Header Text
      centerText('CERTIFICATE OF APPRECIATION', currentY, { size: 20, font: 'times', style: 'bold', color: [0, 0, 0] });
      currentY += 25;
      centerText('Indian Railway – Safety Awareness Quiz', currentY, { size: 14, font: 'times', color: [50, 50, 50] });
      currentY += 30;

      // Emblem (Center)
      if (emblemData) {
        const emblemW = 50;
        const emblemH = 80; // Approximate aspect ratio
        doc.addImage(emblemData, 'PNG', (pageWidth - emblemW) / 2, currentY, emblemW, emblemH);
        currentY += 90;
      } else {
        currentY += 60; // Space placeholder
      }

      // Government Text (Hindi & English)

      // Hindi: "भारत सरकार"
      const hindiGovt = await renderTextToImage('भारत सरकार', { fontSize: 20, fontWeight: 'bold' });
      if (hindiGovt) {
        const w = hindiGovt.width * 0.75; // Scale down slightly for PDF points
        const h = hindiGovt.height * 0.75;
        doc.addImage(hindiGovt.dataUrl, 'PNG', (pageWidth - w) / 2, currentY, w, h);
        currentY += h + 5;
      }

      centerText('Government of India', currentY, { size: 14, font: 'times' });
      currentY += 25;

      // Hindi: "रेल मंत्रालय"
      const hindiRail = await renderTextToImage('रेल मंत्रालय', { fontSize: 24, fontWeight: 'bold' });
      if (hindiRail) {
        const w = hindiRail.width * 0.75;
        const h = hindiRail.height * 0.75;
        doc.addImage(hindiRail.dataUrl, 'PNG', (pageWidth - w) / 2, currentY, w, h);
        currentY += h + 5;
      }

      centerText('Ministry of Railways', currentY, { size: 18, font: 'times', style: 'bold' });
      currentY += 20;
      centerText('(Railway Board)', currentY, { size: 12, font: 'times' });
      currentY += 40;

      // --- Recipient Section ---
      centerText('This certificate is presented to', currentY, { size: 12, font: 'helvetica', style: 'italic', color: [80, 80, 80] });
      currentY += 40;

      // Name
      const name = (data.name || 'Unknown Crew').toUpperCase();
      centerText(name, currentY, { size: 28, font: 'helvetica', style: 'bold', color: [0, 0, 0] });
      currentY += 30;

      // Designation / ID
      const designation = data.designation || 'ALP/LPG';
      const cmsId = data.cms || '';
      centerText(`${designation} / ${cmsId}`, currentY, { size: 14, font: 'helvetica', color: [50, 50, 50] });
      currentY += 40;

      // Railway Info
      centerText('NORTH WESTERN RAILWAY', currentY, { size: 16, font: 'times', style: 'bold' });
      currentY += 25;

      const division = (data.division || '').toUpperCase();
      const lobby = (data.lobby || data.hq || '').toUpperCase();
      centerText(`${division} DIVISION | ${lobby} LOBBY`, currentY, { size: 12, font: 'times' });
      currentY += 50;

      // --- Achievement Section ---
      centerText('Your', currentY, { size: 12, font: 'helvetica' });
      currentY += 20;
      centerText(`QUIZ SCORE ${data.score}/${data.total}`, currentY, { size: 18, font: 'helvetica', style: 'bold' });
      currentY += 40;

      const desc1 = "For successfully clearing the CLI Counseling & Quiz";
      const desc2 = "under the NWR Chalak Mitra Digital Competency Framework.";
      centerText(desc1, currentY, { size: 12, font: 'helvetica' });
      currentY += 20;
      centerText(desc2, currentY, { size: 12, font: 'helvetica' });
      currentY += 40;

      const desc3 = "Your participation, enthusiasm and commitment towards Railway safety is";
      const desc4 = "highly appreciated.";
      centerText(desc3, currentY, { size: 12, font: 'helvetica' });
      currentY += 20;
      centerText(desc4, currentY, { size: 12, font: 'helvetica' });

      // --- Footer ---
      const footerY = pageHeight - 100;

      // QR Code (Bottom Left)
      const certId = `NWR-CM-${Date.now().toString().slice(-8)}`;
      const dateStr = formatDate(new Date()); // Using existing helper
      const qrText = `${certId}|${data.cms}|${data.score}/${data.total}|${dateStr}`;

      // Create QR Code
      let qrDiv = document.getElementById('qrTemp');
      if (!qrDiv) {
        qrDiv = document.createElement('div');
        qrDiv.id = 'qrTemp';
        // Must be visible for some QR libraries to render to canvas, so we move it off-screen
        qrDiv.style.position = 'absolute';
        qrDiv.style.left = '-9999px';
        qrDiv.style.top = '0';
        document.body.appendChild(qrDiv);
      }
      qrDiv.innerHTML = '';

      if (typeof QRCode !== 'undefined') {
        new QRCode(qrDiv, {
          text: qrText,
          width: 100,
          height: 100,
          colorDark: '#000000',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.M
        });

        // Wait for QR generation to complete and render
        setTimeout(() => {
          const qrCanvas = qrDiv.querySelector('canvas');
          const qrImg = qrDiv.querySelector('img');

          let qrDataUrl = null;
          if (qrCanvas) {
            qrDataUrl = qrCanvas.toDataURL('image/png');
          } else if (qrImg && qrImg.src && qrImg.src.length > 100) {
            qrDataUrl = qrImg.src;
          }

          if (qrDataUrl) {
            try {
              doc.addImage(qrDataUrl, 'PNG', 60, footerY - 40, 70, 70);
              doc.setFontSize(8);
              doc.setTextColor(0, 0, 0);
              doc.text('SCAN TO VALIDATE', 95, footerY + 40, { align: 'center' });
            } catch (e) {
              console.warn('QR Add Image Error:', e);
            }
          } else {
            console.warn('QR Data URL not found or too short');
          }

          // Cert ID & Date (Center)
          doc.setFontSize(9);
          doc.setTextColor(100, 100, 100);
          doc.text(`Cert ID: ${certId}`, pageWidth / 2, footerY + 10, { align: 'center' });
          doc.text(`Issued: ${dateStr}`, pageWidth / 2, footerY + 22, { align: 'center' });

          // Signature (Right)
          const signX = pageWidth - 80;
          doc.setDrawColor(0, 0, 0);
          doc.line(signX - 60, footerY + 10, signX + 40, footerY + 10);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          doc.text('CLI / Lobby Admin', signX - 10, footerY + 25, { align: 'center' });
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.text('Digital Signature Authorized', signX - 10, footerY + 35, { align: 'center' });

          // Final Output Strategy
          const filename = `${certId}_${data.cms || 'crew'}.pdf`;
          if (window.Android && typeof window.Android.downloadPdf === 'function') {
            const pdfBase64 = doc.output('datauristring');
            window.Android.downloadPdf(pdfBase64, 'certificate.pdf');
            showNotification('✅ Certificate downloading... Check Downloads folder.', 'success');
          } else {
            doc.save(filename);
            showNotification('✅ Certificate generated successfully!', 'success');
          }

          // Cleanup
          qrDiv.innerHTML = '';
        }, 1000);
      } else {
        // Fallback without QR
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`Cert ID: ${certId}`, pageWidth / 2, footerY + 10, { align: 'center' });

        const filename2 = `${certId}_${data.cms || 'crew'}.pdf`;
        if (window.Android && typeof window.Android.downloadPdf === 'function') {
          const pdfBase64 = doc.output('datauristring');
          window.Android.downloadPdf(pdfBase64, 'certificate.pdf');
          showNotification('✅ Certificate downloading... Check Downloads folder.', 'success');
        } else {
          doc.save(filename2);
          showNotification('✅ Certificate generated successfully!', 'success');
        }
      }

    } catch (error) {
      console.error('Certificate generation error:', error);
      showNotification('❌ Failed to generate certificate: ' + error.message, 'error');
    }
  }
};

window.CertificateService = CertificateService;
