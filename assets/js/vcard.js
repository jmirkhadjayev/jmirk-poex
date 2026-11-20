// Save My Contact — builds a vCard (.vcf) download + QR code (scan to save).
(function () {
  // vCard 3.0 — lines must be CRLF-separated per spec
  var VCARD = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'N:Mirkhadjayev;Jamshid;;;',
    'FN:Jamshid Mirkhadjayev',
    'TITLE:IT Project Manager',
    'EMAIL;TYPE=HOME:jmirkhadjayev@gmail.com',
    'TEL;TYPE=CELL,VOICE:+998909984979',
    'URL:https://www.mirkhadjayev.uz',
    'ADR;TYPE=WORK:;;Shaykhontohur District;Tashkent;;100027;Uzbekistan',
    'END:VCARD'
  ].join('\r\n');

  // One-tap download
  var btn = document.getElementById('saveVcardBtn');
  if (btn) {
    btn.addEventListener('click', function () {
      var blob = new Blob([VCARD], { type: 'text/vcard;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'Jamshid_Mirkhadjayev.vcf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    });
  }

  // QR code (scan → save contact). Gracefully skips if the library failed to load.
  var qr = document.getElementById('vcardQr');
  if (qr && typeof QRCode !== 'undefined') {
    try {
      new QRCode(qr, {
        text: VCARD,
        width: 124,
        height: 124,
        colorDark: '#15181d',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });
      // Give the generated <img> explicit dimensions (avoids layout shift / Lighthouse "unsized-images")
      var qrImg = qr.querySelector('img');
      if (qrImg) { qrImg.width = 124; qrImg.height = 124; qrImg.alt = 'QR code — save my contact'; }
    } catch (e) { /* no-op: button still works */ }
  }
})();
