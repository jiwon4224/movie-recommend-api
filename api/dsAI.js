import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  const allowedOrigin = "https://jiwon4224.github.io"
  
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = await getBody(req);
    const { genre } = body;

    if (!genre) {
      return res.status(400).json({ error: "장르 정보가 필요합니다." });
    }

    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
장르: ${genre}
이 장르를 좋아하는 사람에게 추천할 만한 실제로 존재하는 영화 3편을 소개해줘.
영화 제목(한글 또는 원어명)과 간단한 줄거리도 함께 알려줘. 실제로 존재하는 영화만 추천해줘.
Rotten Tomatoes, IMDb 등의 사이트에서 영화 순위를 참고할 수 있어.
친한 친구에게 소개해주는 느낌으로 반말로 부탁해.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    res.status(200).json({ answer: text });
  } catch (err) {
    console.error("Gemini API 호출 오류:", err);
    res.status(500).json({ error: "Gemini API 오류 발생" });
  }
}

// body 파서 함수
async function getBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", chunk => (data += chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(err);
      }
    });
  });
}
