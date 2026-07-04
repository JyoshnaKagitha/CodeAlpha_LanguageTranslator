from deep_translator import GoogleTranslator # type: ignore


def get_supported_languages():
    try:
        languages = GoogleTranslator().get_supported_languages(as_dict=True)
        languages = {**languages}
        return languages
    except Exception:
        return {"auto": "Auto Detect", "en": "English"}


def translate_text(text, target_lang, source_lang="auto"):
    if not text:
        return ""
    
    try:
        translator = GoogleTranslator(source=source_lang, target=target_lang)
        translated = translator.translate(text)
        return translated
    except Exception:
        return ""
