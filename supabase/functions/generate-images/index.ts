import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { sections, title, storyId } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const imagePromises = sections.map(async (section: { text: string }, index: number) => {
      const prompt = `Children's book illustration, watercolor style, warm and magical. Scene: "${section.text.slice(0, 200)}". Style: Soft pastel colors, whimsical, age-appropriate for children aged 3-10. IMPORTANT: No text, no words, no letters, no captions anywhere in the image. Pure illustration only.`;

      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt,
          n: 1,
          size: "1024x1024",
          quality: "standard",
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI error: ${error}`);
      }

      const data = await response.json();
      const imageUrl = data.data[0].url;

      // Download the image
      const imageResponse = await fetch(imageUrl);
      const imageBlob = await imageResponse.arrayBuffer();

      // Upload to Supabase Storage
      const fileName = `${storyId}/section-${index}.png`;
      const { error: uploadError } = await supabase.storage
        .from("story-images")
        .upload(fileName, imageBlob, {
          contentType: "image/png",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("story-images")
        .getPublicUrl(fileName);

      return publicUrl;
    });

    const imageUrls = await Promise.all(imagePromises);

    return new Response(JSON.stringify({ imageUrls }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});