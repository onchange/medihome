import Link from 'next/link'

export default function AttributionPage() {
  return (
    <main className="max-w-4xl mx-auto p-8">
      <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
        ← トップページに戻る
      </Link>

      <h1 className="text-3xl font-bold mb-8">データ出典</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">医療施設データ</h2>
        <dl className="space-y-2">
          <dt className="font-bold">提供元</dt>
          <dd className="ml-4">厚生労働省 医療情報ネット</dd>

          <dt className="font-bold mt-4">ライセンス</dt>
          <dd className="ml-4">政府標準利用規約（第2.0版）/ CC BY 4.0互換</dd>

          <dt className="font-bold mt-4">データ取得日</dt>
          <dd className="ml-4">2025年12月1日（厚労省オープンデータ公開日）</dd>

          <dt className="font-bold mt-4">対象エリア</dt>
          <dd className="ml-4">東京23区</dd>

          <dt className="font-bold mt-4">対象施設数</dt>
          <dd className="ml-4">20,927施設（病院393、診療所9,381、歯科6,400、薬局4,753）</dd>

          <dt className="font-bold mt-4">診療科数</dt>
          <dd className="ml-4">48,180件</dd>

          <dt className="font-bold mt-4">URL</dt>
          <dd className="ml-4">
            <a
              href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryou/johokokai/index.html"
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              医療機能情報提供制度（医療情報ネット）
            </a>
          </dd>
        </dl>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">地図データ</h2>
        <dl className="space-y-2">
          <dt className="font-bold">提供元</dt>
          <dd className="ml-4">OpenStreetMap contributors</dd>

          <dt className="font-bold mt-4">ライセンス</dt>
          <dd className="ml-4">Open Database License (ODbL)</dd>

          <dt className="font-bold mt-4">URL</dt>
          <dd className="ml-4">
            <a
              href="https://www.openstreetmap.org/copyright"
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              OpenStreetMap Copyright
            </a>
          </dd>
        </dl>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">行政区域データ</h2>
        <dl className="space-y-2">
          <dt className="font-bold">提供元</dt>
          <dd className="ml-4">国土交通省 国土数値情報（行政区域データ）</dd>

          <dt className="font-bold mt-4">加工・変換</dt>
          <dd className="ml-4">smartnews-smri/japan-topography</dd>

          <dt className="font-bold mt-4">ライセンス</dt>
          <dd className="ml-4">国土数値情報利用約款</dd>

          <dt className="font-bold mt-4">URL</dt>
          <dd className="ml-4">
            <a
              href="https://github.com/smartnews-smri/japan-topography"
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              smartnews-smri/japan-topography
            </a>
          </dd>
        </dl>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">利用規約</h2>
        <p className="leading-relaxed mb-4">
          本サービスで使用しているデータは、政府標準利用規約（第2.0版）に基づいて提供されています。
        </p>
        <p className="leading-relaxed">
          このライセンスに従い、出典を明示することで、営利目的、非営利目的を問わず、
          これらのデータを自由に利用・複製・改変・頒布することができます。
        </p>
      </section>
    </main>
  )
}
