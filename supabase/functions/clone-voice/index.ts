const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    const name = formData.get("name") as string;

    if (!audioFile || !name) {
      throw new Error("Missing audio file or name");
    }

    const elevenForm = new FormData();
    elevenForm.append("name", name);
    elevenForm.append("files", audioFile);
    elevenForm.append("description", "Voice profile for Storytime app");

    const response = await fetch("https://api.elevenlabs.io/v1/voices/add", {
      method: "POST",
      headers: {
        "xi-api-key": Deno.env.get("ELEVENLABS_API_KEY")!,
      },
      body: elevenForm,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`ElevenLabs error: ${error}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify({ voiceId: data.voice_id }), {
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