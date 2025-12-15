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
          <dd className="ml-4">2025年12月15日</dd>

          <dt className="font-bold mt-4">対象施設数</dt>
          <dd className="ml-4">198施設（病院5、診療所73、歯科60、助産所2、薬局58）</dd>

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
        <h2 className="text-2xl font-bold mb-4">不動産取引データ</h2>
        <dl className="space-y-2">
          <dt className="font-bold">提供元</dt>
          <dd className="ml-4">国土交通省 不動産情報ライブラリAPI</dd>

          <dt className="font-bold mt-4">ライセンス</dt>
          <dd className="ml-4">政府標準利用規約（第2.0版）/ CC BY 4.0互換</dd>

          <dt className="font-bold mt-4">データ取得日</dt>
          <dd className="ml-4">2025年12月15日</dd>

          <dt className="font-bold mt-4">対象期間</dt>
          <dd className="ml-4">2024年度（第1〜4四半期）</dd>

          <dt className="font-bold mt-4">取引件数</dt>
          <dd className="ml-4">563件</dd>

          <dt className="font-bold mt-4">URL</dt>
          <dd className="ml-4">
            <a
              href="https://www.reinfolib.mlit.go.jp/"
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              不動産情報ライブラリ
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
