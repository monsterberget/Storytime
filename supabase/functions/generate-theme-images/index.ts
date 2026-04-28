import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const THEMES = [
  { name: "Dragons", prompt: "A friendly purple dragon flying over a magical castle, watercolor children's book illustration, soft pastel colors, no text" },
  { name: "Space", prompt: "A cute astronaut child floating among stars and planets, watercolor children's book illustration, soft pastel colors, no text" },
  { name: "Friendship", prompt: "Two children holding hands in a sunny meadow, watercolor children's book illustration, soft pastel colors, no text" },
  { name: "Animals", prompt: "A group of cute forest animals - fox, bunny, owl - in an enchanted forest, watercolor children's book illustration, soft pastel colors, no text" },
  { name: "Magic", prompt: "A magical wand with sparkles and stars over an open spellbook, watercolor children's book illustration, soft pastel colors, no text" },
  { name: "Ocean", prompt: "A friendly whale and colorful fish in a coral reef, watercolor children's book illustration, soft pastel colors, no text" },
  { name: "Dinosaurs", prompt: "A small green friendly dinosaur in a prehistoric landscape with palm trees, watercolor children's book illustration, soft pastel colors, no text" },
  { name: "Superheroes", prompt: "A child superhero with a flowing cape flying over a city, watercolor children's book illustration, soft pastel colors, no text" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const results = [];

    for (const theme of THEMES) {
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: theme.prompt,
          n: 1,
          size: "1024x1024",
          quality: "standard",
        }),
      });

      if (!response.ok) {
        results.push({ theme: theme.name, error: await response.text() });
        continue;
      }

      const data = await response.json();
      const imageUrl = data.data[0].url;

      const imageResponse = await fetch(imageUrl);
      const imageBlob = await imageResponse.arrayBuffer();

      const fileName = `${theme.name.toLowerCase()}.png`;
      const { error: uploadError } = await supabase.storage
        .from("theme-images")
        .upload(fileName, imageBlob, {
          contentType: "image/png",
          upsert: true,
        });

      if (uploadError) {
        results.push({ theme: theme.name, error: uploadError.message });
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("theme-images")
        .getPublicUrl(fileName);

      results.push({ theme: theme.name, url: publicUrl });
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});