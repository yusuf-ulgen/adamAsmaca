import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const playedWords = body.playedWords || []; 
    const category = body.category || 'GENEL';

    // 1. TDK'nın devasa kelime listesini çekiyoruz (90.000+ kelime)
    const listRes = await fetch('https://sozluk.gov.tr/autocomplete.json');
    const allWords = await listRes.json();

    // 2. Filtreleme logic'i
    const filteredWords = allWords
      .map((w: any) => w.madde.toUpperCase())
      .filter((w: string) => {
        const isTurkishAlpha = /^[ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ]+$/.test(w);
        return (
          w.length >= 4 && 
          w.length <= 12 && 
          isTurkishAlpha &&
          !playedWords.includes(w)
        );
      });

    // 3. Rastgele kelime seçimi
    const wordPool = filteredWords.length > 0 ? filteredWords : ["BİLGİSAYAR", "YAZILIM", "TÜRKİYE"];
    const randomWord = wordPool[Math.floor(Math.random() * wordPool.length)];

    // 4. Anlamını TDK'dan canlı olarak çekme
    let meaning = "İpucu bulunamadı.";
    try {
      const tdkRes = await fetch(`https://sozluk.gov.tr/gts?ara=${encodeURIComponent(randomWord.toLowerCase())}`);
      const tdkData = await tdkRes.json();
      if (Array.isArray(tdkData) && tdkData.length > 0 && tdkData[0].anlamlarListe) {
        meaning = tdkData[0].anlamlarListe[0].anlam;
      }
    } catch (e) {
      console.error("Meaning fetch error", e);
    }

    return NextResponse.json({
      word: randomWord,
      meaning: meaning,
      category: category
    });

  } catch (err) {
    console.error("API Main Error", err);
    return NextResponse.json({ word: "ADAM ASMACA", meaning: "Sistem hatası." }, { status: 500 });
  }
}
