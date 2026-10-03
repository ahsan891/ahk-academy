'use strict';
const L = require('../layout');

module.exports = {
  path: 'gizlilik/',
  lang: 'tr',
  title: 'Gizlilik ve KVKK Aydınlatma Metni | AHK Akademi',
  description: 'AHK Akademi ücretsiz araçlar ve formlar için KVKK Aydınlatma Metni, açık rıza metni, ticari elektronik ileti onayı ve çerez bilgisi.',
  scripts: [],
  jsonld: [L.breadcrumbLd([['Ücretsiz Araçlar', ''], ['Gizlilik ve KVKK', 'gizlilik/']])],
  body: ({ root }) => `
<section class="hero" style="padding-bottom:40px"><div class="container"><div class="crumbs"><a href="${root}">Ücretsiz Araçlar</a><span>›</span>Gizlilik ve KVKK</div><span class="eyebrow"><i class="star"></i> HUKUKİ</span><h1 style="font-size:clamp(1.6rem,4vw,2.6rem)">Kişisel Verilerin Korunması — Aydınlatma Metni</h1><p class="lead">6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında, bu sitedeki ücretsiz araçlar ve formlar aracılığıyla toplanan kişisel verilerinize ilişkin bilgilendirme.</p></div></section>
<section class="section"><div class="container narrow prose">
  <p class="notice"><b>Taslak — hukuki inceleme gerekir.</b> Bu metin bir şablondur; yayınlanmadan önce veri sorumlusunun unvanı, adresi, VERBİS kayıt durumu, veri işleyen hizmet sağlayıcıları (e-posta/CRM/WhatsApp araçları) ve saklama süreleri bir avukat tarafından doğrulanmalıdır. Köşeli parantezli alanlar doldurulmalıdır.</p>

  <h2>1. Veri sorumlusu</h2>
  <p>AHK Akademi [tam ticari unvan], [adres], [e-posta], [telefon] ("Akademi"), KVKK uyarınca veri sorumlusu sıfatıyla hareket eder.</p>

  <h2>2. Hangi verileri, hangi amaçla işliyoruz?</h2>
  <div class="table-wrap"><table class="t"><thead><tr><th>Veri</th><th>Nereden</th><th>Amaç</th><th>Hukuki sebep (KVKK m.5)</th></tr></thead><tbody>
    <tr><td>Ad</td><td>Form</td><td>Size hitap etmek, talebinizi eşleştirmek</td><td>Açık rıza (m.5/1)</td></tr>
    <tr><td>E-posta adresi ve/veya telefon (WhatsApp) numarası</td><td>Form</td><td>Talep ettiğiniz sonucu, PDF'i veya 7 günlük kurs içeriklerini iletmek; dersler hakkında sizinle iletişime geçmek</td><td>Açık rıza (m.5/1)</td></tr>
    <tr><td>İlgilendiğiniz dil, hedefiniz, test/hesaplayıcı sonucunuz</td><td>Form ve araç kullanımı</td><td>Size uygun içerik ve ders önerisi hazırlamak</td><td>Açık rıza (m.5/1)</td></tr>
    <tr><td>Ticari elektronik ileti tercihiniz</td><td>İsteğe bağlı onay kutusu</td><td>Kampanya, yeni kaynak ve ders duyuruları göndermek (6563 sayılı Kanun ve İYS kapsamında)</td><td>Açık rıza (m.5/1); onay İYS'ye kaydedilir</td></tr>
    <tr><td>Formun gönderildiği sayfa, tarih-saat, tarayıcı bilgisi</td><td>Otomatik</td><td>Onayın ispatı, güvenlik ve hata ayıklama</td><td>Meşru menfaat (m.5/2-f)</td></tr>
  </tbody></table></div>
  <p>Test ve hesaplayıcı sonuçlarınız, formu göndermediğiniz sürece yalnızca tarayıcınızda görüntülenir; sunucuya iletilmez.</p>

  <h2>3. Verilerin aktarılması</h2>
  <p>Verileriniz; talebinizi yerine getirmek için kullandığımız e-posta gönderim, form/CRM ve mesajlaşma hizmet sağlayıcılarına [sağlayıcı adları ve ülke] ve yasal zorunluluk hâlinde yetkili kurumlara aktarılabilir. Yurt dışına aktarım yapılıyorsa KVKK m.9'daki şartlar uygulanır.</p>

  <h2>4. Saklama süresi</h2>
  <p>Form verileri, talebinizin karşılanmasından itibaren [12 ay] süreyle; ticari elektronik ileti onayı, onayı geri alana kadar; onayın ispatına ilişkin kayıtlar mevzuat gereği [3 yıl] saklanır ve sonrasında silinir veya anonim hâle getirilir.</p>

  <h2>5. Haklarınız (KVKK m.11)</h2>
  <ul><li>Kişisel verilerinizin işlenip işlenmediğini öğrenme ve bilgi talep etme,</li><li>İşlenme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme,</li><li>Aktarıldığı üçüncü kişileri bilme,</li><li>Eksik/yanlış işlenmişse düzeltilmesini, şartları oluşmuşsa silinmesini veya yok edilmesini isteme,</li><li>Otomatik sistemlerle analiz sonucu aleyhinize bir sonuç çıkmasına itiraz etme,</li><li>Kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde tazminat talep etme.</li></ul>
  <p>Başvurularınızı [e-posta adresi] adresine veya [posta adresi]'ne, Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında Tebliğ'e uygun şekilde iletebilirsiniz. Başvurular en geç 30 gün içinde yanıtlanır.</p>

  <h2>6. Ticari elektronik ileti onayı ve vazgeçme</h2>
  <p>Kampanya ve duyuru mesajları yalnızca formdaki isteğe bağlı kutuyu işaretlemeniz hâlinde gönderilir. Onayınız İleti Yönetim Sistemi'ne (İYS) kaydedilir; iys.org.tr üzerinden, her iletideki vazgeçme bağlantısıyla veya bize yazarak dilediğiniz zaman ücretsiz olarak geri alabilirsiniz. Talep ettiğiniz sonucun/PDF'in iletilmesi gibi bilgilendirme mesajları ticari ileti sayılmaz.</p>

  <h2>7. Çerezler ve yerel depolama</h2>
  <p>Bu site üçüncü taraf reklam çerezi kullanmaz. Tarayıcınızın yerel depolama alanı yalnızca form gönderim durumunu hatırlamak için kullanılır. [Google Analytics gibi bir ölçüm aracı etkinleştirilirse bu bölüm güncellenmeli ve çerez onayı eklenmelidir.]</p>

  <h2>8. Açık rıza metni (formda gösterilir)</h2>
  <p class="notice">"Aydınlatma Metni'ni okudum; adımın, e-postamın ve/veya telefon numaramın istediğim sonucu/kaynağı bana iletmek ve dersler hakkında benimle iletişime geçmek amacıyla AHK Akademi tarafından işlenmesine açık rıza veriyorum."</p>
  <p class="muted">Son güncelleme: ${L.cfg.buildDate}</p>
</div></section>`
};
