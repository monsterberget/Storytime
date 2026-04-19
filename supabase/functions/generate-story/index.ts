import Anthropic from "npm:@anthropic-ai/sdk";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();

    const client = new Anthropic({
      apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
    });

    const message = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `You are a children's story writer. Write a short, engaging bedtime story for children aged 3-10 based on this prompt: "${prompt}"
          
Return the story as a JSON object with this exact structure:
{
  "title": "Story title here",
  "sections": [
    { "text": "First paragraph of the story..." },
    { "text": "Second paragraph of the story..." },
    { "text": "Third paragraph of the story..." }
  ]
}

Keep each section to 2-3 sentences. Make it magical, fun and age-appropriate. Return only the JSON, no other text.`,
        },
      ],
    });

   const content = message.content[0];
if (content.type !== "text") throw new Error("Unexpected response type");

const clean = content.text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
const story = JSON.parse(clean);

    return new Response(JSON.stringify(story), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err.message, err.stack);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});