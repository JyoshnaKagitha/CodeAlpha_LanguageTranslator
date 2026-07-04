from flask import Flask, render_template, request, jsonify

from services.translate_service import get_supported_languages, translate_text
from services.tts_service import get_tts_suported_languages, synthesize_speech

app = Flask(__name__)

MAX_CHAR_LIMIT = 3000


@app.route("/", methods=["GET"])
def index():
    languages = get_supported_languages()
    tts_languages = list(get_tts_suported_languages().keys())
    return render_template(
        "index.html",
        languages=languages,
        translated_text="",
        original_text="",
        source_lang="auto",
        target_lang="en",
        error=None,
        max_chars=MAX_CHAR_LIMIT,
        tts_languages=tts_languages
    )


@app.route("/translate", methods=["POST"])
def translate():
    data = request.get_json()
    text = data.get("text", "").strip()
    source_lang = data.get("source_language")
    target_lang = data.get("target_language")
    
    error = None
    translated = ""

    if not text:
        error = "Input text cannot be empty"
    elif len(text) > MAX_CHAR_LIMIT:
        error = f"Text exceeds {MAX_CHAR_LIMIT} characters"
    else:
        if source_lang == "auto":
            translated = translate_text(text, target_lang) or ""
        else:
            translated = translate_text(text, target_lang, source_lang) or ""

        if translated is None:
            error = "Translation failed"

    return jsonify({
        "translated_text": translated, 
        "error": error
    })


@app.route("/speak", methods=["POST"])
def speak():
    data = request.get_json()

    text = data.get("text")
    language_code = data.get("language_code")

    if not text or not language_code or language_code=="auto":
        return jsonify({"error": "Invalid request "}), 400
    
    audio_base64 = synthesize_speech(text, language_code)

    if not audio_base64:
        return jsonify({"error": "TTS failed"}), 500
    
    return jsonify({"audio": audio_base64})



if __name__ == "__main__":
    app.run(debug=True, port=5001)

