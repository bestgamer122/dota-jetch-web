/* DOTA JETCH — BRAIN EXTERNAL BRIDGE v4.0
   Мост между локальным brain и внешней нейросетью (мульти-провайдер). */

var BrainExternalBridge = {

  ask: function (query, onLocalAnswer, onExternalStart, onExternalAnswer, onExternalError) {
    var q = String(query || "").trim();
    if (!q) return;

    var localAnswer = null;
    try {
      localAnswer = brainAnswer(q);
    } catch (e) {
      console.warn("brainAnswer error:", e);
    }

    if (localAnswer && localAnswer.text) {
      if (onLocalAnswer) onLocalAnswer(localAnswer);
    }

    if (!ExternalAI.shouldUseExternal(q, localAnswer)) {
      return;
    }

    if (onExternalStart) onExternalStart();

    var matchCtx = ExternalAI.buildMatchContext();
    ExternalAI.ask(q, matchCtx)
      .then(function (externalText) {
        if (onExternalAnswer) onExternalAnswer(externalText, localAnswer);
      })
      .catch(function (err) {
        console.warn("External AI failed:", err);
        if (onExternalError) onExternalError(err, localAnswer);
      });
  },

  status: function () {
    return {
      enabled: ExternalAI.enabled,
      busy: ExternalAI.busy,
      lastError: ExternalAI.lastError
    };
  }
};

console.log("brain-external-bridge v4.0 ready (multi-provider)");
