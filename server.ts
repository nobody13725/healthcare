import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy Gemini API Client
let genAIClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set in environment. Mock responses will be used if needed.");
    }
    genAIClient = new GoogleGenAI({
      apiKey: apiKey || "dummy-key",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI Health Coach Chat endpoint with Action Extraction (US17 & PB14 Interactive Copilot)
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { messages, userContext } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    const lastUserMessage = [...(messages || [])].reverse().find((m: any) => m.role === 'user')?.content || '';

    // Smart deterministic action fallback detection (works even offline or without API key)
    const detectFallbackActions = (text: string) => {
      const lower = text.toLowerCase();
      const detectedActions: any[] = [];

      // Water logging
      const waterMatch = lower.match(/(?:uống|nạp|thêm)\s*(\d{2,4})\s*(?:ml|lít|lit)/i);
      if (waterMatch) {
        let ml = parseInt(waterMatch[1], 10);
        if (lower.includes('lít') || lower.includes('lit')) ml = ml * 1000;
        detectedActions.push({
          id: 'act_' + Date.now() + '_water',
          type: 'log_water',
          label: `Ghi nhận +${ml}ml nước vào hệ thống`,
          description: `Cập nhật trực tiếp tiến trình nước hôm nay (+${ml}ml)`,
          payload: { amountMl: ml },
        });
      } else if (lower.includes('uống nước') || lower.includes('ly nước')) {
        detectedActions.push({
          id: 'act_' + Date.now() + '_water',
          type: 'log_water',
          label: 'Ghi nhận +300ml nước',
          description: 'Cập nhật 1 ly nước vào biểu đồ uống nước',
          payload: { amountMl: 300 },
        });
      }

      // Exercise / Task creation
      if (lower.includes('chạy bộ') || lower.includes('đi bộ') || lower.includes('tập gym') || lower.includes('thể dục') || lower.includes('giãn cơ') || lower.includes('nhiệm vụ')) {
        detectedActions.push({
          id: 'act_' + Date.now() + '_task',
          type: 'add_task',
          label: 'Thêm bài tập vào Nhiệm vụ hôm nay',
          description: 'Tạo nhiệm vụ vận động chuẩn khoa học vào Dashboard',
          payload: {
            title: lower.includes('chạy bộ') ? 'Chạy bộ hiếu khí Zone 2' : lower.includes('đi bộ') ? 'Đi bộ nhanh 5000 bước' : 'Bài tập vận động theo tư vấn AI',
            category: 'exercise',
            time: '17:30',
            frequency: 'daily',
            targetValue: '30 phút'
          },
        });
      }

      // Meal detection
      if (lower.includes('ăn') || lower.includes('món') || lower.includes('cơm') || lower.includes('bún') || lower.includes('phở') || lower.includes('salad') || lower.includes('calo')) {
        detectedActions.push({
          id: 'act_' + Date.now() + '_meal',
          type: 'add_meal',
          label: 'Ghi món này vào Nhật ký Dinh dưỡng',
          description: 'Lưu tự động vào nhật ký Calories & Macro hôm nay',
          payload: {
            name: lower.includes('ức gà') ? 'Ức gà áp chảo + Cơm lứt' : lower.includes('phở') ? 'Phở bò tái nạc' : 'Bữa ăn lành mạnh theo AI',
            mealType: 'lunch',
            calories: lower.includes('phở') ? 480 : 520,
            protein: 38,
            carbs: 45,
            fat: 10,
            time: '12:15'
          },
        });
      }

      // Supplement detection
      if (lower.includes('vitamin') || lower.includes('omega') || lower.includes('thuốc') || lower.includes('uống bổ sung') || lower.includes('kẽm') || lower.includes('magie')) {
        detectedActions.push({
          id: 'act_' + Date.now() + '_supp',
          type: 'add_supplement',
          label: 'Thêm vào Danh mục Uống thuốc & Vitamin',
          description: 'Lên lịch theo dõi và nhắc nhở uống hàng ngày',
          payload: {
            name: lower.includes('omega') ? 'Omega-3 Dầu cá' : lower.includes('vitamin d') ? 'Vitamin D3 + K2' : 'Vi chất bổ sung theo tư vấn',
            dosage: '1 viên',
            category: 'vitamin',
            timing: 'morning',
            notes: 'Uống sau bữa ăn sáng để hấp thu tối ưu'
          },
        });
      }

      // Medical appointment / Event
      if (lower.includes('khám') || lower.includes('hẹn') || lower.includes('bác sĩ') || lower.includes('bệnh viện') || lower.includes('xét nghiệm')) {
        detectedActions.push({
          id: 'act_' + Date.now() + '_event',
          type: 'add_event',
          label: 'Lên lịch Hẹn khám Y tế vào Lịch trình',
          description: 'Thêm sự kiện theo dõi sức khỏe vào Lịch khám & Nhắc nhở',
          payload: {
            title: 'Khám sức khỏe tổng quát định kỳ',
            date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
            startTime: '08:30',
            endTime: '10:00',
            location: 'Phòng khám Đa khoa / Bệnh viện',
            type: 'checkup',
            doctorNotes: 'Nhớ nhịn ăn sáng trước khi lấy mẫu xét nghiệm máu'
          },
        });
      }

      return detectedActions;
    };

    if (!apiKey) {
      const fallbackActions = detectFallbackActions(lastUserMessage);
      return res.json({
        reply: `Chào bạn! Tôi là Trợ lý Sức khỏe AI của Hệ thống Quản lý Sức khỏe Cá nhân (Đại học Duy Tân).
Dựa vào chỉ số hiện tại của bạn (BMI: ${userContext?.bmi || "21.5"}, Mục tiêu: "${userContext?.activeGoal || "Cải thiện thể trạng"}"), tôi đã phân tích yêu cầu của bạn.
${fallbackActions.length > 0 ? '\n💡 **Tôi đã chuẩn bị các hành động thực thi trực tiếp trên trang web bên dưới.** Bạn chỉ cần bấm "Thực thi ngay" để cập nhật dữ liệu tự động!' : ''}`,
        actions: fallbackActions,
      });
    }

    const ai = getGemini();
    const systemPrompt = `Bạn là Bác sĩ & Huấn luyện viên AI chuyên nghiệp và là Trợ lý Hành động (Interactive Health Copilot) trong "Hệ thống Quản lý Sức khỏe Cá nhân" (phát triển theo đề án KLTN Trường Đại học Duy Tân).
Nhiệm vụ ĐẶC BIỆT của bạn:
1. Không chỉ trả lời bằng lời khuyên, mà bạn CÓ THỂ TƯƠNG TÁC TRỰC TIẾP VỚI TRANG WEB bằng cách trả về danh sách các "actions" để hệ thống tự động thêm hoặc người dùng bấm 1 nút là thực thi ngay!
2. Các loại hành động hợp lệ (actions):
   - "add_task": Thêm nhiệm vụ vào danh sách việc cần làm hôm nay. Payload: { title: string, category: 'exercise'|'diet'|'sleep'|'water'|'medicine'|'mindfulness', time: 'HH:mm', frequency: 'daily', targetValue: string }
   - "add_meal": Ghi món ăn vào Nhật ký Dinh dưỡng. Payload: { name: string, mealType: 'breakfast'|'lunch'|'dinner'|'snack', calories: number, protein: number, carbs: number, fat: number, time: 'HH:mm' }
   - "add_supplement": Thêm thuốc / vitamin cần uống. Payload: { name: string, dosage: string, category: 'vitamin'|'mineral'|'prescription'|'herbal', timing: 'morning'|'afternoon'|'evening'|'bedtime', notes: string }
   - "log_water": Ghi nhận uống nước (+ml). Payload: { amountMl: number }
   - "add_event": Lên lịch hẹn y tế hoặc khám bệnh. Payload: { title: string, date: 'YYYY-MM-DD', startTime: 'HH:mm', endTime: 'HH:mm', location: string, type: 'checkup'|'vaccine'|'doctor_visit'|'medication_reminder', doctorNotes: string }
   - "add_habit": Tạo thói quen mới để theo dõi streak. Payload: { title: string, category: 'exercise'|'nutrition'|'mindfulness'|'sleep'|'hydration', targetDays: number, targetValue: string }

3. Dữ liệu hồ sơ người dùng hiện tại:
${JSON.stringify(userContext || {}, null, 2)}

4. ĐỊNH DẠNG ĐẦU RA BẮT BUỘC:
Trả về định dạng JSON thuần túy có cấu trúc:
{
  "reply": "Lời giải thích, phân tích y khoa và huấn luyện văn minh, ân cần bằng tiếng Việt, dùng markdown gạch đầu dòng rõ ràng",
  "actions": [
    {
      "id": "chuỗi định danh ngẫu nhiên",
      "type": "add_task" | "add_meal" | "add_supplement" | "log_water" | "add_event" | "add_habit",
      "label": "Tên hành động ngắn gọn cho nút bấm (VD: Thêm bài tập Chạy bộ Zone 2, Ghi món ức gà 520 kcal...)",
      "description": "Mô tả ngắn gọn tác động",
      "payload": { ... }
    }
  ]
}
Nếu yêu cầu chỉ là câu hỏi lý thuyết không cần hành động, để "actions": [].`;

    // Build contents from messages
    const formattedHistory = (messages || []).map((m: { role: string; content: string }) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: formattedHistory.length > 0 ? formattedHistory : [{ role: "user", parts: [{ text: "Xin chào, hãy cho tôi đánh giá sức khỏe và đề xuất hành động hôm nay." }] }],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    let resultJson: any = {};
    try {
      resultJson = JSON.parse(response.text || "{}");
    } catch (parseErr) {
      resultJson = {
        reply: response.text || "Đã phân tích yêu cầu của bạn.",
        actions: detectFallbackActions(lastUserMessage)
      };
    }

    // Double check if actions empty but user query clearly had intent
    if (!resultJson.actions || resultJson.actions.length === 0) {
      const extraActions = detectFallbackActions(lastUserMessage);
      if (extraActions.length > 0) {
        resultJson.actions = extraActions;
      }
    }

    res.json(resultJson);
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    // Graceful fallback on error
    const lastUserMessage = req.body?.messages?.slice(-1)[0]?.content || '';
    const fallbackActions = [
      {
        id: 'fallback_water',
        type: 'log_water',
        label: 'Ghi nhận +250ml nước',
        description: 'Tự động cộng nước vào tiến trình hôm nay',
        payload: { amountMl: 250 }
      }
    ];
    res.json({
      reply: "Tôi đã nhận được thông điệp của bạn. Dưới đây là gợi ý hành động bạn có thể thực thi ngay trên trang web:",
      actions: fallbackActions,
    });
  }
});

