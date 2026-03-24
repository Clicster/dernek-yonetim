export default function Home() {
  return (
    <div className="space-y-10">
      {/* Başlık */}
      <div>
        <h1 className="text-3xl font-bold text-white">TPD İstatistik</h1>
        <p className="text-gray-400 mt-1">Habbo Türkiye topluluk istatistik platformu</p>
      </div>

      {/* Hakkımızda */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
        <h2 className="text-xl font-semibold text-white mb-4">Hakkımızda</h2>
        <p className="text-gray-300 leading-relaxed text-base">
          TPD İstatistik Yönetim Ekibinin düzenlediği web sitesine hoşgeldiniz.
        </p>
      </div>
    </div>
  );
}
