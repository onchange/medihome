import Link from 'next/link'

export default function ScoringPage() {
  return (
    <main className="max-w-4xl mx-auto p-8">
      <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
        ← トップページに戻る
      </Link>

      <h1 className="text-3xl font-bold mb-8">スコア計算ロジック</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">計算の基本方針</h2>
        <p className="leading-relaxed mb-4">
          スコアは<strong>面積あたりの施設密度</strong>（施設数 ÷ 区の面積km²）を基準に、
          <strong>23区間での相対的なパーセンタイル順位</strong>で算出されます。
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
          <p className="text-sm">
            <strong>例：</strong>豊島区（面積13km²）に100件の小児科があれば密度は7.7件/km²、
            江戸川区（面積50km²）に100件あれば密度は2.0件/km²となります。
            同じ100件でも、面積が小さい区の方が「アクセスしやすい」と評価されます。
          </p>
        </div>
        <p className="leading-relaxed">
          パーセンタイル方式により、23区内での相対的な順位がスコアに反映されます。
          最も密度が高い区は100点に近く、最も低い区は0点に近くなります。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">子育てスコア</h2>
        <p className="text-gray-600 mb-4">小さなお子さんがいる家庭向けの医療環境を評価</p>
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-pink-50">
              <th className="border border-gray-300 p-2 text-left">指標</th>
              <th className="border border-gray-300 p-2 text-center w-20">重み</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2">小児科密度（施設数/km²）</td>
              <td className="border border-gray-300 p-2 text-center font-bold">35%</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-300 p-2">産婦人科・助産所密度</td>
              <td className="border border-gray-300 p-2 text-center font-bold">20%</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">夜間小児科の有無（あり=100点、なし=0点）</td>
              <td className="border border-gray-300 p-2 text-center font-bold">15%</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-300 p-2">薬局密度</td>
              <td className="border border-gray-300 p-2 text-center font-bold">15%</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">病院の有無（2件以上=100点、1件=50点、0件=0点）</td>
              <td className="border border-gray-300 p-2 text-center font-bold">15%</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">高齢者スコア</h2>
        <p className="text-gray-600 mb-4">シニア世代向けの医療環境を評価</p>
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-purple-50">
              <th className="border border-gray-300 p-2 text-left">指標</th>
              <th className="border border-gray-300 p-2 text-center w-20">重み</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2">循環器内科密度（施設数/km²）</td>
              <td className="border border-gray-300 p-2 text-center font-bold">25%</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-300 p-2">整形外科密度</td>
              <td className="border border-gray-300 p-2 text-center font-bold">25%</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">リハビリテーション科密度</td>
              <td className="border border-gray-300 p-2 text-center font-bold">25%</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-300 p-2">病院密度</td>
              <td className="border border-gray-300 p-2 text-center font-bold">25%</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">一般医療スコア</h2>
        <p className="text-gray-600 mb-4">一般的な医療ニーズに対する環境を評価</p>
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-teal-50">
              <th className="border border-gray-300 p-2 text-left">指標</th>
              <th className="border border-gray-300 p-2 text-center w-20">重み</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2">内科密度（施設数/km²）</td>
              <td className="border border-gray-300 p-2 text-center font-bold">25%</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-300 p-2">歯科密度</td>
              <td className="border border-gray-300 p-2 text-center font-bold">20%</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">薬局密度</td>
              <td className="border border-gray-300 p-2 text-center font-bold">20%</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-300 p-2">診療所密度</td>
              <td className="border border-gray-300 p-2 text-center font-bold">20%</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">診療科の多様性（種類数）</td>
              <td className="border border-gray-300 p-2 text-center font-bold">15%</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">総合スコア</h2>
        <p className="leading-relaxed">
          子育て・高齢者・一般医療の3カテゴリスコアの<strong>単純平均</strong>です。
        </p>
        <div className="bg-gray-100 rounded p-4 mt-4 font-mono text-sm">
          総合スコア = (子育てスコア + 高齢者スコア + 一般医療スコア) ÷ 3
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">東京23区の面積</h2>
        <p className="text-gray-600 mb-4">スコア計算に使用している各区の面積（km²）</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
          {[
            { name: '千代田区', area: 11.66 },
            { name: '中央区', area: 10.21 },
            { name: '港区', area: 20.37 },
            { name: '新宿区', area: 18.22 },
            { name: '文京区', area: 11.29 },
            { name: '台東区', area: 10.11 },
            { name: '墨田区', area: 13.77 },
            { name: '江東区', area: 40.16 },
            { name: '品川区', area: 22.84 },
            { name: '目黒区', area: 14.67 },
            { name: '大田区', area: 60.83 },
            { name: '世田谷区', area: 58.05 },
            { name: '渋谷区', area: 15.11 },
            { name: '中野区', area: 15.59 },
            { name: '杉並区', area: 34.06 },
            { name: '豊島区', area: 13.01 },
            { name: '北区', area: 20.61 },
            { name: '荒川区', area: 10.16 },
            { name: '板橋区', area: 32.22 },
            { name: '練馬区', area: 48.08 },
            { name: '足立区', area: 53.25 },
            { name: '葛飾区', area: 34.80 },
            { name: '江戸川区', area: 49.90 },
          ].map(({ name, area }) => (
            <div key={name} className="bg-gray-50 rounded p-2 flex justify-between">
              <span>{name}</span>
              <span className="text-gray-600">{area}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8 bg-yellow-50 border border-yellow-200 rounded p-4">
        <h2 className="text-xl font-bold mb-2">ご注意</h2>
        <ul className="list-disc list-inside text-sm space-y-1 text-gray-700">
          <li>スコアは施設の「数」と「密度」を基に計算しており、医療サービスの「質」は反映していません</li>
          <li>面積が大きい区は施設数が多くても密度が低くなるため、スコアが低くなる傾向があります</li>
          <li>実際の医療アクセスは、公共交通機関の便利さなど他の要因も影響します</li>
          <li>スコアは参考情報であり、引っ越し先選びの唯一の基準にしないでください</li>
        </ul>
      </section>

      <nav className="border-t pt-4">
        <Link href="/legal/attribution" className="text-blue-600 hover:underline mr-4">
          データ出典
        </Link>
        <Link href="/legal/disclaimer" className="text-blue-600 hover:underline">
          免責事項
        </Link>
      </nav>
    </main>
  )
}