// AI Smart Meal & Food Macro Estimator
app.post("/api/ai/estimate-meal", async (req, res) => {
  try {
    const { mealDescription, mealType } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Smart offline food knowledge base
      const text = (mealDescription || '').toLowerCase();
      let est = {
        name: mealDescription || "Bữa ăn lành mạnh",
        calories: 450,
        protein: 28,
        carbs: 50,
        fat: 12,
        mealType: mealType || "lunch",
        healthTip: "Món ăn cân bằng dinh dưỡng. Nên bổ sung thêm rau xanh tươi."
      };
      if (text.includes("phở")) {
        est = { name: "Phở bò tái chín", calories: 480, protein: 32, carbs: 62, fat: 12, mealType: "breakfast", healthTip: "Nhiều natri trong nước dùng, hạn chế húp cạn nước béo." };
      } else if (text.includes("cơm tấm")) {
        est = { name: "Cơm tấm sườn nướng", calories: 720, protein: 35, carbs: 80, fat: 28, mealType: "lunch", healthTip: "Năng lượng cao, thích hợp cho ngày vận động thể lực nhiều." };
      } else if (text.includes("ức gà")) {
        est = { name: "Ức gà áp chảo + Khoai lang", calories: 420, protein: 44, carbs: 38, fat: 6, mealType: "lunch", healthTip: "Giàu protein nạc, tuyệt vời cho phục hồi cơ bắp." };
      } else if (text.includes("trứng")) {
        est = { name: "2 quả trứng luộc + Bánh mì đen", calories: 310, protein: 18, carbs: 28, fat: 11, mealType: "breakfast", healthTip: "Choline và chất béo lành mạnh giúp não bộ tỉnh táo." };
      }
      return res.json(est);
    }

    const ai = getGemini();
    const prompt = `Phân tích món ăn sau và ước tính chỉ số dinh dưỡng chính xác nhất:
Mô tả món ăn: "${mealDescription}"
Bữa ăn: "${mealType || 'lunch'}"

Trả về định dạng JSON hợp lệ:
{
  "name": "Tên món ăn chuẩn hóa",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "mealType": "breakfast" | "lunch" | "dinner" | "snack",
  "healthTip": "Lời khuyên dinh dưỡng ngắn gọn 1-2 câu"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Meal estimation error:", error);
    res.status(500).json({ error: error.message });
  }
});

// AI Generate Complete 1-Day Health Protocol (One-Click Apply Protocol)
app.post("/api/ai/generate-protocol", async (req, res) => {
  try {
    const { userContext, goals, metrics } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.json({
        title: "Phác đồ Tối ưu Năng lượng & Đốt mỡ Zone 2",
        summary: "Thiết kế chuẩn y học dự phòng tối ưu cho chỉ số BMI hiện tại, kết hợp cardio nhẹ nhàng và dinh dưỡng giàu đạm.",
        actions: [
          {
            id: 'proto_task_1',
            type: 'add_task',
            label: 'Chạy bộ nhẹ nhàng nhịp tim Zone 2',
            description: 'Duy trì nhịp tim 115-135 bpm trong 30 phút kích thích ty thể',
            payload: { title: 'Chạy bộ Zone 2 duy trì ty thể', category: 'exercise', time: '17:00', frequency: 'daily', targetValue: '30 phút' }
          },
          {
            id: 'proto_meal_1',
            type: 'add_meal',
            label: 'Bữa trưa: Ức gà nướng + Cơm gạo lứt + Bông cải',
            description: '520 kcal, 44g protein giúp phục hồi mô cơ tối đa',
            payload: { name: 'Ức gà nướng + Cơm gạo lứt + Bông cải', mealType: 'lunch', calories: 520, protein: 44, carbs: 46, fat: 8, time: '12:30' }
          },
          {
            id: 'proto_supp_1',
            type: 'add_supplement',
            label: 'Magnesi Glycinate 400mg trước khi ngủ',
            description: 'Tăng sóng não delta, hỗ trợ ngủ sâu tăng trưởng',
            payload: { name: 'Magnesi Glycinate', dosage: '400mg', category: 'mineral', timing: 'bedtime', notes: 'Uống 30 phút trước khi ngủ' }
          },
          {
            id: 'proto_water_1',
            type: 'log_water',
            label: 'Nạp ngay 500ml nước bù điện giải',
            description: 'Cân bằng áp suất thẩm thấu cơ thể',
            payload: { amountMl: 500 }
          }
        ]
      });
    }

    const ai = getGemini();
    const prompt = `Bạn là chuyên gia y học lối sống & huấn luyện viên hiệu suất cao (Peter Attia / Andrew Huberman style).
Dựa trên hồ sơ người dùng:
${JSON.stringify(userContext || {})}
Mục tiêu chính: ${JSON.stringify(goals || [])}
Chỉ số thể chất gần nhất: ${JSON.stringify(metrics || {})}

Hãy thiết kế một Phác Đồ Hoạt Động 1 Ngày (1-Day Action Protocol) khả thi và có thể thực thi trực tiếp trên hệ thống gồm:
- 1 Nhiệm vụ tập luyện thể chất (Zone 2 hoặc sức bền)
- 1 Bữa ăn dinh dưỡng cụ thể kèm macros (P, C, F, Calories)
- 1 Loại thực phẩm bổ sung/vi chất tối ưu
- 1 Mục tiêu nước hoặc phục hồi thần kinh.

Trả về định dạng JSON thuần túy:
{
  "title": "Tên phác đồ hấp dẫn, truyền cảm hứng",
  "summary": "Tóm tắt cơ chế khoa học 2-3 câu",
  "actions": [
    {
      "id": "chuỗi ngẫu nhiên",
      "type": "add_task" | "add_meal" | "add_supplement" | "log_water" | "add_habit",
      "label": "Tên hành động",
      "description": "Chi tiết tác động y khoa",
      "payload": { ... }
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.5,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Generate protocol error:", error);
    res.status(500).json({ error: error.message });
  }
});

// AI Analyze Health & Habit Progress (US17)
app.post("/api/ai/analyze-progress", async (req, res) => {
  try {
    const { userData, goals, tasks, habits, metrics } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.json({
        analysis: `### Đánh giá tiến độ sức khỏe tổng hợp
- **Mức độ cam kết**: Rất tốt! Bạn đang duy trì được chuỗi ${habits?.[0]?.streak || 5} ngày liên tục.
- **Chỉ số BMI**: Đang ở mức cân đối. Cần duy trì chế độ uống đủ nước và ngủ đủ 7-8 tiếng.
- **Khuyến nghị Sprint tiếp theo**: Tập trung hoàn thành 100% các nhiệm vụ uống nước và giãn cơ giữa giờ làm việc.`,
      });
    }

    const ai = getGemini();
    const prompt = `Phân tích toàn diện dữ liệu sức khỏe và tiến độ Scrum của người dùng dưới đây:
Hồ sơ: ${JSON.stringify(userData)}
Mục tiêu đang thực hiện: ${JSON.stringify(goals)}
Nhiệm vụ hôm nay: ${JSON.stringify(tasks)}
Thói quen & Chuỗi ngày (Streak): ${JSON.stringify(habits)}
Chỉ số sức khỏe gần nhất: ${JSON.stringify(metrics)}

Hãy trả về một báo cáo phân tích súc tích, chuyên nghiệp chuẩn y tế dự phòng và quản lý mục tiêu gồm:
1. **Tổng quan hiện trạng & Điểm số sức khỏe** (Thang điểm 100).
2. **Điểm mạnh đã đạt được** (về thói quen, chỉ số BMI, hoàn thành nhiệm vụ).
3. **Các nguy cơ hoặc thói quen cần cải thiện** (ví dụ thiếu ngủ, vận động chưa đều, uống ít nước).
4. **Kế hoạch hành động 3 bước ngay hôm nay** (Cực kỳ cụ thể, có thời gian thực hiện).
5. **Lời khuyên dinh dưỡng & phục hồi thể lực**.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        temperature: 0.6,
      },
    });

    res.json({ analysis: response.text });
  } catch (error: any) {
    console.error("AI Analysis error:", error);
    res.status(500).json({ error: error.message });
  }
});

// AI Suggest Health Routine & Micro-habits
app.post("/api/ai/generate-habits", async (req, res) => {
  try {
    const { targetGoal, dailyTimeAvailable, healthStatus } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.json({
        habits: [
          { name: "Uống 1 ly nước ấm ngay khi thức dậy", frequency: "Hằng ngày", target: "500ml", time: "06:30", category: "hydrate" },
          { name: "Đi bộ nhanh hoặc chạy bộ nhẹ", frequency: "Hằng ngày", target: "30 phút", time: "17:30", category: "exercise" },
          { name: "Ngắt màn hình điện thoại trước khi ngủ", frequency: "Hằng ngày", target: "30 phút", time: "22:30", category: "sleep" },
        ],
      });
    }

    const ai = getGemini();
    const prompt = `Hãy đóng vai trò chuyên gia sức khỏe và Scrum Master. Dựa vào mục tiêu "${targetGoal}", thời gian rảnh mỗi ngày "${dailyTimeAvailable || '45 phút'}" và thể trạng "${healthStatus || 'bình thường'}", hãy gợi ý danh sách 4-5 nhiệm vụ/thói quen nhỏ (micro-habits) khoa học và khả thi nhất.
Trả lời dưới dạng định dạng JSON hợp lệ:
[
  {
    "name": "Tên thói quen",
    "target": "Mục tiêu cụ thể (VD: 2 lít / 30 phút / 1 lần)",
    "time": "Khung giờ gợi ý (VD: 07:00, 12:00, 21:00)",
    "category": "hydrate | exercise | sleep | medication | mindfulness",
    "benefit": "Lợi ích ngắn gọn"
  }
]`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "[]");
    res.json({ habits: parsed });
  } catch (error: any) {
    console.error("AI Generate Habits error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Start server with Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
