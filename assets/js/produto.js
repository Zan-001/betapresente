/* Beta Presentes — página de produto: o visor de ângulos e as miniaturas */
(function () {
  "use strict";

  var caixa = document.getElementById("visor");
  var minis = Array.prototype.slice.call(document.querySelectorAll(".miniaturas button"));

  function marcar(i) {
    minis.forEach(function (b, k) { b.setAttribute("aria-pressed", String(k === i)); });
  }

  if (caixa && window.Visor) {
    var fotos;
    try { fotos = JSON.parse(caixa.getAttribute("data-fotos")); } catch (e) { fotos = []; }

    var visor = window.Visor.montar(caixa, {
      id: Number(caixa.getAttribute("data-id")),
      legenda: caixa.getAttribute("data-legenda") || "",
      fotos: fotos,
      aoMudar: marcar
    });

    if (visor) {
      minis.forEach(function (b, i) {
        b.addEventListener("click", function () { visor.ir(i); marcar(i); });
      });

      var tira = document.querySelector(".miniaturas");
      if (tira && minis.length > 1) {
        tira.addEventListener("keydown", function (e) {
          var i = minis.findIndex(function (o) { return o.getAttribute("aria-pressed") === "true"; });
          var j = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : -1;
          if (j < 0 || j >= minis.length) return;
          minis[j].click();
          minis[j].focus();
          e.preventDefault();
        });
      }
      return;
    }
  }

  /* sem visor: uma foto só, as miniaturas apenas trocam a imagem grande */
  var grande = document.getElementById("foto-grande");
  minis.forEach(function (b, i) {
    b.addEventListener("click", function () {
      if (grande) grande.src = b.getAttribute("data-foto");
      marcar(i);
    });
  });
})();
