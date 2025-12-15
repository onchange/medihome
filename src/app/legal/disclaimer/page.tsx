import Link from 'next/link'

export default function DisclaimerPage() {
  return (
    <main className="max-w-4xl mx-auto p-8">
      <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
        ← トップページに戻る
      </Link>

      <h1 className="text-3xl font-bold mb-8">免責事項</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">医療アクセススコアについて</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>スコアは施設の数と距離を基に自動計算しており、医療サービスの質を保証するものではありません</li>
          <li>実際の医療機関選択は、ご自身の判断と医師への相談を優先してください</li>
          <li>緊急時は迷わず119番通報してください</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">不動産価格情報について</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>価格は過去の取引実績であり、現在の市場価格を保証するものではありません</li>
          <li>物件購入の際は不動産業者に最新情報をご確認ください</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">データの正確性</h2>
        <p className="leading-relaxed">
          本サービスは政府オープンデータを利用していますが、データの正確性、最新性について保証いたしません。
          重要な判断をされる際は、必ず一次情報源をご確認ください。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">免責</h2>
        <p className="leading-relaxed">
          本サービスの利用により生じたいかなる損害についても、当サービスは一切の責任を負いかねます。
          ご利用は自己責任でお願いいたします。
        </p>
      </section>
    </main>
  )
}
