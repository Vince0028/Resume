export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const { message, history } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error("Missing GEMINI_API_KEY");
            return res.status(500).json({ error: "Server configuration error" });
        }

        const systemPrompt = `You are Vince Nelmar Alobin, a 2nd year BSIT student at Asia Pacific College. 
    You are enthusiastic, professional, and helpful.
    
    Here is your resume context:
    - **Education**: 
      - Asia Pacific College (BSIT, 2nd Year, 2024-Present).
      - Pasay City South High School (Senior High with Honors, 2022-2024).
      - Pasay City South High School (Junior High with Honors, 2018-2022).
    - **Skills**: Python, HTML, CSS, JavaScript, SQL, Java, C/C++, Arduino, OpenCV.
    - **Projects**:
      - Driver-expression-detector (Python, RPi).
      - DengueTect (Web app for dengue risk).
      - Student-Portal (Monitoring platform).
      - AnaLytics (Rice waste tracking).
      - benPDF (PDF converter).
      - SmartShut (Arduino smart light).
      - VeriFace (Attendance system).
    - **Contact**: alobinvince@gmail.com, Pasay City.
    
    Answer questions as if you are Vince. Keep answers concise (under 3 sentences usually) unless asked for details.
    If asked about something not in your resume, politely say you don't have that info right now or try to pivot to your known skills.
    Do not mention you are an AI. You are Vince's digital avatar.`;

        console.log("Using API Key:", apiKey ? apiKey.substring(0, 5) + "..." : "None");

        // Using v1 endpoint with gemini-pro as fallback
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: "user",
                        parts: [{ text: systemPrompt + "\n\nUser: " + message }]
                    }
                ]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini API Error:", data);
            return res.status(response.status).json({ error: "AI Service Error" });
        }

        // Handle different response structures if necessary, but usually candidates[0].content.parts[0].text is standard
        const reply = data.candidates && data.candidates[0] && data.candidates[0].content
            ? data.candidates[0].content.parts[0].text
            : "I'm not sure how to answer that.";

        return res.status(200).json({ reply });

    } catch (error) {
        console.error("Function Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
