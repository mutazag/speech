import os
import azure.cognitiveservices.speech as speechsdk

from dotenv import load_dotenv
load_dotenv() 


speech_key, service_region = os.environ['key'], os.environ['region']
from_language, to_language = 'en-US', 'ar'

def translate_speech_to_text():
    translation_config = speechsdk.translation.SpeechTranslationConfig(
            subscription=speech_key, 
            region=service_region)
            # target_languages=[to_language],
            # voice_name="de-DE-Hedda")

    translation_config.speech_recognition_language = from_language
    translation_config.add_target_language(to_language)

    # See: https://aka.ms/speech/sdkregion#standard-and-neural-voices
    # translation_config.voice_name = "de-DE-Hedda"
    # translation_config.speech_synthesis_voice_name = "de-DE-Hedda"
    # speech_config.speech_synthesis_voice_name = "ar-JO-TaimNeural"
    # translation_config.speech_synthesis_voice_name="ar-JO-TaimNeural"
    translation_config.voice_name="ar-JO-TaimNeural"
    # translation_config.add_target_language("ar-JO")
    

    translation_recognizer = speechsdk.translation.TranslationRecognizer(
            translation_config=translation_config)

    def synthesis_callback(evt):
        size = len(evt.result.audio)
        print(f'Audio synthesized: {size} byte(s) {"(COMPLETED)" if size == 0 else ""}')

        if size > 0:
            file = open('..\\wav\\translation.wav', 'wb+')
            file.write(evt.result.audio)
            file.close()

    translation_recognizer.synthesizing.connect(synthesis_callback)

    print(f'Say something in "{from_language}" and we\'ll translate into "{to_language}".')

    translation_recognition_result = translation_recognizer.recognize_once()
    print(get_result_text(reason=translation_recognition_result.reason, translation_recognition_result=translation_recognition_result))

def get_result_text(reason, translation_recognition_result):
    reason_format = {
        speechsdk.ResultReason.TranslatedSpeech:
            f'Recognized "{from_language}": {translation_recognition_result.text}\n' +
            f'Translated into "{to_language}"": {translation_recognition_result.translations[to_language]}',
        speechsdk.ResultReason.RecognizedSpeech: f'Recognized: "{translation_recognition_result.text}"',
        speechsdk.ResultReason.NoMatch: f'No speech could be recognized: {translation_recognition_result.no_match_details}',
        speechsdk.ResultReason.Canceled: f'Speech Recognition canceled: {translation_recognition_result.cancellation_details}'
    }
    return reason_format.get(reason, 'Unable to recognize speech')

translate_speech_to_text()