export default function ErisimYokPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <div className="text-6xl">🔒</div>
        <h1 className="text-2xl font-bold text-white">Erişim Yok</h1>
        <p className="text-gray-400">Bu sayfayı görüntüleme yetkiniz bulunmuyor.</p>
        <a href="/" className="inline-block mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors">
          Ana Sayfaya Dön
        </a>
      </div>
    </div>
  );
}
