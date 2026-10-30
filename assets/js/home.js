/* Beta Presentes — página inicial: o visor de ângulos e o seletor de arranjos */
(function () {
  "use strict";

  var caixa = document.getElementById("visor-home");
  if (!caixa || !window.Visor) return;

  var escolhas = Array.prototype.slice.call(document.querySelectorAll(".visor-escolha button"));
  var pontos = document.getElementById("visor-pontos");
  var titulo = document.getElementById("visor-titulo");
  var link = document.getElementById("visor-link");
  var visor = null;

  function lerDados(b) {
    return {
      fotos: JSON.parse(b.getAttribute("data-fotos")),
      id: Number(b.getAttribute("data-id")),
      nome: b.getAttribute("data-nome"),
      preco: b.getAttribute("data-preco"),
      href: b.getAttribute("data-href")
    };
  }

  function desenharPontos(total) {
    if (!pontos) return;
    pontos.innerHTML = "";
    for (var i = 0; i < total; i++) {
      (function (k) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", "Ângulo " + (k + 1));
        b.setAttribute("aria-pressed", String(k === 0));
        b.addEventListener("click", function () {
          if (visor) visor.ir(k);
          marcar(k);
        });
        pontos.appendChild(b);
      })(i);
    }
  }

  function marcar(i) {
    if (!pontos) return;
    Array.prototype.forEach.call(pontos.children, function (b, k) {
      b.setAttribute("aria-pressed", String(k === i));
    });
  }

  function trocar(dados) {
    caixa.innerHTML = "";
    caixa.className = "visor";
    visor = window.Visor.montar(caixa, {
      id: dados.id,
      legenda: dados.nome,
      fotos: dados.fotos,
      aoMudar: marcar
    });
    if (titulo) titulo.textContent = dados.nome + " · " + dados.preco;
    if (link) {
      link.href = dados.href;
      link.textContent = "Ver " + dados.nome;
    }
    desenharPontos(dados.fotos.length);
    if (!visor) caixa.setAttribute("hidden", "hidden");
  }

  if (!escolhas.length) return;
  trocar(lerDados(escolhas[0]));

  escolhas.forEach(function (b) {
    b.addEventListener("click", function () {
      escolhas.forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
      trocar(lerDados(b));
    });
  });
})();
