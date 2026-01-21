// PDF'ten kopyaladığınız tüm soruları bu şekilde düzenleyebilirsiniz
// İşte ilk 10 günlük örnek:

const allQuestionsFromPDF = [
  // Gün 1: Soru 1-5 (PDF sayfa 1)
  {
    day: 1,
    questions: [
      {
        id: 1,
        question: "In the end, Maria --- the operation on her leg as the orthopaedic surgeon said that the problem could be treated with physiotherapy.",
        options: ["mustn't have", "didn't need to have", "shouldn't have had", "needn't have", "had better not have"],
        correct: 2,
        explanation: "'needn't have + past participle' geçmişte gerekli olmayan bir eylemi ifade eder."
      },
      {
        id: 2,
        question: "Disasters on the earth --- dangerous, but most probably the biggest threat to humans --- space.",
        options: ["should seem / had come from", "might have seemed / must come from", "may seem / will come from", "are to seem / needn't come from", "don't need to seem / can't come from"],
        correct: 2,
        explanation: "'may seem' olasılık, 'will come from' gelecek tahmini ifade eder."
      },
      {
        id: 3,
        question: "There is no point in phoning Maggie at the office because she --- already.",
        options: ["should leave", "might leave", "must have left", "had better leave", "could leave"],
        correct: 2,
        explanation: "'must have + past participle' geçmişte olmuş olması muhtemel bir eylemi ifade eder."
      },
      {
        id: 4,
        question: "School days --- the best days of your life and usually part of that experience can involve some strenuous physical activity.",
        options: ["didn't need to be", "can't have been", "would have been", "would prefer to have been", "are supposed to be"],
        correct: 4,
        explanation: "'are supposed to be' genel kabul gören bir inanışı ifade eder."
      },
      {
        id: 5,
        question: "You --- so much food as there was plenty of food left over from the party and most of it was untouched so we could have eaten that.",
        options: ["mustn't cook", "had better not cook", "would rather have not cooked", "may not have cooked", "needn't have cooked"],
        correct: 4,
        explanation: "'needn't have + past participle' geçmişte gerekli olmayan bir eylemi ifade eder."
      }
    ]
  },
  // Gün 2: Soru 6-10 (PDF sayfa 1-2)
  {
    day: 2,
    questions: [
      {
        id: 6,
        question: "I --- up to my office on the tenth floor because the lift had stopped working.",
        options: ["may have to walk", "must be walking", "should have been walking", "had to walk", "might walk"],
        correct: 3,
        explanation: "'had to' geçmişte zorunluluk ifade eder."
      },
      {
        id: 7,
        question: "You --- your present job until you find another one.",
        options: ["didn't have to quit", "wouldn't have quitted", "had better not quit", "needn't have quitted", "weren't used to quitting"],
        correct: 2,
        explanation: "'had better not' tavsiye/uyarı ifade eder."
      },
      {
        id: 8,
        question: "When a baby has reached his first birthday, he --- or even stand up without the help of an adult.",
        options: ["had to sit", "must sit", "might sit", "should be able to sit up", "was able to sit"],
        correct: 3,
        explanation: "'should be able to' yetenek/beklenti ifade eder."
      },
      {
        id: 9,
        question: "Some teachers argue that students who - a calculator - how to do mental calculations.",
        options: ["could use / had to forget", "are used to using / may forget", "might have used / would have forgotten", "must use / used to forget", "can use / mustn't forget"],
        correct: 1,
        explanation: "'are used to using' alışkanlık, 'may forget' olasılık ifade eder."
      },
      {
        id: 10,
        question: "When the weather becomes colder, we - that the air mass - in the Arctic rather than over the Gulf of Mexico.",
        options: ["know / must have originated", "knew / may have originated", "had known / should have originated", "have known / had to originate", "were knowing / must originate"],
        correct: 1,
        explanation: "'must have + past participle' geçmişte kesin olması muhtemel bir durumu ifade eder."
      }
    ]
  }
  // ... diğer 22 gün bu şekilde devam eder
];

// Tarih hesaplama fonksiyonu
function generateDates(startDate = "2024-01-15") {
  const start = new Date(startDate);
  const dates = [];
  
  for (let i = 0; i < 24; i++) {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + i);
    dates.push(currentDate.toISOString().split('T')[0]);
  }
  
  return dates;
}
